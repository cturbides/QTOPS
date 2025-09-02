import { Controller, Get } from '@nestjs/common';

@Controller('curso-completo')
export class CursoDiscoveryController {
    
    @Get('ping')
    async ping() {
        return {
            status: 'healthy',
            service: 'curso-completo-ms',
            timestamp: new Date().toISOString(),
            message: 'Curso Completo microservice is running'
        };
    }
}