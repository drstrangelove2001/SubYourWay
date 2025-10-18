import { Video, Sparkles } from 'lucide-react'

function Header() {
  return (
    <header className="bg-dark-surface border-b border-dark-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-accent-primary to-accent-secondary p-2 rounded-lg">
              <Video className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-accent-primary to-accent-secondary bg-clip-text text-transparent">
                DubPrime
              </h1>
              <p className="text-xs text-gray-400">AI-Powered Video Dubbing</p>
            </div>
          </div>

          <nav className="flex items-center space-x-6">
            <button className="flex items-center space-x-2 text-gray-300 hover:text-white">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm">AI Features</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  )
}

export default Header

