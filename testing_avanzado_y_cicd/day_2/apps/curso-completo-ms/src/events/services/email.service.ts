import { Injectable } from '@nestjs/common';
import { EmailConfirmacionInscripcion } from '../interfaces/email-confirmacion-inscripcion.interface';

@Injectable()
export class EmailService {
  async enviarConfirmacionInscripcion(data: EmailConfirmacionInscripcion): Promise<void> {
    console.log(`Enviando confirmación de inscripción por email:`);
    console.log(`- Usuario: ${data.usuarioId}`);
    console.log(`- Cursos: ${data.cursos.join(', ')}`);
    console.log(`- Monto total: $${data.monto}`);
    
    // Simulación de envío de email
    await new Promise(resolve => setTimeout(resolve, 800));
    
    console.log('Email de confirmación enviado exitosamente');
  }
  
  async enviarEmailRechazo(usuarioId: string, razon: string): Promise<void> {
    console.log(`Enviando email de rechazo a usuario ${usuarioId}`);
    console.log(`Razón: ${razon}`);
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    console.log('Email de rechazo enviado');
  }
  
  async enviarCertificado(usuarioId: string, cursoId: string): Promise<void> {
    console.log(`Enviando certificado del curso ${cursoId} al usuario ${usuarioId}`);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('Certificado enviado por email');
  }
}
