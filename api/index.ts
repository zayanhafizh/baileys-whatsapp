// api/index.js
const path = require('path');

// ⛳️ Map alias "@/..." ke HASIL BUILD: dist/**  (bukan dist/src/**)
require('module-alias')({
  '@': path.join(__dirname, '../dist'),
});

const serverless = require('serverless-http');
// app.ts -> dist/app.js, jadi require ke ../dist/app
const app = require('../dist/app').default;

module.exports = serverless(app);
