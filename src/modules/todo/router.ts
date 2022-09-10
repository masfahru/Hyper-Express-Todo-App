import { Router } from 'hyper-express';
import { CacheDB } from '../../interfaces';
import { TodoMiddleware } from './middlewares';

export class TodoRouter {
  private todoRouter: Router;
  private todoMiddleware: TodoMiddleware;

  constructor(cacheDB: CacheDB) {
    this.todoRouter = new Router();
    this.todoMiddleware = new TodoMiddleware(cacheDB);
  }

  get routes() {
    this.todoRouter.get('/', this.todoMiddleware.getTodo);
    this.todoRouter.get('/:id', this.todoMiddleware.getTodoById);
    this.todoRouter.post('/', this.todoMiddleware.postTodo);
    this.todoRouter.patch('/:id', this.todoMiddleware.patchTodo);
    this.todoRouter.delete('/:id', this.todoMiddleware.deleteTodo);
    return this.todoRouter;
  }
}
