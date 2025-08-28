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
exports.CursoCompleto = void 0;
require("reflect-metadata");
const etiqueta_entity_1 = require("./etiqueta.entity");
const evaluacion_entity_1 = require("./evaluacion.entity");
const instructor_entity_1 = require("./instructor.entity");
const detalle_curso_entity_1 = require("./detalle-curso.entity");
const class_validator_1 = require("class-validator");
const leccion_completa_entity_1 = require("./leccion-completa.entity");
const base_entity_template_1 = require("./templates/base-entity.template");
const typeorm_1 = require("typeorm");
let CursoCompleto = class CursoCompleto extends base_entity_template_1.BaseEntity {
};
exports.CursoCompleto = CursoCompleto;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], CursoCompleto.prototype, "id", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, typeorm_1.Column)({ type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], CursoCompleto.prototype, "activo", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 200 }),
    (0, class_validator_1.IsNotEmpty)({ message: 'El título es obligatorio' }),
    (0, class_validator_1.MinLength)(5, { message: 'El título debe tener al menos 5 caracteres' }),
    __metadata("design:type", String)
], CursoCompleto.prototype, "titulo", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'La descripción es obligatoria' }),
    __metadata("design:type", String)
], CursoCompleto.prototype, "descripcion", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => detalle_curso_entity_1.DetalleCurso, detalle => detalle.curso, { cascade: true }),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", detalle_curso_entity_1.DetalleCurso)
], CursoCompleto.prototype, "detalle", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => leccion_completa_entity_1.LeccionCompleta, leccion => leccion.curso, { cascade: true }),
    __metadata("design:type", Array)
], CursoCompleto.prototype, "lecciones", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => etiqueta_entity_1.Etiqueta, etiqueta => etiqueta.cursos),
    (0, typeorm_1.JoinTable)({ name: 'curso_etiquetas' }),
    __metadata("design:type", Array)
], CursoCompleto.prototype, "etiquetas", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => instructor_entity_1.Instructor, instructor => instructor.cursos),
    __metadata("design:type", instructor_entity_1.Instructor)
], CursoCompleto.prototype, "instructor", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => evaluacion_entity_1.Evaluacion, evaluacion => evaluacion.curso, { cascade: true }),
    __metadata("design:type", Array)
], CursoCompleto.prototype, "evaluaciones", void 0);
exports.CursoCompleto = CursoCompleto = __decorate([
    (0, typeorm_1.Entity)('cursos_completos')
], CursoCompleto);
