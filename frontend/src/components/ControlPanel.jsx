import React, { useRef } from 'react'
import { captureFrameBlob, postForm, API_BASE } from '../utils/api'
import { drawBoxes } from '../utils/canvas'

function ControlPanel({ username, setUsername, status, setStatus, result, setResult }) {
  const videoRef = useRef(null)
  const overlayRef = useRef(null)
  const canvasRef = useRef(null)

  const registerUser = async () => {
    try {
      const trimmedUsername = username.trim()
      if (!trimmedUsername) {
        throw new Error('Username is required to register')
      }

      setStatus('Registering face...')
      
      // Get video element from CameraSection (we'll need to pass refs)
      const videoElement = document.querySelector('video')
      const canvasElement = document.querySelector('.hidden-canvas')
      const overlayElement = document.querySelector('.overlay-canvas')
      
      const blob = await captureFrameBlob(videoElement, canvasElement)

      const fd = new FormData()
      fd.append('username', trimmedUsername)
      fd.append('file', blob, 'frame.jpg')

      const json = await postForm(`${API_BASE}/register`, fd)
      setResult(JSON.stringify(json, null, 2))
      
      try {
        await analyzeOnceNoStatus(videoElement, canvasElement, overlayElement)
      } catch {
        // Ignore
      }
      
      setStatus(`✓ Registration successful for "${trimmedUsername}"`)
    } catch (error) {
      setStatus(`✗ Error: ${error.message}`)
    }
  }

  const authenticate = async () => {
    try {
      setStatus('Authenticating...')
      
      const videoElement = document.querySelector('video')
      const canvasElement = document.querySelector('.hidden-canvas')
      const overlayElement = document.querySelector('.overlay-canvas')
      
      const blob = await captureFrameBlob(videoElement, canvasElement)

      const fd = new FormData()
      if (username.trim()) {
        fd.append('username', username.trim())
      }
      fd.append('file', blob, 'frame.jpg')

      const json = await postForm(`${API_BASE}/authenticate`, fd)
      setResult(JSON.stringify(json, null, 2))
      
      try {
        await analyzeOnceNoStatus(videoElement, canvasElement, overlayElement)
      } catch {
        // Ignore
      }

      const isMatch = json?.match || json?.status === 'match'
      if (isMatch) {
        setStatus('✓ Authentication successful!')
      } else {
        setStatus('✗ Authentication failed')
      }
    } catch (error) {
      setStatus(`✗ Error: ${error.message}`)
    }
  }

  const analyzeOnceNoStatus = async (videoElement, canvasElement, overlayElement) => {
    const blob = await captureFrameBlob(videoElement, canvasElement)
    const fd = new FormData()
    fd.append('file', blob, 'frame.jpg')
    const json = await postForm(`${API_BASE}/analyze`, fd)
    drawBoxes(overlayElement, videoElement, json)
    return json
  }

  return (
    <div className="control-panel">
      <div className="panel-card">
        {/* User Section */}
        <div className="panel-section">
          <span className="panel-label">Identity</span>
          <label htmlFor="username">Username</label>
          <input
            id="username"
            type="text"
            placeholder="Enter your name"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        <div className="divider"></div>

        {/* Action Buttons */}
        <div className="panel-section">
          <span className="panel-label">Actions</span>
          <div className="button-group">
            <button 
              className="success"
              onClick={registerUser}
            >
              📸 Register Face
            </button>
            <button 
              className="secondary"
              onClick={authenticate}
            >
              🔐 Authenticate
            </button>
          </div>
        </div>

        <div className="divider"></div>

        {/* Status Display */}
        <div className="panel-section">
          <span className="panel-label">Status</span>
          <div className="status-display">
            <div className="status-label">Activity</div>
            <div className="status-text">{status}</div>
          </div>
        </div>

        {/* Results */}
        <div className="panel-section results-section">
          <h3>Detection Results</h3>
          <pre className="result-display">{result}</pre>
        </div>
      </div>
    </div>
  )
}

export default ControlPanel
