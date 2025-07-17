import { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../server/db';
import { facilities } from '../shared/schema';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const allFacilities = await db.select().from(facilities);
    return res.json(allFacilities);
  } catch (error) {
    console.error('Error fetching facilities:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}