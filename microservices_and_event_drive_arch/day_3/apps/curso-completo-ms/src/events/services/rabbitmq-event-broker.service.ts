import * as amqp from "amqplib";
import { v4 as uuidv4 } from 'uuid';
import { Injectable } from '@nestjs/common';
import { PublishEventDto } from '../dtos/publish-event.dto';
import { MessageWrapper } from '../wrappers/message.wrapper';
import { ConsumerConfig } from '../interfaces/consumer-config.interface';
import { MessageBrokerService } from '../interfaces/message-broker.interface';
import { MessageDeliveryException } from '../exceptions/message-delivery.exception';

@Injectable()
export class RabbitMQEventBroker implements MessageBrokerService {
  private connection: any;
  private channel: any;

  async inicializar(): Promise<void> {
    const connectionString = `amqp://${process.env.RABBITMQ_USER || 'admin'}:${process.env.RABBITMQ_PASS || 'password'}@${process.env.RABBITMQ_HOST || 'localhost'}:${parseInt(process.env.RABBITMQ_PORT) || 5672}${process.env.RABBITMQ_VHOST || '/'}`;

    this.connection = await amqp.connect(connectionString);
    this.channel = await this.connection.createChannel();

    await this.channel.prefetch(10);

    await this.channel.assertExchange('domain-events', 'topic', {
      durable: true,
      autoDelete: false
    });

    await this.channel.assertExchange('domain-events-dlx', 'direct', {
      durable: true
    });

    console.log('RabbitMQ broker inicializado correctamente');
  }

  async publicarEvento(evento: PublishEventDto): Promise<void> {
    const mensaje = {
      ...evento.message,
      publishedAt: new Date(),
      correlationId: evento.correlationId || uuidv4()
    };

    const opciones = {
      persistent: true,
      timestamp: Date.now(),
      messageId: uuidv4(),
      correlationId: mensaje.correlationId,
      headers: {
        'event-type': evento.message.eventType,
        'source-service': process.env.SERVICE_NAME || 'unknown',
        'retry-count': 0
      },
      ...evento.options
    };

    const publicado = this.channel.publish(
      evento.exchange,
      evento.routingKey,
      Buffer.from(JSON.stringify(mensaje)),
      opciones
    );

    if (!publicado) {
      throw new MessageDeliveryException(
        'No se pudo publicar el evento - buffer del canal lleno'
      );
    }
  }

  async crearConsumidor(config: ConsumerConfig): Promise<void> {
    const queueInfo = await this.channel.assertQueue(config.queue, {
      durable: true,
      exclusive: false,
      autoDelete: false,
      arguments: {
        'x-message-ttl': 24 * 60 * 60 * 1000,
        'x-dead-letter-exchange': 'domain-events-dlx',
        'x-dead-letter-routing-key': `failed.${config.queue}`
      }
    });

    await this.channel.bindQueue(config.queue, config.exchange, config.routingKey);

    await this.channel.consume(config.queue, async (mensaje) => {
      if (!mensaje) return;

      try {
        const contenido = JSON.parse(mensaje.content.toString());
        const wrapper = new MessageWrapper(mensaje, contenido);

        await config.handler(wrapper);

      } catch (error) {
        console.error(`Error en consumer ${config.queue}:`, error);

        const retryCount = mensaje.properties.headers?.['retry-count'] || 0;

        if (retryCount < 3) {
          mensaje.properties.headers['retry-count'] = retryCount + 1;
          this.channel.nack(mensaje, false, true);
        } else {
          this.channel.nack(mensaje, false, false);
        }
      }
    });
  }
}
