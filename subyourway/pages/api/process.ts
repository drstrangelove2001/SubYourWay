import type { NextApiRequest, NextApiResponse } from 'next';
import { getJobPaths, ensureDir } from '@/lib/utils';
import { extractAudio, mixAudio, mergeAudioToVideo } from '@/lib/ffmpeg';
import { runDemucs } from '@/lib/python-runner';
import { transcribeAndSave } from '@/lib/whisper';
import { translateSegments } from '@/lib/gemini';
import { generateSegmentAudio } from '@/lib/elevenlabs';
import { setJobStatus } from '@/lib/job-status';
import fs from 'fs';
import path from 'path';
import ffmpeg from 'fluent-ffmpeg';

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
    message: 'Starting video processing...',
  });

  // Start processing asynchronously
  processVideo(jobId).catch((error) => {
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
    message: 'Processing started',
    jobId,
  });
}

async function processVideo(jobId: string) {
  const updateStatus = (stage: string, progress: number, message: string) => {
    setJobStatus(jobId, {
      status: 'processing',
      stage,
      progress,
      message,
    });
    console.log(`[${jobId}] ${stage}: ${message} (${progress}%)`);
  };

  try {
    // Get job paths (we'll determine the filename from the directory)
    const jobDir = path.join(process.cwd(), 'temp', jobId);
    const files = fs.readdirSync(jobDir);
    const videoFile = files.find(f => f.startsWith('original'));
    
    if (!videoFile) {
      throw new Error('Original video file not found');
    }

    const paths = getJobPaths(jobId, videoFile);

    // Step 1: Extract audio from video
    updateStatus('extract_audio', 10, 'Extracting audio from video...');
    await extractAudio({
      videoPath: paths.originalVideo,
      outputPath: paths.extractedAudio,
    });

    // Step 2: Separate vocals from background using Demucs
    updateStatus('separate_audio', 25, 'Separating vocals from background music (this may take a few minutes)...');
    ensureDir(paths.separatedDir);
    const demucsResult = await runDemucs(paths.extractedAudio, paths.separatedDir);
    
    if (!demucsResult.success) {
      throw new Error(`Audio separation failed: ${demucsResult.stderr}`);
    }

    // Step 3: Transcribe vocals with timestamps
    updateStatus('transcribe', 45, 'Transcribing speech with timestamps...');
    const transcription = await transcribeAndSave(
      paths.vocalsAudio,
      paths.transcriptionJson
    );

    // Step 4: Translate to Singlish
    updateStatus('translate', 60, 'Translating to Singlish...');
    const translatedSegments = await translateSegments(
      transcription.segments.map(seg => ({
        text: seg.text,
        start: seg.start,
        end: seg.end,
      }))
    );

    // Save translation
    fs.writeFileSync(paths.translationJson, JSON.stringify(translatedSegments, null, 2));

    // Step 5: Generate Singlish speech
    updateStatus('synthesize', 70, 'Generating Singlish speech...');
    ensureDir(paths.segmentsDir);
    
    // Map translated segments to TTS format
    const ttsSegments = await generateSegmentAudio(
      translatedSegments.map(seg => ({
        text: seg.translated,
        start: seg.start,
        end: seg.end,
      })),
      paths.segmentsDir
    );

    // Step 6: Concatenate all TTS segments into one audio file
    updateStatus('concatenate', 85, 'Combining audio segments...');
    await concatenateSegments(ttsSegments.map(s => s.audioPath), paths.singlishAudio);

    // Step 7: Mix Singlish audio with background music
    updateStatus('mix', 90, 'Mixing Singlish vocals with background music...');
    await mixAudio({
      vocalsPath: paths.singlishAudio,
      backgroundPath: paths.backgroundAudio,
      outputPath: paths.mixedAudio,
      vocalsVolume: 1.0,
      backgroundVolume: 0.6,
    });

    // Step 8: Merge mixed audio back to video
    updateStatus('merge', 95, 'Merging audio back to video...');
    await mergeAudioToVideo({
      videoPath: paths.originalVideo,
      audioPath: paths.mixedAudio,
      outputPath: paths.finalVideo,
    });

    // Complete!
    updateStatus('complete', 100, 'Video processing complete!');
    
    // Update final status with download URL
    const finalFilename = path.basename(paths.finalVideo);
    setJobStatus(jobId, {
      status: 'complete',
      stage: 'complete',
      progress: 100,
      message: 'Video processing complete!',
      downloadUrl: `/api/download?jobId=${jobId}&filename=${finalFilename}`,
      outputFilename: finalFilename,
    });

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

/**
 * Concatenate audio segments with silence padding to match timestamps
 */
async function concatenateSegments(segmentPaths: string[], outputPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    // Create a concat file list
    const concatFilePath = outputPath.replace('.wav', '_concat.txt');
    const fileList = segmentPaths.map(p => `file '${p}'`).join('\n');
    fs.writeFileSync(concatFilePath, fileList);

    ffmpeg()
      .input(concatFilePath)
      .inputOptions(['-f', 'concat', '-safe', '0'])
      .audioCodec('pcm_s16le')
      .format('wav')
      .output(outputPath)
      .on('end', () => {
        fs.unlinkSync(concatFilePath);
        resolve();
      })
      .on('error', (err) => {
        reject(err);
      })
      .run();
  });
}

