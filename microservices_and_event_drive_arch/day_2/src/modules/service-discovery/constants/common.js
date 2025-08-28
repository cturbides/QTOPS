"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceType = exports.COURSE_CONTENT_ACCESSIBILITY_CHECK_NAME = exports.DATABASE_CONNECTION_CHECK_NAME = exports.DEFAULT_CONSUL_PORT = exports.DEFAULT_CONSUL_HOST = exports.DEFAULT_TTL_PER_MSG = void 0;
// Service Discovery Constants
exports.DEFAULT_TTL_PER_MSG = 5000; // 5 seconds
exports.DEFAULT_CONSUL_HOST = 'localhost';
exports.DEFAULT_CONSUL_PORT = 8500;
// Health Check Constants
exports.DATABASE_CONNECTION_CHECK_NAME = 'database-connection';
exports.COURSE_CONTENT_ACCESSIBILITY_CHECK_NAME = 'course-content-accessibility';
// Service Types
var ServiceType;
(function (ServiceType) {
    ServiceType["COURSE_SERVICE"] = "course-service";
    ServiceType["CATALOG_SERVICE"] = "catalog-service";
    ServiceType["USER_SERVICE"] = "user-service";
    ServiceType["NOTIFICATION_SERVICE"] = "notification-service";
})(ServiceType || (exports.ServiceType = ServiceType = {}));
