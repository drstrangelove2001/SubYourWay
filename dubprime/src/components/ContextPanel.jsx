import { useState } from 'react'
import {
  Sparkles, Globe, Languages, MessageSquare, Users,
  Settings, ChevronDown, Wand2, Download, FileText, Loader2, AlertCircle
} from 'lucide-react'

function ContextPanel({
  settings,
  setSettings,
  onGenerate,
  videoFile,
  subtitles,
  isGenerating,
  isTranslating,
  generationError,
  detectedLanguage,
  progress
}) {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false)

  const handleInputChange = (field, value) => {
    setSettings({ ...settings, [field]: value })
  }

  return (
    <div className="space-y-6">
      {/* Main Settings Card */}
      <div className="bg-dark-surface rounded-2xl border border-dark-border p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="bg-gradient-to-br from-accent-primary to-accent-secondary p-2 rounded-lg">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">AI Settings</h3>
            <p className="text-xs text-gray-400">Configure subtitle generation</p>
          </div>
        </div>

        <div className="space-y-5">
          {/* Target Language */}
          <div>
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-300 mb-2">
              <Languages className="w-4 h-4" />
              <span>Target Language</span>
            </label>
            <select
              value={settings.targetLanguage}
              onChange={(e) => handleInputChange('targetLanguage', e.target.value)}
              className="w-full bg-dark-elevated border border-dark-border rounded-lg px-4 py-2.5
                text-sm text-gray-200 focus:outline-none focus:border-accent-primary cursor-pointer"
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
              <option value="ja">Japanese</option>
              <option value="ko">Korean</option>
              <option value="zh">Chinese</option>
              <option value="ar">Arabic</option>
              <option value="hi">Hindi</option>
              <option value="pt">Portuguese</option>
            </select>
            <p className="text-xs text-gray-500 mt-1.5">
              {subtitles && subtitles.length > 0
                ? 'Change language to auto-translate subtitles'
                : 'Language you want subtitles in (auto-translates if different from source)'}
            </p>
          </div>

          {/* Source Language */}
          <div>
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-300 mb-2">
              <Globe className="w-4 h-4" />
              <span>Source Language</span>
            </label>
            <select
              value={settings.sourceLanguage}
              onChange={(e) => handleInputChange('sourceLanguage', e.target.value)}
              className="w-full bg-dark-elevated border border-dark-border rounded-lg px-4 py-2.5
                text-sm text-gray-200 focus:outline-none focus:border-accent-primary cursor-pointer"
            >
              <option value="auto">Auto-detect</option>
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
              <option value="ja">Japanese</option>
              <option value="ko">Korean</option>
              <option value="zh">Chinese</option>
            </select>
            <p className="text-xs text-gray-500 mt-1.5">
              Language spoken in the video (improves transcription accuracy)
            </p>
          </div>

          {/* Cultural Context */}
          <div>
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-300 mb-2">
              <Globe className="w-4 h-4" />
              <span>Cultural Context</span>
            </label>
            <input
              type="text"
              value={settings.culturalContext}
              onChange={(e) => handleInputChange('culturalContext', e.target.value)}
              placeholder="e.g., American business, Japanese anime, UK comedy..."
              className="w-full bg-dark-elevated border border-dark-border rounded-lg px-4 py-2.5 
                text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-accent-primary"
            />
            <p className="text-xs text-gray-500 mt-1.5">
              Help AI understand cultural nuances and context
            </p>
          </div>

          {/* Tone */}
          <div>
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-300 mb-2">
              <MessageSquare className="w-4 h-4" />
              <span>Tone & Style</span>
            </label>
            <select
              value={settings.tone}
              onChange={(e) => handleInputChange('tone', e.target.value)}
              className="w-full bg-dark-elevated border border-dark-border rounded-lg px-4 py-2.5 
                text-sm text-gray-200 focus:outline-none focus:border-accent-primary cursor-pointer"
            >
              <option value="neutral">Neutral</option>
              <option value="formal">Formal</option>
              <option value="casual">Casual</option>
              <option value="humorous">Humorous</option>
              <option value="professional">Professional</option>
              <option value="friendly">Friendly</option>
            </select>
          </div>

          {/* Speaker Detection */}
          <div className="flex items-center justify-between p-4 bg-dark-elevated rounded-lg border border-dark-border">
            <div className="flex items-center space-x-3">
              <Users className="w-5 h-5 text-accent-primary" />
              <div>
                <p className="text-sm font-medium text-gray-200">Speaker Detection</p>
                <p className="text-xs text-gray-500">Identify different speakers</p>
              </div>
            </div>
            <button
              onClick={() => handleInputChange('speakerDetection', !settings.speakerDetection)}
              className={`
                relative w-11 h-6 rounded-full transition-colors
                ${settings.speakerDetection ? 'bg-accent-primary' : 'bg-dark-border'}
              `}
            >
              <div className={`
                absolute top-1 w-4 h-4 bg-white rounded-full transition-transform
                ${settings.speakerDetection ? 'translate-x-6' : 'translate-x-1'}
              `} />
            </button>
          </div>
        </div>

        {/* Advanced Settings */}
        <div className="mt-6 pt-6 border-t border-dark-border">
          <button
            onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
            className="flex items-center justify-between w-full text-sm font-medium text-gray-300 hover:text-white"
          >
            <div className="flex items-center space-x-2">
              <Settings className="w-4 h-4" />
              <span>Advanced Settings</span>
            </div>
            <ChevronDown className={`
              w-4 h-4 transition-transform
              ${isAdvancedOpen ? 'rotate-180' : ''}
            `} />
          </button>

          {isAdvancedOpen && (
            <div className="mt-4 space-y-4 animate-slide-up">
              <div>
                <label className="text-xs font-medium text-gray-400 mb-2 block">
                  Max Subtitle Length
                </label>
                <input
                  type="number"
                  defaultValue="42"
                  className="w-full bg-dark-elevated border border-dark-border rounded-lg px-3 py-2 
                    text-sm text-gray-200 focus:outline-none focus:border-accent-primary"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-400 mb-2 block">
                  Min Display Duration (seconds)
                </label>
                <input
                  type="number"
                  defaultValue="1.5"
                  step="0.1"
                  className="w-full bg-dark-elevated border border-dark-border rounded-lg px-3 py-2 
                    text-sm text-gray-200 focus:outline-none focus:border-accent-primary"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        {/* Generate Button */}
        <button
          onClick={onGenerate}
          disabled={!videoFile || isGenerating || isTranslating}
          className={`
            w-full py-4 rounded-xl font-semibold text-white text-lg
            flex items-center justify-center space-x-3 transition-all
            ${videoFile && !isGenerating && !isTranslating
              ? 'bg-gradient-to-r from-accent-primary to-accent-secondary hover:shadow-lg hover:shadow-accent-primary/50 hover:scale-[1.02]'
              : 'bg-dark-border text-gray-500 cursor-not-allowed'
            }
          `}
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Generating Subtitles...</span>
            </>
          ) : isTranslating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Translating...</span>
            </>
          ) : (
            <>
              <Wand2 className="w-5 h-5" />
              <span>Generate Subtitles</span>
            </>
          )}
        </button>

        {/* Progress Bar */}
        {isGenerating && progress && (
          <div className="bg-dark-elevated rounded-lg p-4 border border-dark-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-300">{progress.message || 'Processing...'}</span>
              <span className="text-sm font-semibold text-accent-primary">{progress.percentage}%</span>
            </div>
            <div className="w-full bg-dark-bg rounded-full h-2 mb-2">
              <div
                className="bg-gradient-to-r from-accent-primary to-accent-secondary rounded-full h-2 transition-all duration-300"
                style={{ width: `${progress.percentage}%` }}
              />
            </div>
            {progress.subtitles && progress.subtitles.length > 0 && (
              <div className="text-xs text-gray-400 text-center">
                {progress.subtitles.length} subtitles generated...
              </div>
            )}
          </div>
        )}

        {/* Detected Language Info */}
        {detectedLanguage && (
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-2.5 flex items-center space-x-2">
            <Globe className="w-4 h-4 text-blue-400" />
            <p className="text-xs text-blue-300">
              Detected Language: <span className="font-semibold">{detectedLanguage.toUpperCase()}</span>
            </p>
          </div>
        )}

        {/* Error Message */}
        {generationError && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 flex items-start space-x-2 animate-slide-up">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-300">Error</p>
              <p className="text-xs text-red-400 mt-0.5">{generationError}</p>
            </div>
          </div>
        )}
      </div>

      {/* Export Options */}
      <div className="bg-dark-surface rounded-2xl border border-dark-border p-6">
        <h4 className="text-sm font-semibold text-gray-300 mb-4 flex items-center space-x-2">
          <FileText className="w-4 h-4" />
          <span>Export Options</span>
        </h4>
        <div className="space-y-2">
          <button className="w-full py-2.5 bg-dark-elevated hover:bg-dark-hover rounded-lg 
            text-sm font-medium text-gray-300 flex items-center justify-center space-x-2 transition-colors">
            <Download className="w-4 h-4" />
            <span>Download SRT</span>
          </button>
          <button className="w-full py-2.5 bg-dark-elevated hover:bg-dark-hover rounded-lg 
            text-sm font-medium text-gray-300 flex items-center justify-center space-x-2 transition-colors">
            <Download className="w-4 h-4" />
            <span>Download VTT</span>
          </button>
          <button className="w-full py-2.5 bg-dark-elevated hover:bg-dark-hover rounded-lg 
            text-sm font-medium text-gray-300 flex items-center justify-center space-x-2 transition-colors">
            <Download className="w-4 h-4" />
            <span>Burn into Video</span>
          </button>
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-gradient-to-br from-accent-primary/10 to-accent-secondary/10 
        rounded-2xl border border-accent-primary/20 p-5">
        <div className="flex space-x-3">
          <Sparkles className="w-5 h-5 text-accent-primary flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-white mb-1">AI-Powered Analysis</h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              Our AI analyzes video frames, audio tone, speaker patterns, and cultural context 
              to generate accurate, contextually-aware subtitles.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ContextPanel

