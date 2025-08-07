import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NestTypeOrmConfig } from '@config/database';
import { CursoCompletoModule } from '@curso-completo/curso-completo.module';

@Module({
    imports: [
        TypeOrmModule.forRoot(NestTypeOrmConfig),
        CursoCompletoModule,
    ]
})
export class AppModule { }
