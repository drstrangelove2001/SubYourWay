import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { ensureDir, getJobPaths } from '@/lib/utils';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Ensure upload directory exists
    const uploadDir = path.join(process.cwd(), 'temp');
    ensureDir(uploadDir);

    // Parse form data
    const form = formidable({
      uploadDir,
      keepExtensions: true,
      maxFileSize: 500 * 1024 * 1024, // 500MB
    });

    const [fields, files] = await new Promise<[formidable.Fields, formidable.Files]>(
      (resolve, reject) => {
        form.parse(req, (err, fields, files) => {
          if (err) reject(err);
          else resolve([fields, files]);
        });
      }
    );

    // Get uploaded file
    const videoFile = Array.isArray(files.video) ? files.video[0] : files.video;
    
    if (!videoFile) {
      return res.status(400).json({ error: 'No video file uploaded' });
    }

    // Generate job ID
    const jobId = uuidv4();
    
    // Get job paths
    const paths = getJobPaths(jobId, videoFile.originalFilename || 'video.mp4');

    // Move uploaded file to job directory
    fs.renameSync(videoFile.filepath, paths.originalVideo);

    console.log(`Video uploaded: ${paths.originalVideo}`);

    return res.status(200).json({
      success: true,
      jobId,
      filename: videoFile.originalFilename,
      size: videoFile.size,
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    return res.status(500).json({ error: error.message });
  }
}

