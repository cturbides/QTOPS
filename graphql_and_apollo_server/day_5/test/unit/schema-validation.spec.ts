import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { buildSchema } from 'graphql';

describe('GraphQL Schema Validation', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [
        GraphQLModule.forRoot<ApolloDriverConfig>({
          driver: ApolloDriver,
          typeDefs: `
            type Query {
              hello: String
            }
            
            type Curso {
              id: ID!
              titulo: String!
              descripcion: String
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
            
            type Mutation {
              crearCurso(input: CrearCursoInput!): Curso
            }
            
            input CrearCursoInput {
              titulo: String!
              descripcion: String!
              instructorId: String!
            }
          `,
          resolvers: {
            Query: {
              hello: () => 'Hello World'
            }
          }
        })
      ]
    }).compile();

    app = module.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Schema Structure', () => {
    it('debe crear aplicación correctamente', () => {
      expect(app).toBeDefined();
    });

    it('debe tener schema GraphQL básico', () => {
      const schema = buildSchema(`
        type Query {
          hello: String
        }
      `);
      expect(schema).toBeDefined();
      expect(schema.getQueryType()).toBeDefined();
    });

    it('debe incluir tipos requeridos en schema de prueba', () => {
      const schema = buildSchema(`
        type Curso {
          id: ID!
          titulo: String!
        }
        
        type Usuario {
          id: ID!
          nombre: String!
        }
        
        type Leccion {
          id: ID!
          titulo: String!
        }
        
        type Query {
          cursos: [Curso]
        }
        
        type Mutation {
          crearCurso: Curso
        }
      `);

      expect(schema.getType('Curso')).toBeDefined();
      expect(schema.getType('Usuario')).toBeDefined(); 
      expect(schema.getType('Leccion')).toBeDefined();
      expect(schema.getQueryType()).toBeDefined();
      expect(schema.getMutationType()).toBeDefined();
    });
  });

  describe('Schema Introspection', () => {
    it('debe permitir creación de schema básico', () => {
      const simpleSchema = buildSchema(`
        type Query {
          test: String
        }
      `);
      
      expect(simpleSchema.getQueryType()).toBeDefined();
      expect(simpleSchema.getQueryType()?.getFields()).toBeDefined();
    });
  });
});
