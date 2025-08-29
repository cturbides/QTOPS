import { EstadoInscripcion } from '../enums/estado-inscripcion.enum';

export class InscripcionSaga {
  private pasos: string[] = [];
  private estado: EstadoInscripcion = EstadoInscripcion.PENDIENTE;
  
  constructor(
    public readonly inscripcionId: string
  ) {}
  
  agregarPaso(paso: string): void {
    this.pasos.push(paso);
    console.log(`Saga ${this.inscripcionId}: Ejecutando paso - ${paso}`);
  }
  
  marcarExitoso(): void {
    this.estado = EstadoInscripcion.CONFIRMADA;
    console.log(`Saga ${this.inscripcionId}: Completada exitosamente`);
  }
  
  marcarFallido(razon: string): void {
    this.estado = EstadoInscripcion.RECHAZADA;
    console.log(`Saga ${this.inscripcionId}: Falló - ${razon}`);
  }
  
  obtenerPasosEjecutados(): string[] {
    return [...this.pasos];
  }
  
  obtenerEstado(): EstadoInscripcion {
    return this.estado;
  }
}
