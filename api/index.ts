import serverless from 'serverless-http';

// Penting bila pakai path alias dari tsconfig (runtime TS di Vercel)
import 'tsconfig-paths/register';
import 'module-alias/register';

import app from '../src/app';

export default serverless(app);
