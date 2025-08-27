import { RolUsuario } from "@modules/curso/entities/auth/rol-usuario.enum";
import { ISecurityGuardRails } from "./interfaces/security-guardrails.interface";

export const DEFAULT_STUDENT_MAX_COMPLEXITY_PER_MINUTE: number = 3000;
export const DEFAULT_STUDENT_MAX_REQUESTS_PER_MINUTE: number = 60;

export const DEFAULT_INSTRUCTOR_MAX_COMPLEXITY_PER_MINUTE: number = 5000;
export const DEFAULT_INSTRUCTOR_MAX_REQUESTS_PER_MINUTE: number = 100;

export const DEFAULT_ADMIN_MAX_COMPLEXITY_PER_MINUTE: number = 20000;
export const DEFAULT_ADMIN_MAX_REQUESTS_PER_MINUTE: number = 500;

export const DEFAULT_MAX_QUERY_DEPTH: number = 500;
export const DEFAULT_MAX_QUERY_COMPLEXITY: number = 1000;
export const DEFAULT_MAX_QUERIES_PER_MINUTE: number = 50;

export const LimitesBasePorRol: Record<RolUsuario, ISecurityGuardRails> = {
    [RolUsuario.ADMINISTRADOR]: { peticionesPorMinuto: DEFAULT_ADMIN_MAX_REQUESTS_PER_MINUTE, complejidadPorMinuto: DEFAULT_ADMIN_MAX_COMPLEXITY_PER_MINUTE },
    [RolUsuario.ESTUDIANTE]: { peticionesPorMinuto: DEFAULT_STUDENT_MAX_REQUESTS_PER_MINUTE, complejidadPorMinuto: DEFAULT_STUDENT_MAX_COMPLEXITY_PER_MINUTE },
    [RolUsuario.INSTRUCTOR]: { peticionesPorMinuto: DEFAULT_INSTRUCTOR_MAX_REQUESTS_PER_MINUTE, complejidadPorMinuto: DEFAULT_INSTRUCTOR_MAX_COMPLEXITY_PER_MINUTE },
};

export const defaultLimits: ISecurityGuardRails = {
    complejidadPorMinuto: DEFAULT_MAX_QUERY_COMPLEXITY,
    peticionesPorMinuto: DEFAULT_MAX_QUERIES_PER_MINUTE,
};

export const DEFAULT_WINDOW_TIME: number = 60; // 1 minuto en segundos

export const MILLISECONDS_PER_SECONDS: number = 1000;
