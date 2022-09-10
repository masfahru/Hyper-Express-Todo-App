import { Router } from 'hyper-express';
import { Dependencies } from '../../interfaces';
import { TodoMiddleware } from './middlewares';

export class TodoRouter {
  private todoRouter: Router;
  private todoMiddleware: TodoMiddleware;

  constructor(dependencies: Dependencies) {
    this.todoRouter = new Router();
    this.todoMiddleware = new TodoMiddleware(dependencies);
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
