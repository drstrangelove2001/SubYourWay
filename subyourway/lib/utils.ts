import fs from 'fs';
import path from 'path';

/**
 * Ensure a directory exists, create it if it doesn't
 */
export function ensureDir(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * Generate a unique filename with timestamp
 */
export function generateUniqueFilename(originalName: string, suffix?: string): string {
  const timestamp = Date.now();
  const ext = path.extname(originalName);
  const base = path.basename(originalName, ext);
  const safeSuffix = suffix ? `_${suffix}` : '';
  return `${base}_${timestamp}${safeSuffix}${ext}`;
}

/**
 * Clean up temporary files
 */
export function cleanupFiles(filePaths: string[]): void {
  for (const filePath of filePaths) {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`Cleaned up: ${filePath}`);
      }
    } catch (error) {
      console.error(`Error cleaning up ${filePath}:`, error);
    }
  }
}

/**
 * Clean up directory
 */
export function cleanupDirectory(dirPath: string): void {
  try {
    if (fs.existsSync(dirPath)) {
      fs.rmSync(dirPath, { recursive: true, force: true });
      console.log(`Cleaned up directory: ${dirPath}`);
    }
  } catch (error) {
    console.error(`Error cleaning up directory ${dirPath}:`, error);
  }
}

/**
 * Get file size in MB
 */
export function getFileSizeMB(filePath: string): number {
  const stats = fs.statSync(filePath);
  return stats.size / (1024 * 1024);
}

/**
 * Format duration in seconds to readable format
 */
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Create a processing job directory
 */
export function createJobDirectory(jobId: string): string {
  const jobDir = path.join(process.cwd(), 'temp', jobId);
  ensureDir(jobDir);
  return jobDir;
}

/**
 * Get processing paths for a job
 */
export interface JobPaths {
  jobDir: string;
  originalVideo: string;
  extractedAudio: string;
  separatedDir: string;
  vocalsAudio: string;
  backgroundAudio: string;
  transcriptionJson: string;
  translationJson: string;
  segmentsDir: string;
  singlishAudio: string;
  mixedAudio: string;
  finalVideo: string;
}

export function getJobPaths(jobId: string, originalFilename: string): JobPaths {
  const jobDir = createJobDirectory(jobId);
  const ext = path.extname(originalFilename);
  const base = path.basename(originalFilename, ext);
  
  return {
    jobDir,
    originalVideo: path.join(jobDir, `original${ext}`),
    extractedAudio: path.join(jobDir, 'extracted_audio.wav'),
    separatedDir: path.join(jobDir, 'separated'),
    vocalsAudio: path.join(jobDir, 'separated', 'vocals.wav'),
    backgroundAudio: path.join(jobDir, 'separated', 'background.wav'),
    transcriptionJson: path.join(jobDir, 'transcription.json'),
    translationJson: path.join(jobDir, 'translation.json'),
    segmentsDir: path.join(jobDir, 'segments'),
    singlishAudio: path.join(jobDir, 'singlish_audio.wav'),
    mixedAudio: path.join(jobDir, 'mixed_audio.wav'),
    finalVideo: path.join(jobDir, `${base}_singlish${ext}`),
  };
}

