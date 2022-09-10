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
    const activity_group_id = request.query.activity_group_id
      ? request.query.activity_group_id
      : '';
    const result = this.cache.todoCache.filter((todo: any) => {
      return todo.activity_group_id === activity_group_id;
    });

    return GetResponse(response, result);
  }

  async getTodoById(request: Request, response: Response) {
    const id = Number(request.params.id);
    const result = this.cache.todoCacheByKey[id];
    if (!result) {
      return NotfoundResponse(response, `Todo with ID ${id} Not Found`);
    }
    return GetResponse(response, result);
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
        type: 'TODO.POST',
        data: { title, activity_group_id, is_active, priority },
      }),
    );
    this.cache.lastTodoId++;
    const result = {
      id: this.cache.lastTodoId,
      activity_group_id,
      title,
      is_active,
      priority,
    };
    this.cache.todoCache.push(result);
    this.cache.todoCacheByKey[result.id] = result;
    return CreateResponse(response, result);
  }

  async patchTodo(request: Request, response: Response) {
    const id = Number(request.params.id);
    const idx = this.cache.todoCache.findIndex((a) => a.id === id);
    if (idx < 0) {
      return NotfoundResponse(response, `Todo with ID ${id} Not Found`);
    }
    const updateData = await request.json();
    this.socket.send(
      JSON.stringify({
        type: 'TODO.PATCH',
        data: {
          id,
          updateData,
        },
      }),
    );
    this.cache.todoCache[idx] = { ...this.cache.todoCache[idx], ...updateData };
    this.cache.todoCacheByKey[id] = {
      ...this.cache.todoCacheByKey[id],
      ...updateData,
    };
    return GetResponse(response, this.cache.todoCacheByKey[id]);
  }

  async deleteTodo(request: Request, response: Response) {
    const id = Number(request.params.id);
    const todo = this.cache.todoCacheByKey[id];
    if (!todo) {
      return NotfoundResponse(response, `Todo with ID ${id} Not Found`);
    }
    this.socket.send(
      JSON.stringify({
        type: 'TODO.DELETE',
        data: {
          id,
        },
      }),
    );
    const idx = this.cache.todoCache.findIndex((a) => a.id === id);
    this.cache.todoCache.splice(idx, 1);
    this.cache.todoCacheByKey.splice(id, 1);
    return GetResponse(response, {});
  }
}
