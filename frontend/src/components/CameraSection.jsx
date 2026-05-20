import React, { useRef, useState, useEffect } from 'react'
import { captureFrameBlob, postForm, API_BASE } from '../utils/api'
import { drawBoxes, clearOverlay, ensureOverlaySize } from '../utils/canvas'

function CameraSection({ status, setStatus, result, setResult }) {
  const videoRef = useRef(null)
  const overlayRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)
  const liveTimerRef = useRef(null)

  const [isCameraActive, setIsCameraActive] = useState(false)

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      stopCamera()
    }
  }, [])

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
      streamRef.current = stream
      videoRef.current.srcObject = stream
      await videoRef.current.play()
      ensureOverlaySize(videoRef.current, overlayRef.current)
      setIsCameraActive(true)
      setStatus('Camera active • Live detection running')
      startLiveDetect()
    } catch (error) {
      setStatus(`✗ Error: ${error.message}`)
    }
  }

  const stopCamera = () => {
    stopLiveDetect()
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setIsCameraActive(false)
    setStatus('Camera stopped')
    clearOverlay(overlayRef.current)
  }

  const analyzeFrame = async () => {
    try {
      setStatus('Analyzing frame...')
      const blob = await captureFrameBlob(videoRef.current, canvasRef.current)

      const fd = new FormData()
      fd.append('file', blob, 'frame.jpg')

      const json = await postForm(`${API_BASE}/analyze`, fd)
      setResult(JSON.stringify(json, null, 2))
      drawBoxes(overlayRef.current, videoRef.current, json)
      setStatus('Analysis complete ✓')
    } catch (error) {
      setStatus(`✗ Error: ${error.message}`)
    }
  }

  const analyzeOnceNoStatus = async () => {
    const blob = await captureFrameBlob(videoRef.current, canvasRef.current)
    const fd = new FormData()
    fd.append('file', blob, 'frame.jpg')
    const json = await postForm(`${API_BASE}/analyze`, fd)
    drawBoxes(overlayRef.current, videoRef.current, json)
    return json
  }

  const startLiveDetect = () => {
    stopLiveDetect()
    liveTimerRef.current = setInterval(async () => {
      if (!streamRef.current) return
      try {
        await analyzeOnceNoStatus()
      } catch (e) {
        // Ignore errors to avoid spamming
      }
    }, 700)
  }

  const stopLiveDetect = () => {
    if (liveTimerRef.current) {
      clearInterval(liveTimerRef.current)
      liveTimerRef.current = null
    }
  }

  return (
    <div className="camera-section">
      <div className="camera-card">
        <div className="video-container">
          <video 
            ref={videoRef}
            className="video-element"
            autoPlay 
            playsInline 
            muted
          />
          <canvas 
            ref={overlayRef}
            className="overlay-canvas"
          />
        </div>
        <div className="camera-controls">
          <button 
            className="success"
            onClick={startCamera}
            disabled={isCameraActive}
          >
            ▶ Start Camera
          </button>
          <button 
            className="secondary"
            onClick={stopCamera}
            disabled={!isCameraActive}
          >
            ⏹ Stop
          </button>
          <button 
            className="secondary"
            onClick={analyzeFrame}
          >
            🔍 Analyze
          </button>
        </div>
      </div>
      <canvas 
        ref={canvasRef}
        className="hidden-canvas"
        width="640" 
        height="480"
      />
    </div>
  )
}

export default CameraSection
