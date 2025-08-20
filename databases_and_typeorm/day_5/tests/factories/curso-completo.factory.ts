import { faker } from '@faker-js/faker';
import { Etiqueta } from '@curso-completo/entities/etiqueta.entity';
import { Instructor } from '@curso-completo/entities/instructor.entity';
import { DetalleCurso } from '@curso-completo/entities/detalle-curso.entity';
import { CursoCompleto } from '@curso-completo/entities/curso-completo.entity';
import { LeccionCompleta } from '@curso-completo/entities/leccion-completa.entity';

export class CursoCompletoTestFactory {
  private curso: Partial<CursoCompleto> = {};

  static crear(): CursoCompletoTestFactory {
    return new CursoCompletoTestFactory()
      .conTituloAleatorio()
      .conDescripcionAleatoria();
  }

  conTitulo(titulo: string): CursoCompletoTestFactory {
    this.curso.titulo = titulo;
    return this;
  }

  conTituloAleatorio(): CursoCompletoTestFactory {
    this.curso.titulo = faker.lorem.words(5);
    return this;
  }

  conDescripcion(descripcion: string): CursoCompletoTestFactory {
    this.curso.descripcion = descripcion;
    return this;
  }

  conDescripcionAleatoria(): CursoCompletoTestFactory {
    this.curso.descripcion = faker.lorem.paragraph();
    return this;
  }

  conDetalle(detalle: DetalleCurso): CursoCompletoTestFactory {
    this.curso.detalle = detalle;
    return this;
  }

  conDetalleAleatorio(): CursoCompletoTestFactory {
    const detalle = new DetalleCurso();

    detalle.objetivos = faker.lorem.sentences(3);
    detalle.requisitos = faker.lorem.sentences(2);
    detalle.publicoObjetivo = faker.lorem.sentences(2);

    this.curso.detalle = detalle;

    return this;
  }

  conLecciones(lecciones: LeccionCompleta[]): CursoCompletoTestFactory {
    this.curso.lecciones = lecciones;
    return this;
  }

  conLeccionesAleatorias(): CursoCompletoTestFactory {
    this.curso.lecciones = Array.from({ length: faker.number.int({ min: 3, max: 10 }) }, () => {
      const leccion = new LeccionCompleta();

      leccion.titulo = faker.lorem.words(3);
      leccion.contenido = faker.lorem.paragraphs(2);

      return leccion;
    });

    return this;
  }

  conEtiquetas(etiquetas: Etiqueta[]): CursoCompletoTestFactory {
    this.curso.etiquetas = etiquetas;
    return this;
  }

  conEtiquetasAleatorias(): CursoCompletoTestFactory {
    this.curso.etiquetas = Array.from({ length: faker.number.int({ min: 1, max: 5 }) }, () => {
      const etiqueta = new Etiqueta();

      etiqueta.nombre = faker.lorem.word();

      return etiqueta;
    });

    return this;
  }

  conInstructor(instructor: Instructor): CursoCompletoTestFactory {
    this.curso.instructor = instructor;
    return this;
  }

  conInstructorAleatorio(): CursoCompletoTestFactory {
    const instructor = new Instructor();
    instructor.nombre = faker.person.fullName();
    instructor.email = faker.internet.email();

    this.curso.instructor = instructor;

    return this;
  }

  construir(): CursoCompleto {
    const curso = new CursoCompleto();

    Object.assign(curso, this.curso);

    return curso;
  }
}
