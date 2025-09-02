import { Injectable } from '@nestjs/common';

@Injectable()
export class CourseService {
  async verificarDisponibilidad(cursoId: string, fechaInicio: Date | string): Promise<boolean> {
    const fecha = typeof fechaInicio === 'string' ? new Date(fechaInicio) : fechaInicio;
    console.log(`Verificando disponibilidad del curso ${cursoId} para fecha ${fecha.toISOString()}`);
    
    // Simulación de verificación de disponibilidad
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Simular cursos sin disponibilidad (15% de probabilidad)
    return Math.random() > 0.15;
  }
  
  async obtenerPrecioCurso(cursoId: string): Promise<number> {
    console.log(`Obteniendo precio del curso ${cursoId}`);
    
    // Simulación de precios aleatorios entre $50 y $500
    return Math.floor(Math.random() * 450) + 50;
  }
  
  async reservarCupo(cursoId: string, usuarioId: string): Promise<boolean> {
    console.log(`Reservando cupo en curso ${cursoId} para usuario ${usuarioId}`);
    
    // Simulación de reserva de cupo
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return true;
  }
}
