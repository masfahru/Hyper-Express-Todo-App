import 'dotenv/config';
import * as HyperExpress from 'hyper-express';
import * as WebSocket from 'ws';
import knex, { Knex } from 'knex';
import { ActivityRouter } from './modules/activity/router';
import { TodoRouter } from './modules/todo/router';
class Main {
  private app: HyperExpress.Server;
  private db: Knex;
  private cache = {
    activityCache: [],
    activityCacheByKey: [],
    lastActivityId: 0,
    todoCache: [],
    todoCacheByKey: [],
    lastTodoId: 0,
  };
  private socket: WebSocket;

  constructor() {
    this.app = new HyperExpress.Server();
    this.db = knex({
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
        max: 150,
        destroyTimeoutMillis: 100,
        idleTimeoutMillis: 100,
        reapIntervalMillis: 100,
        createRetryIntervalMillis: 400,
        acquireTimeoutMillis: 10000,
        createTimeoutMillis: 10000,
      },
    });
    // this.socket = new WebSocket('ws://127.0.0.1:9001');
  }
  listen() {
    const activityGroup = new ActivityRouter({
      db: this.db,
      cache: this.cache,
      socket: this.socket,
    });
    const todoRouter = new TodoRouter({
      db: this.db,
      cache: this.cache,
      socket: this.socket,
    });
    this.app.use('/activity-groups', activityGroup.routes);
    this.app.use('/todo-items', todoRouter.routes);
    this.app
      .listen(3030)
      .then(() => {
        console.log('WebServer listening to port 3030');
      })
      .catch((err) => {
        console.log(err);
      });
  }
}

const server = new Main();
server.listen();
