import type { NextApiRequest, NextApiResponse } from 'next';
import { getJobStatus } from '@/lib/job-status';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { jobId } = req.query;

  if (!jobId || typeof jobId !== 'string') {
    return res.status(400).json({ error: 'Job ID required' });
  }

  // Disable caching to ensure real-time status updates
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  const status = getJobStatus(jobId) || {
    status: 'not_found',
    message: 'Job not found',
  };

  return res.status(200).json(status);
}

