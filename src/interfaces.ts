import { Knex } from 'knex';
import * as WebSocket from 'ws';
export interface Dependencies {
  db: Knex;
  cache: any;
  socket: WebSocket;
}
