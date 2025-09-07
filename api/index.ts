// api/index.ts
import 'module-alias/register';         
import serverless from 'serverless-http';
import app from '../src/app';

export default serverless(app);
