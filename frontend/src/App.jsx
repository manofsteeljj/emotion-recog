import { useState, useEffect } from 'react'
import LandingPage from './components/LandingPage'
import Header from './components/Header'
import CameraSection from './components/CameraSection'
import ControlPanel from './components/ControlPanel'
import Footer from './components/Footer'
import { detectApiBase } from './utils/api'
import './index.css'

function App() {
  const [page, setPage] = useState('landing')
  const [backendStatus, setBackendStatus] = useState({ online: false, message: 'Connecting...' })
  const [status, setStatus] = useState('Ready')
  const [result, setResult] = useState('(waiting for analysis)')
  const [username, setUsername] = useState('')

  useEffect(() => {
    detectApiBase()
      .then(() => {
        setBackendStatus({ online: true, message: 'Connected' })
        setStatus('Backend connected ✓')
      })
      .catch(() => {
        setBackendStatus({ online: false, message: 'Offline' })
        setStatus('Backend not found on ports 8000/8001')
      })
  }, [])

  if (page === 'landing') {
    return <LandingPage onGetStarted={() => setPage('app')} />
  }

  return (
    <>
      <Header
        backendStatus={backendStatus}
        onLogoClick={() => setPage('landing')}
        currentPage={page}
      />
      <div className="container">
        <div className="layout">
          <CameraSection
            status={status}
            setStatus={setStatus}
            result={result}
            setResult={setResult}
          />
          <ControlPanel
            username={username}
            setUsername={setUsername}
            status={status}
            setStatus={setStatus}
            result={result}
            setResult={setResult}
          />
        </div>
      </div>
      <Footer />
    </>
  )
}

export default App
