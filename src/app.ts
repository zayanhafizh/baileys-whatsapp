// src/app.ts
import 'module-alias/register';

import express from 'express';
import { config } from 'dotenv';
import { sessionRoutes, messageRoutes, legacyRoutes } from '@/routes';
import { errorHandler, notFoundHandler, requestLogger, corsHeaders } from '@/middleware';

// Load env (lokal/CLI). Di Vercel env sudah diinject.
config();

const app = express();

app.use(express.json());
app.use(requestLogger);
app.use(corsHeaders);

// Endpoint sederhana buat health check
app.get('/health', (req, res) => {
  res.json({ ok: true, env: process.env.NODE_ENV });
});

// Registrasi routes utama kamu
app.use('/', sessionRoutes);
app.use('/', messageRoutes);
app.use('/', legacyRoutes);

// Error handlers
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
