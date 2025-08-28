"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceCommunicationException = void 0;
class ServiceCommunicationException extends Error {
    constructor(message) {
        super(message);
        this.name = 'ServiceCommunicationException';
    }
}
exports.ServiceCommunicationException = ServiceCommunicationException;
