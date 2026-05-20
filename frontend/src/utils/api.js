const API_BASE_CANDIDATES = ['http://127.0.0.1:8000', 'http://127.0.0.1:8001']
export let API_BASE = API_BASE_CANDIDATES[0]

export async function detectApiBase() {
  for (const base of API_BASE_CANDIDATES) {
    try {
      const res = await fetch(`${base}/health`)
      if (res.ok) {
        API_BASE = base
        return
      }
    } catch {
      // Ignore and try next
    }
  }
  throw new Error('Backend not found')
}

export async function postForm(url, formData) {
  const res = await fetch(url, { method: 'POST', body: formData })
  const text = await res.text()

  let json
  try {
    json = JSON.parse(text)
  } catch {
    json = { raw: text }
  }

  if (!res.ok) {
    const msg = json?.detail || res.statusText || 'Request failed'
    throw new Error(`${res.status} ${msg}`)
  }

  return json
}

export function captureFrameBlob(videoElement, canvasElement) {
  if (!videoElement || !videoElement.srcObject) {
    throw new Error('Camera is not started')
  }

  const ctx = canvasElement.getContext('2d')
  const w = videoElement.videoWidth || 640
  const h = videoElement.videoHeight || 480
  canvasElement.width = w
  canvasElement.height = h
  ctx.drawImage(videoElement, 0, 0, w, h)

  return new Promise((resolve, reject) => {
    canvasElement.toBlob(
      (blob) => {
        if (!blob) return reject(new Error('Failed to capture frame'))
        resolve(blob)
      },
      'image/jpeg',
      0.9
    )
  })
}
