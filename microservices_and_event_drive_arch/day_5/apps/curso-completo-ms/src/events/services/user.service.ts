import { Injectable } from '@nestjs/common';

@Injectable()
export class UserService {
  async agregarInscripcion(usuarioId: string, cursoId: string): Promise<void> {
    console.log(`Agregando inscripción - Usuario: ${usuarioId}, Curso: ${cursoId}`);
    
    // Simulación de actualización de base de datos
    await new Promise(resolve => setTimeout(resolve, 200));
    
    console.log('Inscripción agregada exitosamente');
  }
  
  async obtenerUsuario(usuarioId: string): Promise<any> {
    console.log(`Obteniendo información del usuario ${usuarioId}`);
    
    return {
      id: usuarioId,
      email: `usuario${usuarioId.slice(-4)}@example.com`,
      nombre: `Usuario ${usuarioId.slice(-4)}`,
      activo: true
    };
  }
  
  async validarUsuarioActivo(usuarioId: string): Promise<boolean> {
    const usuario = await this.obtenerUsuario(usuarioId);
    return usuario?.activo === true;
  }
}
