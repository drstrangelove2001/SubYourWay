import type { NextApiRequest, NextApiResponse } from 'next';
import { getJobPaths, ensureDir } from '@/lib/utils';
import { extractAudio } from '@/lib/ffmpeg';
import { transcribeAndSave } from '@/lib/whisper';
import { translateSegments } from '@/lib/gemini';
import { saveSRT, saveDualSRT } from '@/lib/subtitles';
import { embedSubtitles } from '@/lib/ffmpeg';
import { setJobStatus } from '@/lib/job-status';
import fs from 'fs';
import path from 'path';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { jobId } = req.body;

  if (!jobId) {
    return res.status(400).json({ error: 'Job ID required' });
  }

  // Initialize job status
  setJobStatus(jobId, {
    status: 'processing',
    stage: 'starting',
    progress: 0,
    message: 'Starting subtitle generation...',
  });

  // Start processing asynchronously
  processSubtitles(jobId).catch((error) => {
    console.error(`Job ${jobId} failed:`, error);
    setJobStatus(jobId, {
      status: 'error',
      stage: 'failed',
      progress: 0,
      message: error.message,
    });
  });

  return res.status(200).json({
    success: true,
    message: 'Subtitle generation started',
    jobId,
  });
}

async function processSubtitles(jobId: string) {
  // Helper to add small delay for status visibility
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
  
  const updateStatus = async (stage: string, progress: number, message: string) => {
    setJobStatus(jobId, {
      status: 'processing',
      stage,
      progress,
      message,
    });
    console.log(`[${jobId}] ${stage}: ${message} (${progress}%)`);
    // Small delay to ensure status is persisted and visible to polling clients
    await delay(100);
  };

  try {
    // Get job paths
    const jobDir = path.join(process.cwd(), 'temp', jobId);
    const files = fs.readdirSync(jobDir);
    const videoFile = files.find(f => f.startsWith('original'));
    
    if (!videoFile) {
      throw new Error('Original video file not found');
    }

    const paths = getJobPaths(jobId, videoFile);
    
    // Define subtitle-specific paths
    const srtPath = path.join(paths.jobDir, 'singlish_subtitles.srt');
    const dualSrtPath = path.join(paths.jobDir, 'dual_subtitles.srt');
    const outputVideo = path.join(paths.jobDir, `${path.parse(videoFile).name}_singlish_subs${path.extname(videoFile)}`);

    // Step 1: Extract audio from video
    await updateStatus('extract_audio', 15, 'Extracting audio from video...');
    await extractAudio({
      videoPath: paths.originalVideo,
      outputPath: paths.extractedAudio,
    });

    // Step 2: Transcribe with timestamps (NO separation needed!)
    await updateStatus('transcribe', 35, 'Transcribing speech with timestamps...');
    const transcription = await transcribeAndSave(
      paths.extractedAudio,
      paths.transcriptionJson
    );

    // Step 3: Translate to Singlish
    await updateStatus('translate', 60, 'Translating to Singlish...');
    const translatedSegments = await translateSegments(
      transcription.segments.map(seg => ({
        text: seg.text,
        start: seg.start,
        end: seg.end,
      }))
    );

    // Save translation
    fs.writeFileSync(paths.translationJson, JSON.stringify(translatedSegments, null, 2));

    // Step 4: Generate SRT subtitle files
    await updateStatus('generate_subtitles', 75, 'Generating subtitle files...');
    
    // Generate Singlish-only subtitles
    saveSRT(
      translatedSegments.map(seg => ({
        start: seg.start,
        end: seg.end,
        text: seg.translated,
      })),
      srtPath
    );

    // Generate dual subtitles (Singlish + Original)
    saveDualSRT(
      translatedSegments.map(seg => ({
        start: seg.start,
        end: seg.end,
        original: seg.original,
        translated: seg.translated,
      })),
      dualSrtPath
    );

    // Step 5: Embed subtitles into video
    await updateStatus('embed_subtitles', 90, 'Embedding subtitles into video...');
    await embedSubtitles({
      videoPath: paths.originalVideo,
      subtitlePath: srtPath,
      outputPath: outputVideo,
      fontSize: 14,  // 40% smaller than original 24
      fontColor: 'white',
      outlineColor: 'black',
      position: 'bottom',
    });

    // Complete! Set final status with all download URLs
    const finalFilename = path.basename(outputVideo);
    const srtFilename = path.basename(srtPath);
    const dualSrtFilename = path.basename(dualSrtPath);
    
    console.log(`[Process] Job ${jobId} complete! Setting final status...`);
    
    setJobStatus(jobId, {
      status: 'complete',
      stage: 'complete',
      progress: 100,
      message: 'Subtitle generation complete!',
      downloadUrl: `/api/download?jobId=${jobId}&filename=${encodeURIComponent(finalFilename)}`,
      outputFilename: finalFilename,
      subtitleUrl: `/api/download?jobId=${jobId}&filename=${encodeURIComponent(srtFilename)}`,
      dualSubtitleUrl: `/api/download?jobId=${jobId}&filename=${encodeURIComponent(dualSrtFilename)}`,
    });
    
    console.log(`[Process] Final status set for ${jobId}. Download URL: /api/download?jobId=${jobId}&filename=${finalFilename}`);

  } catch (error: any) {
    console.error(`Error processing job ${jobId}:`, error);
    setJobStatus(jobId, {
      status: 'error',
      stage: 'failed',
      progress: 0,
      message: error.message || 'Processing failed',
    });
    throw error;
  }
}

