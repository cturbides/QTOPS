import { GraphQLError } from 'graphql';
import { dataSource } from '@modules/curso/data-source';
import { AuditLoggingService } from './audit-logging.service';
import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { RolUsuario } from '@modules/curso/entities/auth/rol-usuario.enum';
import { RateLimitResult } from '@modules/curso/entities/auth/rate-limit-result.interface';
import { UsuarioAutenticado } from '@modules/curso/entities/auth/usuario-autenticado.interface';
import { DEFAULT_WINDOW_TIME, defaultLimits, LimitesBasePorRol, MILLISECONDS_PER_SECONDS } from '@modules/curso/common/security.constants';

@Injectable()
export class GraphQLRateLimitService {
  constructor(
    @Inject(forwardRef(() => AuditLoggingService))
    private readonly auditService: AuditLoggingService
  ) { }

  async verificarLimites(
    usuario: UsuarioAutenticado | null,
    complejidadConsulta: number,
    ip: string
  ): Promise<RateLimitResult> {
    const identificador = usuario ? `user:${usuario.id}` : `ip:${ip}`;

    const rol = usuario?.roles?.[0] || RolUsuario.ESTUDIANTE;

    const limites = LimitesBasePorRol[rol] || defaultLimits;

    const ahora = Math.floor(Date.now() / MILLISECONDS_PER_SECONDS);
    const ventanaActual = Math.floor(ahora / DEFAULT_WINDOW_TIME);

    const keyPeticiones = `requests:${identificador}:${ventanaActual}`;
    const keyComplejidad = `complexity:${identificador}:${ventanaActual}`;

    const peticionesActuales = dataSource.rateLimitStorage.get(keyPeticiones) || 0;
    const complejidadActual = dataSource.rateLimitStorage.get(keyComplejidad) || 0;

    dataSource.rateLimitStorage.set(keyPeticiones, peticionesActuales + 1);
    dataSource.rateLimitStorage.set(keyComplejidad, complejidadActual + complejidadConsulta);

    setTimeout(() => {
      dataSource.rateLimitStorage.delete(keyPeticiones);
      dataSource.rateLimitStorage.delete(keyComplejidad);
    }, DEFAULT_WINDOW_TIME * 2 * 1000);

    const excedePeticiones = (peticionesActuales + 1) > limites.peticionesPorMinuto;
    const excedeComplejidad = (complejidadActual + complejidadConsulta) > limites.complejidadPorMinuto;

    if (excedePeticiones || excedeComplejidad) {
      const tiempoReset = (ventanaActual + 1) * DEFAULT_WINDOW_TIME;

      // Log del rate limit si el audit service está disponible
      await this.auditService.logRateLimit({
        usuario,
        ip,
        currentRequests: peticionesActuales + 1,
        maxRequests: limites.peticionesPorMinuto,
        currentComplexity: complejidadActual + complejidadConsulta,
        maxComplexity: limites.complejidadPorMinuto
      });

      throw new GraphQLError('Límite de velocidad excedido', {
        extensions: {
          resetTime: tiempoReset,
          code: 'RATE_LIMIT_EXCEEDED',
          peticionesActuales: peticionesActuales + 1,
          limitePeticiones: limites.peticionesPorMinuto,
          limiteComplejidad: limites.complejidadPorMinuto,
          complejidadActual: complejidadActual + complejidadConsulta,
        }
      });
    }

    return {
      permitida: true,
      resetTime: (ventanaActual + 1) * DEFAULT_WINDOW_TIME,
      peticionesRestantes: limites.peticionesPorMinuto - (peticionesActuales + 1),
      complejidadRestante: limites.complejidadPorMinuto - (complejidadActual + complejidadConsulta),
    };
  }
}
