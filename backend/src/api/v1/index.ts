import * as express from 'express';
import authRoutes from './auth/auth.routes';
import medicationRoutes from './medications/medication.routes';
import scheduleRoutes from './schedule/schedule.routes';
import settingsRoutes from './settings/settings.routes';
import adherenceRoutes from './adherence/adherence.routes';

console.log('>>> api v1 starting');

const apiV1Router = express.Router();

apiV1Router.use('/auth', authRoutes);
apiV1Router.use('/medications', medicationRoutes);
apiV1Router.use('/schedule', scheduleRoutes);
apiV1Router.use('/settings', settingsRoutes);
apiV1Router.use('/adherence', adherenceRoutes);

export { apiV1Router };
