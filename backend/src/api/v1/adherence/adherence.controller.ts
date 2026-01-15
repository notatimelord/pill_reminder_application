import { Request, Response } from 'express';
import { getAdherence } from './adherence.service';

export async function getAdherenceHandler(
  req: Request,
  res: Response
) {
  const userId = Number(req.params.userId);
  const days = Number(req.query.days ?? 7);

  const data = await getAdherence(userId, days);
  res.json(data);
}
