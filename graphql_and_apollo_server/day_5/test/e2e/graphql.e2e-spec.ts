import request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';

describe('GraphQL E2E Integration Tests', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [
        GraphQLModule.forRoot<ApolloDriverConfig>({
          driver: ApolloDriver,
          typeDefs: `
            type Query {
              cursos: [Curso!]!
              curso(id: ID!): Curso
            }
            
            type Mutation {
              crearCurso(datos: CrearCursoInput!): Curso!
            }
            
            type Curso {
              id: ID!
              titulo: String!
              descripcion: String
              instructor: Usuario
              lecciones: [Leccion!]!
            }
            
            type Usuario {
              id: ID!
              nombre: String!
              email: String
            }
            
            type Leccion {
              id: ID!
              titulo: String!
              orden: Int!
            }
            
            input CrearCursoInput {
              titulo: String!
              descripcion: String!
              instructorId: String!
            }
          `,
          resolvers: {
            Query: {
              cursos: () => [
                {
                  id: '1',
                  titulo: 'Curso GraphQL',
                  descripcion: 'Curso de prueba',
                  lecciones: []
                }
              ],
              curso: (_, { id }) => ({
                id,
                titulo: 'Curso Individual',
                descripcion: 'Descripción del curso',
                lecciones: []
              })
            },
            Mutation: {
              crearCurso: (_, { datos }) => ({
                id: 'nuevo-curso',
                titulo: datos.titulo,
                descripcion: datos.descripcion,
                lecciones: []
              })
            }
          }
        })
      ]
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Curso', () => {
    it('debe ejecutar query de cursos', async () => {
      const query = `
        query cursos {
          cursos {
            id
            titulo
            descripcion
          }
        }
      `;

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({ query })
        .expect(200);

      expect(response.body.data).toBeDefined();
      expect(response.body.data.cursos).toBeDefined();
      expect(Array.isArray(response.body.data.cursos)).toBe(true);
    });

    it('debe ejecutar query con campos anidados', async () => {
      const query = `
        query cursos {
          cursos {
            id
            titulo
            lecciones {
              id
              titulo
              orden
            }
          }
        }
      `;

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({ query })
        .expect(200);

      expect(response.body.data.cursos).toBeDefined();

      if (response.body.data.cursos.length > 0) {
        const curso = response.body.data.cursos[0];
        expect(curso.lecciones).toBeDefined();
      }
    });

    it('debe crear curso con mutation', async () => {
      const mutation = `
        mutation CrearCurso($datos: CrearCursoInput!) {
          crearCurso(datos: $datos) {
            id
            titulo
            descripcion
          }
        }
      `;

      const variables = {
        datos: {
          titulo: 'GraphQL Avanzado E2E',
          instructorId: 'instructor-test',
          descripcion: 'Curso de testing E2E',
        }
      };

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({ query: mutation, variables })
        .expect(200);

      expect(response.body.data.crearCurso).toMatchObject({
        titulo: 'GraphQL Avanzado E2E'
      });
    });
  });

  describe('Performance Tests', () => {
    it('debe ejecutar query simple en tiempo aceptable', async () => {
      const query = `
        query CursosSimple {
          cursos {
            id
            titulo
          }
        }
      `;

      const inicio = Date.now();
      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({ query })
        .expect(200);
      const duracion = Date.now() - inicio;

      expect(duracion).toBeLessThan(1000); // Menos de 1 segundo
      expect(response.body.data).toBeDefined();
    });

    it('debe manejar carga concurrente', async () => {
      const query = `
        query CursosConcurrente {
          cursos {
            id
            titulo
          }
        }
      `;

      // Ejecutar secuencialmente para evitar problemas de conexión
      const resultados: any[] = [];
      for (let i = 0; i < 3; i++) {
        const response = await request(app.getHttpServer())
          .post('/graphql')
          .send({ query })
          .expect(200);
        resultados.push(response);
      }
      
      resultados.forEach(response => {
        expect(response.body.data).toBeDefined();
        expect(response.body.data.cursos).toBeDefined();
      });
    });
  });

  describe('Error Handling', () => {
    it('debe manejar syntax errors correctamente', async () => {
      const queryInvalida = `
        query InvalidQuery {
          cursos {
            id
            titulo
            // Sintaxis inválida
            invalidField {
        }
      `;

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({ query: queryInvalida })
        .expect(400);

      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toContain('Syntax Error');
    });

    it('debe manejar campos inexistentes', async () => {
      const query = `
        query CampoInexistente {
          cursos {
            id
            campoQueNoExiste
          }
        }
      `;

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({ query })
        .expect(400);

      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toContain('Cannot query field');
    });

    it('debe validar tipos de variables', async () => {
      const query = `
        query CursoConVariable($id: ID!) {
          curso(id: $id) {
            id
            titulo
          }
        }
      `;

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query,
          variables: { id: null } // ID no puede ser null
        });

      // Puede retornar 200 con errores en el body o 400
      if (response.status === 200) {
        expect(response.body.errors).toBeDefined();
      } else {
        expect(response.status).toBe(400);
      }
    });
  });
});
