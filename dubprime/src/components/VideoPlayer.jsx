import { useRef, useEffect, useState } from 'react'
import { Play, Pause, Volume2, VolumeX, Maximize, SkipBack, SkipForward } from 'lucide-react'

function VideoPlayer({ videoUrl, subtitles, currentTime, onTimeUpdate }) {
  const videoRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)

  const currentSubtitle = subtitles.find(
    sub => currentTime >= sub.start && currentTime <= sub.end
  )

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleTimeUpdate = () => {
      onTimeUpdate(video.currentTime)
    }

    const handleLoadedMetadata = () => {
      setDuration(video.duration)
    }

    video.addEventListener('timeupdate', handleTimeUpdate)
    video.addEventListener('loadedmetadata', handleLoadedMetadata)

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate)
      video.removeEventListener('loadedmetadata', handleLoadedMetadata)
    }
  }, [onTimeUpdate])

  const togglePlay = () => {
    const video = videoRef.current
    if (video.paused) {
      video.play()
      setIsPlaying(true)
    } else {
      video.pause()
      setIsPlaying(false)
    }
  }

  const toggleMute = () => {
    const video = videoRef.current
    video.muted = !video.muted
    setIsMuted(!isMuted)
  }

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value)
    videoRef.current.volume = newVolume
    setVolume(newVolume)
    if (newVolume === 0) {
      setIsMuted(true)
    } else if (isMuted) {
      setIsMuted(false)
    }
  }

  const handleSeek = (e) => {
    const video = videoRef.current
    const rect = e.currentTarget.getBoundingClientRect()
    const pos = (e.clientX - rect.left) / rect.width
    video.currentTime = pos * duration
  }

  const skip = (seconds) => {
    const video = videoRef.current
    video.currentTime = Math.max(0, Math.min(duration, video.currentTime + seconds))
  }

  const toggleFullscreen = () => {
    const video = videoRef.current
    if (video.requestFullscreen) {
      video.requestFullscreen()
    }
  }

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  return (
    <div className="bg-dark-surface rounded-2xl overflow-hidden border border-dark-border">
      <div className="relative bg-black aspect-video">
        <video
          ref={videoRef}
          src={videoUrl}
          className="w-full h-full"
          onClick={togglePlay}
        />

        {/* Subtitle Overlay */}
        {currentSubtitle && (
          <div className="absolute bottom-16 left-0 right-0 flex justify-center px-4">
            <div className="bg-black/80 backdrop-blur-sm px-6 py-3 rounded-lg max-w-3xl">
              <p className="text-white text-lg md:text-xl font-medium text-center leading-relaxed">
                {currentSubtitle.text}
              </p>
            </div>
          </div>
        )}

        {/* Play button overlay */}
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center">
            <button
              onClick={togglePlay}
              className="bg-accent-primary/90 hover:bg-accent-primary p-6 rounded-full transition-all hover:scale-110"
            >
              <Play className="w-12 h-12 text-white ml-1" />
            </button>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="p-4 space-y-3">
        {/* Progress bar */}
        <div 
          className="relative h-2 bg-dark-bg rounded-full cursor-pointer group"
          onClick={handleSeek}
        >
          <div 
            className="absolute h-full bg-gradient-to-r from-accent-primary to-accent-secondary rounded-full"
            style={{ width: `${(currentTime / duration) * 100}%` }}
          />
          <div 
            className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ left: `${(currentTime / duration) * 100}%`, transform: 'translate(-50%, -50%)' }}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={togglePlay}
              className="bg-accent-primary hover:bg-accent-primary/80 p-2 rounded-lg transition-colors"
            >
              {isPlaying ? <Pause className="w-5 h-5 text-white" /> : <Play className="w-5 h-5 text-white" />}
            </button>

            <button
              onClick={() => skip(-5)}
              className="bg-dark-elevated hover:bg-dark-hover p-2 rounded-lg transition-colors"
            >
              <SkipBack className="w-4 h-4 text-gray-300" />
            </button>

            <button
              onClick={() => skip(5)}
              className="bg-dark-elevated hover:bg-dark-hover p-2 rounded-lg transition-colors"
            >
              <SkipForward className="w-4 h-4 text-gray-300" />
            </button>

            <span className="text-sm text-gray-400 ml-2">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 group">
              <button onClick={toggleMute} className="text-gray-300 hover:text-white">
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={handleVolumeChange}
                className="w-20 h-1 bg-dark-bg rounded-full appearance-none cursor-pointer
                  [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 
                  [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full 
                  [&::-webkit-slider-thumb]:bg-white opacity-0 group-hover:opacity-100 transition-opacity"
              />
            </div>

            <button
              onClick={toggleFullscreen}
              className="text-gray-300 hover:text-white"
            >
              <Maximize className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VideoPlayer

