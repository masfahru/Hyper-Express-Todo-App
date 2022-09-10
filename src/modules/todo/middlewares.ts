import { Request, Response } from 'hyper-express';
import { Knex } from 'knex';
import { Dependencies } from '../../interfaces';
import {
  BadRequestResponse,
  CreateResponse,
  GetResponse,
  NotfoundResponse,
} from '../../responses';
import * as WebSocket from 'ws';

export class TodoMiddleware {
  private db: Knex;
  private cache: any;
  private socket: WebSocket;
  private id = 0;

  constructor(dependencies: Dependencies) {
    this.db = dependencies.db;
    this.cache = dependencies.cache;
    this.socket = dependencies.socket;
    this.getTodo = this.getTodo.bind(this);
    this.getTodoById = this.getTodoById.bind(this);
    this.postTodo = this.postTodo.bind(this);
    this.patchTodo = this.patchTodo.bind(this);
    this.deleteTodo = this.deleteTodo.bind(this);
  }

  async getTodo(request: Request, response: Response) {
    const { activity_group_id = '' } = request.query_parameters;
    const key = activity_group_id ? `todos-${activity_group_id}` : 'todos';
    let cached: any[] = this.cache.get(key);
    if (typeof cached === 'undefined') {
      const query = this.db
        .select('id', 'activity_group_id', 'title', 'is_active', 'priority')
        .from('todos');
      if (activity_group_id) {
        query.where({
          activity_group_id,
        });
      }
      cached = await query.limit(10);
      this.cache.set(key, cached);
    }
    return GetResponse(response, cached);
  }

  async getTodoById(request: Request, response: Response) {
    const { id = '' } = request.path_parameters;
    const key = `todos-${id}`;
    let cached: any = this.cache.get(key);
    if (typeof cached === 'undefined') {
      cached = await this.db
        .select('id', 'activity_group_id', 'title', 'is_active', 'priority')
        .from('todos')
        .where({
          id,
        })
        .first();
      if (!cached) {
        return NotfoundResponse(response, `Todo with ID ${id} Not Found`);
      }
      this.cache.set(key, cached);
    }
    return GetResponse(response, cached);
  }

  async postTodo(request: Request, response: Response) {
    const {
      activity_group_id = '',
      title = '',
      is_active = true,
      priority = 'very-high',
    } = await request.json();
    if (!activity_group_id) {
      return BadRequestResponse(response, 'activity_group_id cannot be null');
    } else if (!title) {
      return BadRequestResponse(response, 'title cannot be null');
    }
    this.socket.send(
      JSON.stringify({
        type: 'TODO',
        data: { title, activity_group_id, is_active, priority },
      }),
    );
    this.id++;
    const returned = {
      id: this.id,
      activity_group_id,
      title,
      is_active,
      priority,
    };
    this.cache.set(`todos-${this.id}`, returned);
    this.cache.delete('todos');
    return CreateResponse(response, returned);
  }

  async patchTodo(request: Request, response: Response) {
    const { id = '' } = request.path_parameters;
    const updateData = await request.json();
    const sendPatch = await this.db('todos')
      .where({
        id,
      })
      .update({ ...updateData });
    if (!sendPatch) {
      return NotfoundResponse(response, `Todo with ID ${id} Not Found`);
    }
    const updatedTodo = await this.db('todos')
      .select('id', 'activity_group_id', 'title', 'is_active', 'priority')
      .where({
        id,
      })
      .first();
    this.cache.set(`todos-${id}`, updatedTodo);
    this.cache.delete('todos');
    return GetResponse(response, updatedTodo);
  }

  async deleteTodo(request: Request, response: Response) {
    const { id = '' } = request.path_parameters;
    const result = await this.db('todos')
      .where({
        id,
      })
      .delete();
    if (!result) {
      return NotfoundResponse(response, `Todo with ID ${id} Not Found`);
    }
    this.cache.delete(`todos-${id}`);
    this.cache.delete('todos');
    return GetResponse(response, {});
  }
}
