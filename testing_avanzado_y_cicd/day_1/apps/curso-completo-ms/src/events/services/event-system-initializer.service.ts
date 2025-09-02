import { Injectable, OnModuleInit } from '@nestjs/common';
import { MessageBrokerService } from '../interfaces/message-broker.interface';
import { InscripcionProcessorService } from './inscripcion-processor.service';

@Injectable()
export class EventSystemInitializer implements OnModuleInit {
  constructor(
    private readonly messageBroker: MessageBrokerService,
    private readonly inscripcionProcessor: InscripcionProcessorService
  ) {}

  async onModuleInit() {
    try {
      console.log('Inicializando sistema de eventos...');
      
      // Inicializar message broker
      await this.messageBroker.inicializar();
      console.log('Message broker inicializado');
      
      // Inicializar subscribers
      await this.inscripcionProcessor.inicializarSuscripcion();
      console.log('Event handlers inicializados');
      
      console.log('Sistema de eventos listo para procesar inscripciones');
      
    } catch (error) {
      console.error('Error inicializando sistema de eventos:', error);
      throw error;
    }
  }
}
