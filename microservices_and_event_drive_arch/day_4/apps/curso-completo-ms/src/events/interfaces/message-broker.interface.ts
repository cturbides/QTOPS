import { PublishEventDto } from '../dtos/publish-event.dto';
import { ConsumerConfig } from './consumer-config.interface';

export interface MessageBrokerService {
  inicializar(): Promise<void>;
  publicarEvento(evento: PublishEventDto): Promise<void>;
  crearConsumidor(config: ConsumerConfig): Promise<void>;
}
