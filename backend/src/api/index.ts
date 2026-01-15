import * as express from 'express';
import { apiV1Router } from './v1';

export class Api {
  public static async applyRoutes(app: express.Application): Promise<void> {
    app.use('/api/v1', apiV1Router);
  }
}
