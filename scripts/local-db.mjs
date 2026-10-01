import { PGlite } from '@electric-sql/pglite';
import { PGLiteSocketServer } from '@electric-sql/pglite-socket';
import { mkdir } from 'node:fs/promises';
await mkdir('.local', { recursive: true });
const db = await PGlite.create('.local/postgres');
const server = new PGLiteSocketServer({ db, host:'127.0.0.1', port:54329 });
await server.start();
console.log('Development PostgreSQL: 127.0.0.1:54329 (local files; not for production)');
async function stop(){await server.stop();await db.close();process.exit(0);}
process.on('SIGINT',stop);process.on('SIGTERM',stop);