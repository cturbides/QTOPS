"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DetalleCurso = void 0;
require("reflect-metadata");
const curso_completo_entity_1 = require("./curso-completo.entity");
const base_entity_template_1 = require("./templates/base-entity.template");
const typeorm_1 = require("typeorm");
let DetalleCurso = class DetalleCurso extends base_entity_template_1.BaseEntity {
};
exports.DetalleCurso = DetalleCurso;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], DetalleCurso.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)('text'),
    __metadata("design:type", String)
], DetalleCurso.prototype, "objetivos", void 0);
__decorate([
    (0, typeorm_1.Column)('text'),
    __metadata("design:type", String)
], DetalleCurso.prototype, "requisitos", void 0);
__decorate([
    (0, typeorm_1.Column)('text'),
    __metadata("design:type", String)
], DetalleCurso.prototype, "publicoObjetivo", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => curso_completo_entity_1.CursoCompleto, curso => curso.detalle),
    __metadata("design:type", curso_completo_entity_1.CursoCompleto)
], DetalleCurso.prototype, "curso", void 0);
exports.DetalleCurso = DetalleCurso = __decorate([
    (0, typeorm_1.Entity)('detalles_curso')
], DetalleCurso);
