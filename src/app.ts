// src/app.ts
import express from 'express';
import { config } from 'dotenv';

import { sessionRoutes, messageRoutes, legacyRoutes } from '@/routes';
import {
  errorHandler,
  notFoundHandler,
  requestLogger,
  corsHeaders,
} from '@/middleware';

config();

const app = express();

app.use(express.json());
app.use(requestLogger);
app.use(corsHeaders);

// health check
app.get('/health', (_req, res) => {
  res.json({ ok: true, env: process.env.NODE_ENV });
});

// routes utama
app.use('/', sessionRoutes);
app.use('/', messageRoutes);
app.use('/', legacyRoutes);

// error handlers
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
