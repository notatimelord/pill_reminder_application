import { Router } from 'express';
import {
  getScheduleByDateHandler,
  takeDoseHandler,
  undoDoseHandler,
  snoozeDoseHandler 
} from './schedule.controller';

const router = Router();

router.get('/:userId', getScheduleByDateHandler);
router.post('/:userId/:logId/take', takeDoseHandler);
router.post('/:userId/:logId/undo', undoDoseHandler);
router.post('/:userId/:logId/snooze', snoozeDoseHandler);

export default router;
