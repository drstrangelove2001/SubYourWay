import { useState, useRef, useEffect } from 'react'

const VOICES = [
  { id: 'mbL34QDB5FptPamlgvX5', name: 'Bill', description: 'Male, Documentary' },
  { id: 'JBFqnCBsd6RMkjVDRZzb', name: 'George', description: 'Male, Deep' },
  { id: 'pNInz6obpgDQGcFmaJgB', name: 'Adam', description: 'Male, American' },
  { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Sarah', description: 'Female, Soft' },
  { id: 'MF3mGyEYCl7XYWbV9V6O', name: 'Elli', description: 'Female, Young' },
]

function DubbingPanel() {
  const [videoFile, setVideoFile] = useState(null)
  const [srtFile, setSrtFile] = useState(null)
  const [selectedVoice, setSelectedVoice] = useState(VOICES[0].id)
  const [isDubbing, setIsDubbing] = useState(false)
  const [progress, setProgress] = useState(null)
  const [error, setError] = useState(null)
  const [jobId, setJobId] = useState(null)
  const [downloadUrl, setDownloadUrl] = useState(null)
  
  const videoInputRef = useRef(null)
  const srtInputRef = useRef(null)
  const progressIntervalRef = useRef(null)

  const handleVideoUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      setVideoFile(file)
      setError(null)
    }
  }

  const handleSrtUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      setSrtFile(file)
      setError(null)
    }
  }

  const pollProgress = async (jobId) => {
    try {
      const response = await fetch(`http://localhost:3001/api/dub/progress/${jobId}`)
      if (response.ok) {
        const progressData = await response.json()
        setProgress(progressData)

        // If completed, stop polling and show download
        if (progressData.status === 'completed') {
          if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current)
            progressIntervalRef.current = null
          }
          setIsDubbing(false)
          setDownloadUrl(`http://localhost:3001/api/dub/download/${jobId}`)
        }

        // If error, stop polling and show error
        if (progressData.status === 'error') {
          if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current)
            progressIntervalRef.current = null
          }
          setIsDubbing(false)
          setError(progressData.message || 'An error occurred during dubbing')
        }
      }
    } catch (err) {
      console.error('Error polling progress:', err)
    }
  }

  const startProgressPolling = (jobId) => {
    setProgress({ percentage: 0, message: 'Starting...', status: 'processing' })
    
    // Poll every 1 second
    progressIntervalRef.current = setInterval(() => {
      pollProgress(jobId)
    }, 1000)
  }

  const stopProgressPolling = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current)
      progressIntervalRef.current = null
    }
  }

  useEffect(() => {
    return () => stopProgressPolling()
  }, [])

  const handleStartDubbing = async () => {
    if (!videoFile || !srtFile) {
      setError('Please upload both video and SRT files')
      return
    }

    setIsDubbing(true)
    setError(null)
    setProgress({ progress: 0, message: 'Preparing...', status: 'processing' })
    setDownloadUrl(null)

    try {
      const formData = new FormData()
      formData.append('video', videoFile)
      formData.append('srt', srtFile)
      formData.append('voiceId', selectedVoice)

      console.log('Starting dubbing job...')

      const response = await fetch('http://localhost:3001/api/dub', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to start dubbing')
      }

      const data = await response.json()
      console.log('Dubbing job started:', data.jobId)

      setJobId(data.jobId)
      startProgressPolling(data.jobId)

    } catch (err) {
      console.error('Error starting dubbing:', err)
      setError(err.message || 'Failed to start dubbing. Please try again.')
      setIsDubbing(false)
      setProgress(null)
    }
  }

  const handleDownload = () => {
    if (downloadUrl) {
      window.open(downloadUrl, '_blank')
    }
  }

  const handleReset = () => {
    setVideoFile(null)
    setSrtFile(null)
    setProgress(null)
    setError(null)
    setJobId(null)
    setDownloadUrl(null)
    setIsDubbing(false)
    stopProgressPolling()
    if (videoInputRef.current) videoInputRef.current.value = ''
    if (srtInputRef.current) srtInputRef.current.value = ''
  }

  return (
    <div className="min-h-screen bg-dark-bg py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="glass-panel p-8 rounded-2xl shadow-glow">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gradient mb-2">🎙️ AI Video Dubbing</h1>
            <p className="text-gray-400">Upload your video and SRT file to generate an AI-dubbed version</p>
          </div>

          {/* File Uploads */}
          <div className="space-y-6 mb-8">
            {/* Video Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Video File
              </label>
              <div className="relative">
                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/*"
                  onChange={handleVideoUpload}
                  disabled={isDubbing}
                  className="w-full px-4 py-3 bg-dark-surface rounded-lg border border-purple-500/30 
                           text-gray-300 placeholder-gray-500 focus:outline-none focus:border-purple-500
                           disabled:opacity-50 disabled:cursor-not-allowed file:mr-4 file:py-2 file:px-4
                           file:rounded-lg file:border-0 file:bg-purple-600 file:text-white 
                           file:cursor-pointer hover:file:bg-purple-700"
                />
              </div>
              {videoFile && (
                <p className="text-sm text-green-400 mt-2">✓ {videoFile.name}</p>
              )}
            </div>

            {/* SRT Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                SRT Subtitle File
              </label>
              <div className="relative">
                <input
                  ref={srtInputRef}
                  type="file"
                  accept=".srt"
                  onChange={handleSrtUpload}
                  disabled={isDubbing}
                  className="w-full px-4 py-3 bg-dark-surface rounded-lg border border-purple-500/30 
                           text-gray-300 placeholder-gray-500 focus:outline-none focus:border-purple-500
                           disabled:opacity-50 disabled:cursor-not-allowed file:mr-4 file:py-2 file:px-4
                           file:rounded-lg file:border-0 file:bg-purple-600 file:text-white 
                           file:cursor-pointer hover:file:bg-purple-700"
                />
              </div>
              {srtFile && (
                <p className="text-sm text-green-400 mt-2">✓ {srtFile.name}</p>
              )}
            </div>

            {/* Voice Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Voice
              </label>
              <select
                value={selectedVoice}
                onChange={(e) => setSelectedVoice(e.target.value)}
                disabled={isDubbing}
                className="w-full px-4 py-3 bg-dark-surface rounded-lg border border-purple-500/30 
                         text-gray-300 focus:outline-none focus:border-purple-500
                         disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {VOICES.map((voice) => (
                  <option key={voice.id} value={voice.id}>
                    {voice.name} - {voice.description}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Progress */}
          {progress && (
            <div className="mb-6">
              <div className="flex justify-between text-sm text-gray-400 mb-2">
                <span>{progress.message || 'Processing...'}</span>
                <span>{progress.progress || 0}%</span>
              </div>
              <div className="w-full bg-dark-surface rounded-full h-3 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-600 to-pink-600 transition-all duration-300 ease-out"
                  style={{ width: `${progress.progress || 0}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Status: {progress.status}
              </p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4">
            {!downloadUrl ? (
              <>
                <button
                  onClick={handleStartDubbing}
                  disabled={!videoFile || !srtFile || isDubbing}
                  className="flex-1 btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDubbing ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Dubbing in progress...
                    </span>
                  ) : (
                    'Start Dubbing'
                  )}
                </button>
                {videoFile && srtFile && (
                  <button
                    onClick={handleReset}
                    disabled={isDubbing}
                    className="px-6 py-3 bg-dark-surface text-gray-300 rounded-lg hover:bg-dark-surface/80
                             transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Reset
                  </button>
                )}
              </>
            ) : (
              <>
                <button
                  onClick={handleDownload}
                  className="flex-1 btn-primary py-3"
                >
                  ⬇️ Download Dubbed Video
                </button>
                <button
                  onClick={handleReset}
                  className="px-6 py-3 bg-dark-surface text-gray-300 rounded-lg hover:bg-dark-surface/80 transition-colors"
                >
                  Dub Another Video
                </button>
              </>
            )}
          </div>

          {/* Info */}
          <div className="mt-8 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <h3 className="text-sm font-semibold text-blue-400 mb-2">How it works:</h3>
            <ol className="text-xs text-gray-400 space-y-1 list-decimal list-inside">
              <li>Your video's audio is separated into vocals and background music</li>
              <li>AI generates new dubbed voice from your SRT subtitles</li>
              <li>The dubbed voice is combined with the original background music</li>
              <li>Everything is merged back into the video</li>
            </ol>
            <p className="text-xs text-gray-500 mt-3">
              ⏱️ Processing time depends on video length (typically 5-10 minutes)
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DubbingPanel

