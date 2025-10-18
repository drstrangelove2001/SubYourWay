/**
 * Shared job status manager
 * In production, replace this with Redis or a database
 */

import fs from 'fs';
import path from 'path';

interface JobStatusData {
  status: 'processing' | 'complete' | 'error' | 'not_found';
  stage: string;
  progress: number;
  message: string;
  downloadUrl?: string;
  outputFilename?: string;
  subtitleUrl?: string;
  dualSubtitleUrl?: string;
  timestamp?: number; // Add timestamp for tracking updates
  [key: string]: any; // Allow additional properties
}

// In-memory storage (replace with Redis in production)
const jobStatusStore = new Map<string, JobStatusData>();

// Helper to persist status to file for reliability in Next.js dev mode
function persistStatus(jobId: string, status: JobStatusData): void {
  try {
    const statusDir = path.join(process.cwd(), 'temp', jobId);
    if (fs.existsSync(statusDir)) {
      const statusFile = path.join(statusDir, 'status.json');
      fs.writeFileSync(statusFile, JSON.stringify(status, null, 2));
    }
  } catch (error) {
    console.error('Error persisting status:', error);
  }
}

// Helper to load status from file
function loadStatus(jobId: string): JobStatusData | undefined {
  try {
    const statusFile = path.join(process.cwd(), 'temp', jobId, 'status.json');
    if (fs.existsSync(statusFile)) {
      const data = fs.readFileSync(statusFile, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading status:', error);
  }
  return undefined;
}

export function setJobStatus(jobId: string, status: JobStatusData): void {
  // Add timestamp to track when status was updated
  const statusWithTimestamp = {
    ...status,
    timestamp: Date.now(),
  };
  
  console.log(`[JobStatus] Setting status for ${jobId}:`, status.stage, `${status.progress}%`, status.message);
  jobStatusStore.set(jobId, statusWithTimestamp);
  persistStatus(jobId, statusWithTimestamp);
}

export function getJobStatus(jobId: string): JobStatusData | undefined {
  // Try memory first
  let status = jobStatusStore.get(jobId);
  
  // If not in memory, try loading from file
  if (!status) {
    status = loadStatus(jobId);
    if (status) {
      console.log(`[JobStatus] Loaded status from file for ${jobId}:`, status.stage);
      jobStatusStore.set(jobId, status);
    } else {
      console.log(`[JobStatus] Status not found for ${jobId}`);
    }
  }
  
  return status;
}

export function deleteJobStatus(jobId: string): void {
  jobStatusStore.delete(jobId);
}

export function getAllJobIds(): string[] {
  return Array.from(jobStatusStore.keys());
}

