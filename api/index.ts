// api/index.ts
import serverless from 'serverless-http';

// Penting: aktifkan resolver path alias dari tsconfig
import 'tsconfig-paths/register';

import app from '../src/app';

export default serverless(app);
