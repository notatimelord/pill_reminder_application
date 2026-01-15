import { Request, Response } from 'express';
import { MongoClient } from 'mongodb';
import { config } from '../../../config/environment';

export async function login(req: Request, res: Response) {
  const { surname, password } = req.body;

  if (!surname || !password) {
    return res.status(400).json({ message: 'Missing credentials' });
  }

  try {
    console.log('[LOGIN] Connecting to Mongo…');

    const client = new MongoClient(config.mongo.uri);
    await client.connect();

    const db = client.db('ami-fullstack');

    const user = await db.collection('users').findOne({
      surname: { $regex: new RegExp(`^${surname}$`, 'i') }
    });

    if (!user || String(user.password) !== String(password)) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    delete (user as any).password;

    console.log('[LOGIN] Success:', user.surname);
    return res.json({ user });

  } catch (err) {
    console.error('[LOGIN ERROR]', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
