import { DataSource, Repository } from 'typeorm';
import { mockCacheManager } from "@tests/mock/cache-manager.mock";
import { StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { TestDatabaseConfig } from '@tests/config/test-database.config';
import { PerformanceMeasureUtil } from '@tests/utils/performance-measure.util';

import { Etiqueta } from '@modules/curso-completo/entities/etiqueta.entity';
import { CursoCompleto } from '@curso-completo/entities/curso-completo.entity';
import { Instructor } from '@modules/curso-completo/entities/instructor.entity';
import { Evaluacion } from '@modules/curso-completo/entities/evaluacion.entity';
import { CursoCompletoTestFactory } from '@tests/factories/curso-completo.factory';
import { CursoCompletoService } from '@curso-completo/services/curso-completo.service';
import { CursoCompletoAdvanceSearchDto } from '@curso-completo/dtos/curso-completo-advance-search.dto';

describe('CursoCompletoService - Performance', () => {
  let dataSource: DataSource;
  let cursoService: CursoCompletoService;
  let container: StartedPostgreSqlContainer;
  let cursoRepository: Repository<CursoCompleto>;

  beforeAll(async () => {
    const { dataSource: ds, container: ct } = await TestDatabaseConfig.startDatabase();

    container = ct;
    dataSource = ds;

    cursoRepository = dataSource.getRepository(CursoCompleto);
    const etiquetaRepository = dataSource.getRepository(Etiqueta);
    const instructorRepository = dataSource.getRepository(Instructor);
    const evaluacionRepository = dataSource.getRepository(Evaluacion);

    const cursos: CursoCompleto[] = Array.from({ length: 1000 }).map(() => CursoCompletoTestFactory.crear().construir());

    await cursoRepository.save(cursos);

    const totalCursos = await cursoRepository.count();
    console.log(`Se han guardado ${totalCursos} cursos en la base de datos.`);

    cursoService = new CursoCompletoService(
      cursoRepository,
      etiquetaRepository,
      instructorRepository,
      evaluacionRepository,
      mockCacheManager,
    );
  });

  afterAll(async () => {
    await TestDatabaseConfig.stopDatabase();
  });

  it('debe ejecutar la búsqueda avanzada en menos de 500ms', async () => {
    const params: CursoCompletoAdvanceSearchDto = {
      limit: 1000
    };

    const { result, duration } = await PerformanceMeasureUtil.measureExecutionTime(() =>
      cursoService.busquedaAvanzadaOptimizada(params)
    );

    console.log(`Duración de la consulta: ${duration}ms`);
    console.log(`Registros devueltos: ${result.length}`);

    expect(duration).toBeLessThan(500);

    expect(result.length).toBe(1000);
  });
});