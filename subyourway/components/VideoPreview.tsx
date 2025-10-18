'use client';

import { useEffect, useRef } from 'react';

interface VideoPreviewProps {
  jobId: string;
  filename: string;
}

export default function VideoPreview({ jobId, filename }: VideoPreviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Reset video when props change
    if (videoRef.current) {
      videoRef.current.load();
    }
  }, [jobId, filename]);

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="relative rounded-lg overflow-hidden bg-black border border-zinc-800">
        <video
          ref={videoRef}
          className="w-full h-auto"
          controls
          preload="metadata"
        >
          <source
            src={`/api/preview?jobId=${jobId}&filename=${encodeURIComponent(filename)}`}
            type="video/mp4"
          />
          Your browser does not support the video tag.
        </video>
      </div>
      <p className="text-center text-zinc-500 text-sm mt-3">
        Preview with embedded Singlish subtitles
      </p>
    </div>
  );
}
