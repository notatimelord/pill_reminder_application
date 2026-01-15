import { Request, Response } from 'express';
import { getSettings, updateSettings } from './settings.service';
import { DIContainer, SocketsService } from '../../../services';

export async function getSettingsHandler(req: Request, res: Response) {
  const userId = Number(req.params.userId);
  if (!userId) {
    return res.status(400).json({ error: 'Invalid user id' });
  }

  const settings = await getSettings(userId);
  res.json(settings);
}

export async function updateSettingsHandler(req: Request, res: Response) {
  const userId = Number(req.params.userId);
  if (!userId) {
    return res.status(400).json({ error: 'Invalid user id' });
  }

  const updated = await updateSettings(userId, req.body);

  const sockets = DIContainer.get(SocketsService);
  sockets.publish('settingsUpdated', {
    userId,
    ...updated
  });

  res.json(updated);
}
