import { Request, Response } from 'hyper-express';
import {
  BadRequestResponse,
  CreateResponse,
  GetResponse,
  NotfoundResponse,
} from '../../responses';
import { Dependencies } from '../../interfaces';
import { Knex } from 'knex';
import * as WebSocket from 'ws';

export class ActivityMiddleware {
  private db: Knex;
  private cache: any;
  private socket: WebSocket;

  constructor(dependecies: Dependencies) {
    this.db = dependecies.db;
    this.cache = dependecies.cache;
    this.socket = dependecies.socket;
    this.getActivity = this.getActivity.bind(this);
    this.getActivityById = this.getActivityById.bind(this);
    this.postActivity = this.postActivity.bind(this);
    this.patchActivity = this.patchActivity.bind(this);
    this.deleteActivity = this.deleteActivity.bind(this);
  }

  async getActivity(request: Request, response: Response) {
    return GetResponse(response, this.cache.activityCache);
  }

  async getActivityById(request: Request, response: Response) {
    const id = Number(request.path_parameters.id);
    const result = this.cache.activityCacheByKey[id];
    if (!result) {
      return NotfoundResponse(response, `Activity with ID ${id} Not Found`);
    }
    return GetResponse(response, result);
  }

  async postActivity(request: Request, response: Response) {
    const { email = '', title = '' } = await request.json();
    if (!email) {
      return BadRequestResponse(response, 'email cannot be null');
    } else if (!title) {
      return BadRequestResponse(response, 'title cannot be null');
    }
    // this.socket.send(
    //   JSON.stringify({
    //     type: 'ACTIVITY.POST',
    //     data: { email, title },
    //   }),
    // );
    this.db('activities').insert({ email, title }).then();
    this.cache.lastActivityId++;
    const result = {
      id: this.cache.lastActivityId,
      email,
      title,
    };
    this.cache.activityCache.push(result);
    this.cache.activityCacheByKey[result.id] = result;
    return CreateResponse(response, this.cache.activityCacheByKey[result.id]);
  }

  async patchActivity(request: Request, response: Response) {
    const id = Number(request.params.id);
    const idx = this.cache.activityCache.findIndex((a) => a.id === id);
    if (idx < 0) {
      return NotfoundResponse(response, `Activity with ID ${id} Not Found`);
    }
    const updateData = await request.json();
    this.cache.activityCache[idx] = {
      ...this.cache.activityCache[idx],
      ...updateData,
    };
    this.cache.activityCacheByKey[id] = {
      ...this.cache.activityCacheByKey[id],
      ...updateData,
    };
    // this.socket.send(
    //   JSON.stringify({
    //     type: 'ACTIVITY.PATCH',
    //     data: {
    //       id,
    //       updateData,
    //     },
    //   }),
    // );
    this.db('activities')
      .where({
        id: id,
      })
      .update({ ...updateData })
      .then();
    return GetResponse(response, this.cache.activityCacheByKey[id]);
  }

  async deleteActivity(request: Request, response: Response) {
    const id = Number(request.params.id);
    const activity = this.cache.activityCacheByKey[id];
    if (!activity) {
      return NotfoundResponse(response, `Activity with ID ${id} Not Found`);
    }
    // this.socket.send(
    //   JSON.stringify({
    //     type: 'ACTIVITY.DELETE',
    //     data: {
    //       id,
    //     },
    //   }),
    // );
    this.db('activities')
      .where({
        id,
      })
      .delete()
      .then();
    const idx = this.cache.activityCache.findIndex((a) => a.id === id);
    this.cache.activityCache.splice(idx, 1);
    this.cache.activityCacheByKey.splice(id, 1);
    return GetResponse(response, {});
  }
}
