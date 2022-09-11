import knex from 'knex';
import * as uWS from 'uWebSockets.js';
import { StringDecoder } from 'node:string_decoder';

const db = knex({
  client: 'mysql2',
  connection: {
    host: process.env.MYSQL_HOST || '127.0.0.1',
    port: parseInt(process.env.MYSQL_PORT, 10) || 3306,
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DBNAME || 'todo',
  },
  pool: {
    min: 0,
    max: 40,
    destroyTimeoutMillis: 100,
    idleTimeoutMillis: 100,
    reapIntervalMillis: 100,
    createRetryIntervalMillis: 400,
    acquireTimeoutMillis: 10000,
    createTimeoutMillis: 10000,
  },
});
const decoder = new StringDecoder('utf8');

uWS
  .App()
  .ws('/*', {
    message: async (_ws: uWS.WebSocket, message: ArrayBuffer) => {
      const json = JSON.parse(decoder.write(Buffer.from(message)));
      switch (json.type) {
        case 'ACTIVITY.POST': {
          await db('activities').insert(json.data);
          break;
        }
        case 'ACTIVITY.PATCH': {
          await db('activities')
            .where({
              id: json.data.id,
            })
            .update({ ...json.data.updateData });
          break;
        }
        case 'ACTIVITY.DELETE': {
          await db('activities')
            .where({
              id: json.data.id,
            })
            .delete();
          break;
        }
        case 'TODO.POST': {
          await db('todos').insert(json.data);
          break;
        }
        case 'TODO.PATCH': {
          await db('todos')
            .where({
              id: json.data.id,
            })
            .update({ ...json.data.updateData });
          break;
        }
        case 'TODO.DELETE': {
          await db('todos')
            .where({
              id: json.data.id,
            })
            .delete();
          break;
        }
      }
    },
  })
  .listen(9001, (listenSocket) => {
    if (listenSocket) {
      console.log('WebSocket listening to port 9001');
    }
  });
