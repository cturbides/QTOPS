import { v4 as uuidv4 } from 'uuid';
import { Injectable } from '@nestjs/common';
import { PaymentRequest } from '../interfaces/payment-request.interface';
import { PaymentResult } from '../interfaces/payment-result.interface';

@Injectable()
export class PaymentService {
  async procesarPago(request: PaymentRequest): Promise<PaymentResult> {
    // Simulación de procesamiento de pago
    console.log(`Procesando pago de $${request.monto} para usuario ${request.usuarioId}`);
    
    // Simular tiempo de procesamiento
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simular fallo ocasional (10% de probabilidad)
    if (Math.random() < 0.1) {
      return {
        exitoso: false,
        error: 'Error en el procesamiento del pago - tarjeta rechazada'
      };
    }
    
    return {
      exitoso: true,
      transactionId: uuidv4()
    };
  }
  
  async verificarDisponibilidadFondos(usuarioId: string, monto: number): Promise<boolean> {
    // Simulación de verificación de fondos
    console.log(`Verificando fondos para usuario ${usuarioId} - monto: $${monto}`);
    
    // Simular que usuarios con ID que terminan en ciertos números no tienen fondos
    const ultimoDigito = parseInt(usuarioId.slice(-1));
    return ultimoDigito % 5 !== 0; // 80% tienen fondos disponibles
  }
}
