import { Request, Response } from 'express';
import {
  getScheduleByDate,
  takeDose,
  undoDose,
  snoozeDose
} from './schedule.service';

import { DIContainer, SocketsService } from '../../../services';


export async function getScheduleByDateHandler(
  req: Request,
  res: Response
) {
  const userId = Number(req.params.userId);
  const date = req.query.date as string;

  if (!userId) {
    return res.status(400).json({ error: 'userId required' });
  }

  if (!date) {
    return res.status(400).json({ error: 'date required' });
  }

  const data = await getScheduleByDate(userId, date);
  res.json(data);
}


export async function takeDoseHandler(
  req: Request,
  res: Response
) {
  const userId = Number(req.params.userId);
  const logId = req.params.logId;

  if (!userId || !logId) {
    return res.status(400).json({ error: 'invalid request' });
  }

  const result = await takeDose(logId);

  const sockets = DIContainer.get(SocketsService);
  sockets.publish('scheduleUpdated', {
    userId,
    date: result.date
  });

  sockets.publish('adherenceUpdated', {
    userId
  });

  res.json({
    success: true,
    takenStatus: result.takenStatus,
    takenAt: result.takenAt,
    delayMinutes: result.delayMinutes
  });
}


export async function snoozeDoseHandler(
  req: Request,
  res: Response
) {
  const userId = Number(req.params.userId);
  const logId = req.params.logId;
  const { minutes } = req.body;

  if (!userId || !logId || !minutes) {
    return res.status(400).json({ error: 'invalid request' });
  }

  const result = await snoozeDose(logId, minutes);

  const sockets = DIContainer.get(SocketsService);

  sockets.publish('scheduleUpdated', {
    userId,
    date: result.date
  });

  sockets.publish('adherenceUpdated', {
    userId
  });

  res.json({ success: true });
}


export async function undoDoseHandler(
  req: Request,
  res: Response
) {
  const userId = Number(req.params.userId);
  const logId = req.params.logId;

  if (!userId || !logId) {
    return res.status(400).json({ error: 'invalid request' });
  }

  const result = await undoDose(logId);

  const sockets = DIContainer.get(SocketsService);

  sockets.publish('scheduleUpdated', {
    userId,
    date: result.date
  });

  sockets.publish('adherenceUpdated', {
    userId
  });

  res.json({ success: true });
}
