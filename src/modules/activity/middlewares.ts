import { Request, Response } from 'hyper-express';
import {
  BadRequestResponse,
  CreateResponse,
  GetResponse,
  NotfoundResponse,
} from '../../responses';
import { CacheDB } from '../../interfaces';
import { Knex } from 'knex';

export class ActivityMiddleware {
  private db: Knex;
  private cache: any;

  constructor(cacheDb: CacheDB) {
    this.db = cacheDb.db;
    this.cache = cacheDb.cache;
    this.getActivity = this.getActivity.bind(this);
    this.getActivityById = this.getActivityById.bind(this);
    this.postActivity = this.postActivity.bind(this);
    this.patchActivity = this.patchActivity.bind(this);
    this.deleteActivity = this.deleteActivity.bind(this);
  }

  async getActivity(request: Request, response: Response) {
    const { email = '' } = request.query_parameters;
    const key = email ? `activities-${email}` : 'activities';
    let cached: any[] = this.cache.get(key);
    if (typeof cached === 'undefined') {
      const query = this.db
        .select('id', 'title', 'created_at')
        .from('activities');
      if (email) {
        query.where({
          email,
        });
      }
      cached = await query.limit(10);
      this.cache.set(key, cached);
    }
    return GetResponse(response, cached);
  }

  async getActivityById(request: Request, response: Response) {
    const { id = '' } = request.path_parameters;
    const key = `activities-${id}`;
    let cached: any = this.cache.get(key);
    if (typeof cached === 'undefined') {
      cached = await this.db
        .select('id', 'title', 'email', 'created_at')
        .from('activities')
        .where({
          id,
        })
        .first();
      if (!cached) {
        return NotfoundResponse(response, `Activity with ID ${id} Not Found`);
      }
      this.cache.set(key, cached);
    }
    return GetResponse(response, cached);
  }

  async postActivity(request: Request, response: Response) {
    const { email = '', title = '' } = await request.json();
    if (!email) {
      return BadRequestResponse(response, 'email cannot be null');
    } else if (!title) {
      return BadRequestResponse(response, 'title cannot be null');
    }
    const [id] = await this.db('activities').insert({ email, title });
    const returned = {
      id,
      email,
      title,
    };
    this.cache.set(`activities-${id}`, returned);
    this.cache.delete('activities');
    return CreateResponse(response, returned);
  }

  async patchActivity(request: Request, response: Response) {
    const { id = '' } = request.path_parameters;
    const updateData = await request.json();
    const sendPatch = await this.db('activities')
      .where({
        id,
      })
      .update({ ...updateData });
    if (!sendPatch) {
      return NotfoundResponse(response, `Activity with ID ${id} Not Found`);
    }
    const updatedActivity = await this.db('activities')
      .select('id', 'email', 'title')
      .where({
        id,
      })
      .first();
    this.cache.set(`activities-${id}`, updatedActivity);
    this.cache.delete('activities');
    return GetResponse(response, updatedActivity);
  }

  async deleteActivity(request: Request, response: Response) {
    const { id = '' } = request.path_parameters;
    const result = await this.db('activities')
      .where({
        id,
      })
      .delete();
    if (!result) {
      return NotfoundResponse(response, `Activity with ID ${id} Not Found`);
    }
    this.cache.delete(`activities-${id}`);
    this.cache.delete('activities');
    return GetResponse(response, {});
  }
}
