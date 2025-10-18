'use client';

import { useState } from 'react';
import VideoUploader from '@/components/VideoUploader';
import ProcessingStatus from '@/components/ProcessingStatus';
import { Subtitles } from 'lucide-react';

export default function Home() {
  const [jobId, setJobId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleUploadComplete = (uploadedJobId: string) => {
    setJobId(uploadedJobId);
    setIsProcessing(true);
  };

  const handleReset = () => {
    setJobId(null);
    setIsProcessing(false);
  };

  return (
    <div className="min-h-screen bg-black">
      <div className="relative">
        {/* Header */}
        <header className="border-b border-zinc-800">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center gap-3">
              <div className="bg-zinc-900 border border-zinc-800 p-2 rounded-lg">
                <Subtitles className="w-6 h-6 text-zinc-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">SubYourWay</h1>
                <p className="text-sm text-zinc-500">Context-aware, culture-localized subtitles</p>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            {/* Hero Section */}
            {!isProcessing && (
              <div className="text-center mb-16">
                <h2 className="text-5xl font-bold text-white mb-4 tracking-tight">
                  Transform, not translate,
                  <br />
                  <span className="text-zinc-400">
                    your videos to your dialect
                  </span>
                </h2>
                <p className="text-lg text-zinc-500 mb-12 max-w-2xl mx-auto">
                  AI-powered subtitle generation that understands context and local culture
                </p>
                
                {/* Features */}
                <div className="grid md:grid-cols-3 gap-4 mb-12 text-left">
                  <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 hover:border-zinc-700 transition-colors">
                    <div className="text-2xl mb-3">⚡</div>
                    <h3 className="text-base font-semibold text-white mb-2">Fast Processing</h3>
                    <p className="text-sm text-zinc-500">Generate subtitles in 2-3 minutes</p>
                  </div>
                  <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 hover:border-zinc-700 transition-colors">
                    <div className="text-2xl mb-3">🧠</div>
                    <h3 className="text-base font-semibold text-white mb-2">Context-Aware</h3>
                    <p className="text-sm text-zinc-500">Gemini AI understands meaning and nuance</p>
                  </div>
                  <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 hover:border-zinc-700 transition-colors">
                    <div className="text-2xl mb-3">🇸🇬</div>
                    <h3 className="text-base font-semibold text-white mb-2">Authentic Singlish</h3>
                    <p className="text-sm text-zinc-500">Natural local expressions and particles</p>
                  </div>
                </div>
              </div>
            )}

            {/* Upload or Processing */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8">
              {!isProcessing ? (
                <VideoUploader onUploadComplete={handleUploadComplete} mode="subtitles" />
              ) : (
                <ProcessingStatus jobId={jobId!} onReset={handleReset} mode="subtitles" />
              )}
            </div>

            {/* How it works */}
            {!isProcessing && (
              <div className="mt-12 bg-zinc-900 border border-zinc-800 rounded-lg p-8">
                <h3 className="text-xl font-bold text-white mb-6">How it works</h3>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-zinc-800 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                      1
                    </div>
                    <div>
                      <h4 className="text-base font-semibold text-white mb-1">Upload video</h4>
                      <p className="text-zinc-500 text-sm">Drag and drop or click to select</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-zinc-800 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                      2
                    </div>
                    <div>
                      <h4 className="text-base font-semibold text-white mb-1">AI processing</h4>
                      <p className="text-zinc-500 text-sm">Transcribe → Translate → Generate subtitles</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-zinc-800 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                      3
                    </div>
                    <div>
                      <h4 className="text-base font-semibold text-white mb-1">Download</h4>
                      <p className="text-zinc-500 text-sm">Video with embedded subtitles + .srt files</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-zinc-800 mt-20">
          <div className="container mx-auto px-4 py-6 text-center text-zinc-600 text-sm">
            <p>Powered by FFmpeg, OpenAI Whisper & Google Gemini</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
