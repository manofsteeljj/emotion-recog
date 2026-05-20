export function ensureOverlaySize(videoElement, overlayElement) {
  const w = videoElement.videoWidth || 640
  const h = videoElement.videoHeight || 480
  overlayElement.width = w
  overlayElement.height = h
  overlayElement.style.width = `${videoElement.clientWidth}px`
  overlayElement.style.height = `${videoElement.clientHeight}px`
}

export function clearOverlay(overlayElement) {
  const ctx = overlayElement.getContext('2d')
  ctx.clearRect(0, 0, overlayElement.width, overlayElement.height)
}

export function drawBoxes(overlayElement, videoElement, result) {
  ensureOverlaySize(videoElement, overlayElement)
  clearOverlay(overlayElement)

  const faces = Array.isArray(result?.faces) ? result.faces : []
  if (faces.length === 0) return

  const ctx = overlayElement.getContext('2d')
  ctx.lineWidth = 3
  ctx.strokeStyle = '#00ff6a'
  ctx.fillStyle = '#00ff6a'
  ctx.font = 'bold 14px system-ui, sans-serif'
  ctx.shadowColor = 'rgba(0, 0, 0, 0.8)'
  ctx.shadowBlur = 4

  const frameW = Number(result?.frame?.w || overlayElement.width)
  const frameH = Number(result?.frame?.h || overlayElement.height)
  const sx = overlayElement.width / frameW
  const sy = overlayElement.height / frameH

  for (const f of faces) {
    const b = f?.box
    if (!b) continue
    const x = (Number(b.x) || 0) * sx
    const y = (Number(b.y) || 0) * sy
    const w = (Number(b.w) || 0) * sx
    const h = (Number(b.h) || 0) * sy

    // Draw rounded rectangle for face box
    ctx.strokeRect(x, y, w, h)

    // Draw emotion label with background
    const label = String(f?.emotion || 'face')
    const textMetrics = ctx.measureText(label)
    const textHeight = 16
    const padding = 6

    const labelBg = {
      x: x + 2,
      y: Math.max(textHeight, y - textHeight - padding),
      w: textMetrics.width + padding * 2,
      h: textHeight + 2
    }

    ctx.fillStyle = '#00ff6a'
    ctx.fillRect(labelBg.x, labelBg.y, labelBg.w, labelBg.h)
    ctx.fillStyle = '#0f1419'
    ctx.fillText(label, labelBg.x + padding, labelBg.y + 14)
  }
}
