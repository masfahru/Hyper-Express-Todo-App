import { Router } from 'hyper-express';
import { CacheDB } from '../../interfaces';
import { ActivityMiddleware } from './middlewares';

export class ActivityRouter {
  private activityRouter: Router;
  private activityMiddleware: ActivityMiddleware;

  constructor(cacheDb: CacheDB) {
    this.activityRouter = new Router();
    this.activityMiddleware = new ActivityMiddleware(cacheDb);
  }

  get routes() {
    this.activityRouter.get('/', this.activityMiddleware.getActivity);
    this.activityRouter.get('/:id', this.activityMiddleware.getActivityById);
    this.activityRouter.post('/', this.activityMiddleware.postActivity);
    this.activityRouter.patch('/:id', this.activityMiddleware.patchActivity);
    this.activityRouter.delete('/:id', this.activityMiddleware.deleteActivity);
    return this.activityRouter;
  }
}
