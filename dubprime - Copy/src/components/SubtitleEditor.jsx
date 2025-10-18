import { useState } from 'react'
import { Plus, Edit2, Trash2, Clock } from 'lucide-react'

function SubtitleEditor({ subtitles, setSubtitles, currentTime }) {
  const [editingId, setEditingId] = useState(null)
  const [editText, setEditText] = useState('')

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    const ms = Math.floor((time % 1) * 100)
    return `${minutes}:${seconds.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`
  }

  const handleEdit = (subtitle) => {
    setEditingId(subtitle.id)
    setEditText(subtitle.text)
  }

  const handleSave = (id) => {
    setSubtitles(subtitles.map(sub => 
      sub.id === id ? { ...sub, text: editText } : sub
    ))
    setEditingId(null)
    setEditText('')
  }

  const handleDelete = (id) => {
    setSubtitles(subtitles.filter(sub => sub.id !== id))
  }

  const handleAddNew = () => {
    const newSubtitle = {
      id: Date.now(),
      start: currentTime,
      end: currentTime + 3,
      text: 'New subtitle'
    }
    setSubtitles([...subtitles, newSubtitle].sort((a, b) => a.start - b.start))
  }

  return (
    <div className="bg-dark-surface rounded-2xl border border-dark-border p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-white">Subtitle Timeline</h3>
          <p className="text-sm text-gray-400 mt-1">Edit and manage your subtitles</p>
        </div>
        <button
          onClick={handleAddNew}
          className="flex items-center space-x-2 bg-accent-primary hover:bg-accent-primary/80 
            px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span className="text-sm font-medium">Add Subtitle</span>
        </button>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
        {subtitles.length === 0 ? (
          <div className="text-center py-12">
            <Clock className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">No subtitles yet</p>
            <p className="text-sm text-gray-500 mt-1">
              Generate subtitles or add them manually
            </p>
          </div>
        ) : (
          subtitles.map((subtitle) => {
            const isActive = currentTime >= subtitle.start && currentTime <= subtitle.end
            const isEditing = editingId === subtitle.id

            return (
              <div
                key={subtitle.id}
                className={`
                  p-4 rounded-xl border transition-all
                  ${isActive 
                    ? 'bg-accent-primary/10 border-accent-primary' 
                    : 'bg-dark-elevated border-dark-border hover:border-dark-border/50'
                  }
                `}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 pt-1">
                    <div className={`
                      w-2 h-2 rounded-full
                      ${isActive ? 'bg-accent-primary animate-pulse' : 'bg-gray-600'}
                    `} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <Clock className="w-3 h-3 text-gray-500" />
                      <span className="text-xs text-gray-400 font-mono">
                        {formatTime(subtitle.start)} → {formatTime(subtitle.end)}
                      </span>
                    </div>

                    {isEditing ? (
                      <div className="space-y-2">
                        <textarea
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 
                            text-sm text-gray-200 focus:outline-none focus:border-accent-primary resize-none"
                          rows="2"
                          autoFocus
                        />
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleSave(subtitle.id)}
                            className="px-3 py-1 bg-accent-primary hover:bg-accent-primary/80 
                              rounded text-xs font-medium transition-colors"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="px-3 py-1 bg-dark-bg hover:bg-dark-hover 
                              rounded text-xs font-medium text-gray-400 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-200 leading-relaxed">
                        {subtitle.text}
                      </p>
                    )}
                  </div>

                  {!isEditing && (
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleEdit(subtitle)}
                        className="p-2 hover:bg-dark-bg rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4 text-gray-400 hover:text-accent-primary" />
                      </button>
                      <button
                        onClick={() => handleDelete(subtitle.id)}
                        className="p-2 hover:bg-dark-bg rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-400" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

export default SubtitleEditor

