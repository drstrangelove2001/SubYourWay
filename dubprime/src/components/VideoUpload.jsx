import { useState } from 'react'
import { Upload, Video, FileVideo, Sparkles } from 'lucide-react'

function VideoUpload({ onUpload }) {
  const [isDragging, setIsDragging] = useState(false)

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('video/')) {
      onUpload(file)
    }
  }

  const handleFileInput = (e) => {
    const file = e.target.files[0]
    if (file) {
      onUpload(file)
    }
  }

  return (
    <div className="max-w-4xl mx-auto mt-20">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="bg-gradient-to-br from-accent-primary to-accent-secondary p-4 rounded-2xl">
            <Video className="w-12 h-12 text-white" />
          </div>
        </div>
        <h2 className="text-4xl font-bold mb-3 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
          Upload Your Video
        </h2>
        <p className="text-gray-400 text-lg">
          Add intelligent, context-aware subtitles powered by AI
        </p>
      </div>

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-2xl p-12 text-center
          transition-all duration-300 cursor-pointer
          ${isDragging 
            ? 'border-accent-primary bg-accent-primary/10 scale-[1.02]' 
            : 'border-dark-border bg-dark-surface hover:border-accent-primary/50 hover:bg-dark-elevated'
          }
        `}
      >
        <input
          type="file"
          accept="video/*"
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />

        <div className="flex flex-col items-center space-y-4">
          <div className={`
            p-6 rounded-full transition-colors
            ${isDragging ? 'bg-accent-primary/20' : 'bg-dark-bg'}
          `}>
            <Upload className={`
              w-12 h-12 transition-colors
              ${isDragging ? 'text-accent-primary' : 'text-gray-400'}
            `} />
          </div>
          
          <div>
            <p className="text-xl font-semibold text-gray-200 mb-2">
              Drop your video here or click to browse
            </p>
            <p className="text-gray-400">
              Supports MP4, MOV, AVI, and more
            </p>
          </div>

          <div className="flex items-center space-x-6 mt-6 text-sm text-gray-500">
            <div className="flex items-center space-x-2">
              <FileVideo className="w-4 h-4" />
              <span>Max 500MB</span>
            </div>
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4" />
              <span>AI-Powered</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        <FeatureCard 
          icon={<Video className="w-6 h-6" />}
          title="Context Analysis"
          description="Analyzes video frames, audio, and tone for accurate subtitles"
        />
        <FeatureCard 
          icon={<Sparkles className="w-6 h-6" />}
          title="Cultural Adaptation"
          description="Adapts subtitles based on cultural context and target audience"
        />
        <FeatureCard 
          icon={<FileVideo className="w-6 h-6" />}
          title="Speaker Detection"
          description="Identifies different speakers and adjusts subtitle styling"
        />
      </div>
    </div>
  )
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="bg-dark-surface border border-dark-border rounded-xl p-6 hover:border-accent-primary/50 transition-colors">
      <div className="text-accent-primary mb-3">
        {icon}
      </div>
      <h3 className="font-semibold text-white mb-2">{title}</h3>
      <p className="text-sm text-gray-400">{description}</p>
    </div>
  )
}

export default VideoUpload

