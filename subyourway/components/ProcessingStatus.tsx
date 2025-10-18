'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import dynamic from 'next/dynamic';
import { 
  Loader2, 
  CheckCircle, 
  XCircle, 
  Download,
  RotateCcw,
  Music,
  Mic,
  Languages,
  Video,
} from 'lucide-react';

// Dynamically import VideoPreview to avoid SSR issues
const VideoPreview = dynamic(() => import('./VideoPreview'), {
  ssr: false,
  loading: () => <div className="text-center text-zinc-500">Loading preview...</div>
});

interface ProcessingStatusProps {
  jobId: string;
  onReset: () => void;
  mode?: 'subtitles' | 'dubbing';
}

interface JobStatus {
  status: 'processing' | 'complete' | 'error' | 'not_found';
  stage: string;
  progress: number;
  message: string;
  downloadUrl?: string;
  outputFilename?: string;
}

const stageIcons: Record<string, any> = {
  starting: Loader2,
  extract_audio: Music,
  transcribe: Mic,
  translate: Languages,
  generate_subtitles: Languages,
  embed_subtitles: Video,
  complete: CheckCircle,
  failed: XCircle,
};

const stageLabels: Record<string, string> = {
  starting: 'Initializing',
  extract_audio: 'Extracting audio',
  transcribe: 'Transcribing speech',
  translate: 'Translating to Singlish',
  generate_subtitles: 'Generating subtitles',
  embed_subtitles: 'Embedding subtitles',
  complete: 'Complete',
  failed: 'Failed',
};

export default function ProcessingStatus({ jobId, onReset, mode = 'subtitles' }: ProcessingStatusProps) {
  const [status, setStatus] = useState<JobStatus>({
    status: 'processing',
    stage: 'starting',
    progress: 0,
    message: 'Starting processing...',
  });

  useEffect(() => {
    let isActive = true;
    let pollCount = 0;
    
    const pollStatus = async () => {
      try {
        pollCount++;
        // Add cache-busting timestamp to prevent caching issues
        const timestamp = Date.now();
        const url = `/api/status?jobId=${jobId}&_t=${timestamp}`;
        
        console.log(`[UI Poll #${pollCount}] Fetching status from:`, url);
        
        const response = await axios.get(url, {
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
          },
        });
        
        if (isActive) {
          console.log(`[UI Poll #${pollCount}] Received:`, {
            stage: response.data.stage,
            progress: response.data.progress,
            status: response.data.status,
            timestamp: response.data.timestamp,
          });
          
          setStatus(response.data);
        }
      } catch (error: any) {
        console.error('[UI] Error polling status:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
        });
      }
    };

    console.log('[UI] Starting status polling for job:', jobId);
    
    // Poll every 1.5 seconds for more responsive UI
    const interval = setInterval(pollStatus, 1500);
    pollStatus(); // Initial poll

    return () => {
      console.log('[UI] Stopping status polling');
      isActive = false;
      clearInterval(interval);
    };
  }, [jobId]);

  const handleDownload = () => {
    if (status.downloadUrl) {
      window.location.href = status.downloadUrl;
    }
  };

  const StageIcon = stageIcons[status.stage] || Loader2;
  const isProcessing = status.status === 'processing';
  const isComplete = status.status === 'complete';
  const isError = status.status === 'error';

  return (
    <div className="space-y-6">
      {/* Status Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-lg bg-zinc-800 border border-zinc-700 mb-4">
          <StageIcon 
            className={`w-8 h-8 text-zinc-400 ${isProcessing ? 'animate-spin' : ''}`}
          />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">
          {stageLabels[status.stage] || status.stage}
        </h3>
        <p className="text-zinc-500 text-sm">{status.message}</p>
      </div>

      {/* Progress Bar */}
      {isProcessing && (
        <div>
          <div className="flex justify-between text-sm text-zinc-500 mb-2">
            <span>Processing</span>
            <span>{status.progress}%</span>
          </div>
          <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-zinc-600 transition-all duration-500"
              style={{ width: `${status.progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Processing Steps */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {Object.entries(stageLabels)
          .filter(([key]) => !['starting', 'complete', 'failed'].includes(key))
          .map(([key, label]) => {
            const Icon = stageIcons[key];
            const isCurrent = status.stage === key;
            const isPast = getStageIndex(status.stage) > getStageIndex(key);
            
            return (
              <div
                key={key}
                className={`
                  flex items-center gap-3 p-3 rounded-lg border transition-all
                  ${isCurrent 
                    ? 'bg-zinc-800 border-zinc-600' 
                    : isPast 
                      ? 'bg-zinc-900 border-zinc-800'
                      : 'bg-zinc-900/50 border-zinc-800'
                  }
                `}
              >
                {isPast ? (
                  <CheckCircle className="w-4 h-4 text-zinc-500 flex-shrink-0" />
                ) : (
                  <Icon className={`w-4 h-4 flex-shrink-0 ${isCurrent ? 'text-zinc-400' : 'text-zinc-700'}`} />
                )}
                <span className={`text-sm ${isCurrent ? 'text-white font-medium' : isPast ? 'text-zinc-500' : 'text-zinc-600'}`}>
                  {label}
                </span>
              </div>
            );
          })}
      </div>

      {/* Complete State */}
      {isComplete && status.downloadUrl && (
        <div className="space-y-6">
          <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-lg">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="w-5 h-5 text-zinc-400" />
              <p className="text-white font-semibold text-sm">Processing complete</p>
            </div>
            <p className="text-zinc-500 text-sm">
              Your video has Singlish subtitles embedded. Preview and download below.
            </p>
          </div>

          {/* Video Preview */}
          {status.outputFilename && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
              <h3 className="text-base font-semibold text-white mb-4 text-center">
                Preview
              </h3>
              <VideoPreview jobId={jobId} filename={status.outputFilename} />
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={handleDownload}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-white text-black font-semibold rounded-lg hover:bg-zinc-200 transition-all"
            >
              <Download className="w-5 h-5" />
              Download video with subtitles
            </button>
            
            {(status as any).subtitleUrl && (
              <div className="grid grid-cols-2 gap-3">
                <a
                  href={(status as any).subtitleUrl}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white font-medium rounded-lg transition-all border border-zinc-800 text-sm"
                >
                  <Download className="w-4 h-4" />
                  Singlish.srt
                </a>
                <a
                  href={(status as any).dualSubtitleUrl}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white font-medium rounded-lg transition-all border border-zinc-800 text-sm"
                >
                  <Download className="w-4 h-4" />
                  Dual.srt
                </a>
              </div>
            )}
            
            <button
              onClick={onReset}
              className="w-full px-6 py-3 bg-zinc-900 hover:bg-zinc-800 text-white font-medium rounded-lg transition-all border border-zinc-800"
            >
              <RotateCcw className="w-4 h-4 inline mr-2" />
              Process another video
            </button>
          </div>
        </div>
      )}

      {/* Error State */}
      {isError && (
        <div className="space-y-4">
          <div className="p-4 bg-red-950/50 border border-red-900 rounded-lg">
            <div className="flex items-center gap-3 mb-2">
              <XCircle className="w-5 h-5 text-red-500" />
              <p className="text-red-400 font-semibold text-sm">Processing failed</p>
            </div>
            <p className="text-red-400/80 text-sm">{status.message}</p>
          </div>

          <button
            onClick={onReset}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-zinc-900 hover:bg-zinc-800 text-white font-medium rounded-lg transition-all border border-zinc-800"
          >
            <RotateCcw className="w-5 h-5" />
            Try again
          </button>
        </div>
      )}

      {/* Processing Info */}
      {isProcessing && (
        <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-lg">
          <p className="text-zinc-500 text-sm text-center">
            Processing takes 2-3 minutes
          </p>
        </div>
      )}
    </div>
  );
}

function getStageIndex(stage: string): number {
  const stages = [
    'starting',
    'extract_audio',
    'transcribe',
    'translate',
    'generate_subtitles',
    'embed_subtitles',
    'complete',
  ];
  
  return stages.indexOf(stage);
}
