import { Knex } from 'knex';

export interface CacheDB {
  db: Knex;
  cache: any;
}
