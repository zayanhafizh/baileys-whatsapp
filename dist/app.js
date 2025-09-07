"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = require("dotenv");
const routes_1 = require("@/routes");
const middleware_1 = require("@/middleware");
(0, dotenv_1.config)();
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use(middleware_1.requestLogger);
app.use(middleware_1.corsHeaders);
app.get('/health', (_req, res) => {
    res.json({ ok: true, env: process.env.NODE_ENV });
});
app.use('/', routes_1.sessionRoutes);
app.use('/', routes_1.messageRoutes);
app.use('/', routes_1.legacyRoutes);
app.use(middleware_1.notFoundHandler);
app.use(middleware_1.errorHandler);
exports.default = app;
//# sourceMappingURL=app.js.map