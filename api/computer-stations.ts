import { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../server/db';
import { computerStations } from '../shared/schema';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const stations = await db.select().from(computerStations);
    return res.json(stations);
  } catch (error) {
    console.error('Error fetching computer stations:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}