import { Router } from 'express';
import { getAdherenceHandler } from './adherence.controller';

const router = Router();

router.get('/:userId', getAdherenceHandler);
console.log('[ROUTES] adherence routes loaded');

export default router;
