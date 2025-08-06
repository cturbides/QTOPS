// Task: Extiende la entidad CursoOnline agregando una propiedad
//  tags como array de strings y una propiedad activo como boolean
//  con valor por defecto true.

import "reflect-metadata";
import { AppDataSource } from "@config/database";
import { CursoOnline } from "@entities/curso-online.entity";
import { NivelDificultad } from "@entities/enum/nivel-dificultad.enum";

async function demostrateTypeorm() {
  try {
    await AppDataSource.initialize();
    console.log("Conexión establecida con PostgreSQL");

    const cursoRepo = AppDataSource.getRepository(CursoOnline);

    const nuevoCurso = cursoRepo.create({
      activo: true,
      precio: 49.99,
      duracionHoras: 20,
      titulo: "Introducción a TypeScript",
      nivelDificultad: NivelDificultad.PRINCIPIANTE,
      tags: ["typescript", "programación", "backend"],
      descripcion: "Curso completo para principiantes en TypeScript",
    });

    const cursoGuardado = await cursoRepo.save(nuevoCurso);
    console.log("Curso guardado:", cursoGuardado);

    const cursosConTag = await cursoRepo
      .createQueryBuilder("curso")
      .where(":tag = ANY(curso.tags)", { tag: "typescript" })
      .andWhere("curso.activo = true")
      .getMany();

    console.log("Cursos con el tag 'typescript':", cursosConTag);

    await AppDataSource.destroy();
  } catch (error) {
    console.error("Error al iniciar la aplicación:", error);
    process.exit(1);
  }
}


demostrateTypeorm();
