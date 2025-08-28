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
exports.Evaluacion = void 0;
require("reflect-metadata");
const class_validator_1 = require("class-validator");
const curso_completo_entity_1 = require("./curso-completo.entity");
const base_entity_template_1 = require("./templates/base-entity.template");
const typeorm_1 = require("typeorm");
let Evaluacion = class Evaluacion extends base_entity_template_1.BaseEntity {
};
exports.Evaluacion = Evaluacion;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Evaluacion.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    (0, class_validator_1.Max)(5),
    __metadata("design:type", Number)
], Evaluacion.prototype, "puntuacion", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Evaluacion.prototype, "comentario", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => curso_completo_entity_1.CursoCompleto, curso => curso.evaluaciones, { onDelete: 'CASCADE' }),
    __metadata("design:type", curso_completo_entity_1.CursoCompleto)
], Evaluacion.prototype, "curso", void 0);
exports.Evaluacion = Evaluacion = __decorate([
    (0, typeorm_1.Entity)('evaluaciones')
], Evaluacion);
