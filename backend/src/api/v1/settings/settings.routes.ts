import { Router } from 'express';
import {
  getSettingsHandler,
  updateSettingsHandler
} from './settings.controller';

const router = Router();

router.get('/:userId', getSettingsHandler);
router.put('/:userId', updateSettingsHandler);

export default router;
