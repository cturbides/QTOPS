import axios, { AxiosInstance, AxiosResponse } from 'axios';

export interface CursoCompleto {
  id: string;
  titulo: string;
  descripcion: string;
  activo: boolean;
  instructor: {
    id: string;
    nombre: string;
    email: string;
  };
  etiquetas: Array<{
    id: string;
    nombre: string;
  }>;
}

export interface BusquedaResponse {
  cursos: CursoCompleto[];
  total: number;
  pagina: number;
  limite: number;
  tiempo_respuesta: number;
}

export interface MetricasPerformance {
  tiempo_respuesta: number;
  timestamp: Date;
  endpoint: string;
  status_code: number;
}

export class CursoApiClient {
  private client: AxiosInstance;
  private metricas: MetricasPerformance[] = [];

  constructor(baseURL: string = 'http://localhost:3000') {
    this.client = axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'E2E-Test-Client/1.0'
      }
    });

    // Interceptor para métricas de performance
    this.client.interceptors.request.use((config) => {
      config.metadata = { startTime: Date.now() };
      return config;
    });

    this.client.interceptors.response.use(
      (response) => {
        this.registrarMetrica(response);
        return response;
      },
      (error) => {
        if (error.response) {
          this.registrarMetrica(error.response);
        }
        return Promise.reject(error);
      }
    );
  }

  private registrarMetrica(response: AxiosResponse): void {
    const config = response.config as any;
    const tiempo_respuesta = Date.now() - config.metadata.startTime;
    
    this.metricas.push({
      tiempo_respuesta,
      timestamp: new Date(),
      endpoint: config.url || '',
      status_code: response.status
    });
  }

    // **GESTIÓN DE CURSOS**
  async buscarCursos(termino: string, opciones?: {
    limite?: number;
    offset?: number;
    categoria?: string;
  }): Promise<BusquedaResponse> {
    const startTime = Date.now();
    const params = new URLSearchParams();
    params.append('textoBusqueda', termino);
    
    if (opciones?.limite) params.append('limit', opciones.limite.toString());
    if (opciones?.offset) params.append('offset', opciones.offset.toString());
    if (opciones?.categoria) params.append('categoria', opciones.categoria);

    const response = await this.client.get(`/cursos/search/advanced?${params}`);
    
    // El endpoint devuelve directamente un array, lo adaptamos a la estructura esperada
    const cursos = response.data;
    return {
      cursos: cursos,
      total: cursos.length,
      pagina: 1,
      limite: opciones?.limite || cursos.length,
      tiempo_respuesta: Date.now() - startTime
    };
  }

  async obtenerCurso(id: string): Promise<CursoCompleto> {
    const response = await this.client.get(`/cursos/${id}`);
    return response.data;
  }

  async crearCurso(datosCurso: {
    titulo: string;
    descripcion: string;
    instructorId: string;
    etiquetaIds?: string[];
  }): Promise<CursoCompleto> {
    const response = await this.client.post('/cursos', datosCurso);
    return response.data;
  }

  // **GESTIÓN DE INSTRUCTORES**
  async crearInstructor(datosInstructor: {
    nombre: string;
    email: string;
    biografia?: string;
  }): Promise<any> {
    const response = await this.client.post('/cursos/instructores', datosInstructor);
    return response.data;
  }

  // **GESTIÓN DE ETIQUETAS**
  async crearEtiqueta(datosEtiqueta: {
    nombre: string;
  }): Promise<any> {
    const response = await this.client.post('/cursos/etiquetas', datosEtiqueta);
    return response.data;
  }

  // **EVALUACIONES**
  async crearEvaluacion(cursoId: string, evaluacion: {
    puntuacion: number;
    comentario: string;
  }): Promise<any> {
    const response = await this.client.post(`/cursos/${cursoId}/evaluaciones`, evaluacion);
    return response.data;
  }

  // **HEALTH CHECKS**
  async verificarSalud(): Promise<{
    status: string;
    checks: Record<string, boolean>;
    timestamp: string;
  }> {
    const response = await this.client.get('/health');
    return response.data;
  }

  // **MÉTRICAS Y PERFORMANCE**
  obtenerMetricas(): MetricasPerformance[] {
    return [...this.metricas];
  }

  limpiarMetricas(): void {
    this.metricas = [];
  }

  obtenerPromedioTiempoRespuesta(): number {
    if (this.metricas.length === 0) return 0;
    const suma = this.metricas.reduce((acc, metrica) => acc + metrica.tiempo_respuesta, 0);
    return suma / this.metricas.length;
  }

  obtenerPercentil95(): number {
    if (this.metricas.length === 0) return 0;
    const tiempos = this.metricas
      .map(m => m.tiempo_respuesta)
      .sort((a, b) => a - b);
    const indice = Math.ceil(tiempos.length * 0.95) - 1;
    return tiempos[indice] || 0;
  }
}
