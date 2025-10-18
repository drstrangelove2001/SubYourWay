'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Video, AlertCircle, Loader2 } from 'lucide-react';
import axios from 'axios';

interface VideoUploaderProps {
  onUploadComplete: (jobId: string) => void;
  mode?: 'subtitles' | 'dubbing';
}

export default function VideoUploader({ onUploadComplete, mode = 'subtitles' }: VideoUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    
    // Validate file type
    if (!file.type.startsWith('video/')) {
      setError('Please upload a valid video file');
      return;
    }

    // Validate file size (max 500MB)
    const maxSize = 500 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('Video file is too large (max 500MB)');
      return;
    }

    setError(null);
    setUploading(true);
    setUploadProgress(0);

    try {
      // Create form data
      const formData = new FormData();
      formData.append('video', file);

      // Upload video
      const uploadResponse = await axios.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total || 1)
          );
          setUploadProgress(percentCompleted);
        },
      });

      const { jobId } = uploadResponse.data;

      // Start processing (subtitle mode only)
      await axios.post('/api/process-subtitles', { jobId });

      // Notify parent component
      onUploadComplete(jobId);
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.response?.data?.error || 'Failed to upload video');
      setUploading(false);
    }
  }, [onUploadComplete]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'video/*': ['.mp4', '.mov', '.avi', '.mkv', '.webm'],
    },
    maxFiles: 1,
    disabled: uploading,
  });

  return (
    <div>
      <div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-lg p-12 text-center cursor-pointer
          transition-all duration-200
          ${isDragActive 
            ? 'border-zinc-600 bg-zinc-800' 
            : 'border-zinc-700 hover:border-zinc-600 hover:bg-zinc-800/50'
          }
          ${uploading ? 'pointer-events-none opacity-60' : ''}
        `}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center gap-4">
          {uploading ? (
            <>
              <Loader2 className="w-12 h-12 text-zinc-400 animate-spin" />
              <div className="w-full max-w-xs">
                <div className="flex justify-between text-sm text-zinc-400 mb-2">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-zinc-600 transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            </>
          ) : isDragActive ? (
            <>
              <Upload className="w-12 h-12 text-zinc-400" />
              <div>
                <p className="text-lg font-semibold text-white mb-1">
                  Drop video here
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="bg-zinc-800 p-4 rounded-lg border border-zinc-700">
                <Video className="w-10 h-10 text-zinc-400" />
              </div>
              <div>
                <p className="text-lg font-semibold text-white mb-2">
                  Drop video or click to browse
                </p>
                <p className="text-sm text-zinc-500 mb-4">
                  MP4, MOV, AVI, MKV, WebM • Max 500MB
                </p>
                <div className="inline-flex items-center gap-2 px-6 py-2.5 bg-white text-black font-medium rounded-md hover:bg-zinc-200 transition-all text-sm">
                  <Upload className="w-4 h-4" />
                  Select video
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-950/50 border border-red-900 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-400 font-semibold text-sm">Error</p>
            <p className="text-red-400/80 text-sm">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
}
