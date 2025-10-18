import Header from './components/Header'
import DubbingPanel from './components/DubbingPanel'

function App() {
  return (
    <div className="min-h-screen bg-dark-bg">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <DubbingPanel />
      </main>
    </div>
  )
}

export default App

