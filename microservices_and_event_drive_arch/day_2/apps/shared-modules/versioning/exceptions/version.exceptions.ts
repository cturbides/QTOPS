import { HttpException, HttpStatus } from '@nestjs/common';

export class UnsupportedVersionException extends HttpException {
    constructor(version: string, supportedVersions: string[]) {
        super(
            {
                error: 'Unsupported API Version',
                message: `Version ${version} is not supported. Supported versions: ${supportedVersions.join(', ')}`,
                supportedVersions,
                requestedVersion: version,
                statusCode: HttpStatus.BAD_REQUEST,
            },
            HttpStatus.BAD_REQUEST,
        );
    }
}

export class DeprecatedVersionException extends HttpException {
    constructor(version: string, deprecationDate: Date, endOfLifeDate?: Date) {
        super(
            {
                warning: 'Deprecated API Version',
                message: `Version ${version} is deprecated since ${deprecationDate.toISOString()}`,
                deprecationDate: deprecationDate.toISOString(),
                endOfLifeDate: endOfLifeDate?.toISOString(),
                requestedVersion: version,
                statusCode: HttpStatus.OK,
            },
            HttpStatus.OK,
        );
    }
}

export class ServiceVersionNotFoundException extends HttpException {
    constructor(serviceName: string, version: string) {
        super(
            {
                error: 'Service Version Not Found',
                message: `No healthy instances found for service ${serviceName} version ${version}`,
                serviceName,
                requestedVersion: version,
                statusCode: HttpStatus.SERVICE_UNAVAILABLE,
            },
            HttpStatus.SERVICE_UNAVAILABLE,
        );
    }
}
