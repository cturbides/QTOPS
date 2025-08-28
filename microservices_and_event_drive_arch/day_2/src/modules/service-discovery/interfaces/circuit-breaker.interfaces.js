"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CircuitState = void 0;
var CircuitState;
(function (CircuitState) {
    CircuitState["OPEN"] = "OPEN";
    CircuitState["CLOSED"] = "CLOSED";
    CircuitState["HALF_OPEN"] = "HALF_OPEN"; // Circuito semi-abierto - permite intentos limitados
})(CircuitState || (exports.CircuitState = CircuitState = {}));
