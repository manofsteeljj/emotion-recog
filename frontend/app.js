const API_BASE_CANDIDATES = ["http://127.0.0.1:8000", "http://127.0.0.1:8001"];
let API_BASE = API_BASE_CANDIDATES[0];

const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const overlay = document.getElementById("overlay");
const statusEl = document.getElementById("status");
const resultEl = document.getElementById("result");
const backendStatusEl = document.getElementById("backendStatus");

const usernameEl = document.getElementById("username");

const btnStart = document.getElementById("btnStart");
const btnStop = document.getElementById("btnStop");
const btnAnalyze = document.getElementById("btnAnalyze");
const btnRegister = document.getElementById("btnRegister");
const btnAuth = document.getElementById("btnAuth");

let stream = null;
let liveTimer = null;

function setStatus(text) {
  statusEl.textContent = text;
}

function showResult(obj) {
  resultEl.textContent = JSON.stringify(obj, null, 2);
}

function updateBackendStatus(isOnline, message = "") {
  if (isOnline) {
    backendStatusEl.innerHTML = `
      <span style="display: inline-block; width: 8px; height: 8px; background: #00ff88; border-radius: 50%;"></span>
      Connected
    `;
    backendStatusEl.style.background = "rgba(0, 255, 136, 0.1)";
    backendStatusEl.style.borderColor = "rgba(0, 255, 136, 0.3)";
    backendStatusEl.style.color = "#00ff88";
  } else {
    backendStatusEl.innerHTML = `
      <span style="display: inline-block; width: 8px; height: 8px; background: #ff006e; border-radius: 50%;"></span>
      Offline
    `;
    backendStatusEl.style.background = "rgba(255, 0, 110, 0.1)";
    backendStatusEl.style.borderColor = "rgba(255, 0, 110, 0.3)";
    backendStatusEl.style.color = "#ff006e";
  }
}

async function startCamera() {
  stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
  video.srcObject = stream;
  await video.play();
  ensureOverlaySize();
  btnStop.disabled = false;
  btnStart.disabled = true;
  setStatus("Camera active • Live detection running");
  startLiveDetect();
}

function stopCamera() {
  stopLiveDetect();
  if (stream) {
    for (const track of stream.getTracks()) track.stop();
    stream = null;
  }
  video.srcObject = null;
  btnStop.disabled = true;
  btnStart.disabled = false;
  setStatus("Camera stopped");
  clearOverlay();
}

function ensureOverlaySize() {
  const w = video.videoWidth || 640;
  const h = video.videoHeight || 480;
  overlay.width = w;
  overlay.height = h;
  overlay.style.width = `${video.clientWidth}px`;
  overlay.style.height = `${video.clientHeight}px`;
}

function clearOverlay() {
  const ctx = overlay.getContext("2d");
  ctx.clearRect(0, 0, overlay.width, overlay.height);
}

function drawBoxes(result) {
  ensureOverlaySize();
  clearOverlay();

  const faces = Array.isArray(result?.faces) ? result.faces : [];
  if (faces.length === 0) return;

  const ctx = overlay.getContext("2d");
  ctx.lineWidth = 3;
  ctx.strokeStyle = "#00ff6a";
  ctx.fillStyle = "#00ff6a";
  ctx.font = "bold 14px system-ui, sans-serif";
  ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
  ctx.shadowBlur = 4;

  const frameW = Number(result?.frame?.w || overlay.width);
  const frameH = Number(result?.frame?.h || overlay.height);
  const sx = overlay.width / frameW;
  const sy = overlay.height / frameH;

  for (const f of faces) {
    const b = f?.box;
    if (!b) continue;
    const x = (Number(b.x) || 0) * sx;
    const y = (Number(b.y) || 0) * sy;
    const w = (Number(b.w) || 0) * sx;
    const h = (Number(b.h) || 0) * sy;
    
    // Draw rounded rectangle for face box
    ctx.strokeRect(x, y, w, h);
    
    // Draw emotion label with background
    const label = String(f?.emotion || "face");
    const textMetrics = ctx.measureText(label);
    const textHeight = 16;
    const padding = 6;
    
    const labelBg = {
      x: x + 2,
      y: Math.max(textHeight, y - textHeight - padding),
      w: textMetrics.width + padding * 2,
      h: textHeight + 2
    };
    
    ctx.fillStyle = "#00ff6a";
    ctx.fillRect(labelBg.x, labelBg.y, labelBg.w, labelBg.h);
    ctx.fillStyle = "#0f1419";
    ctx.fillText(label, labelBg.x + padding, labelBg.y + 14);
  }

  if (result?.emotion) {
    setStatus(`✓ Detected: ${result.emotion} • ${faces.length} face${faces.length > 1 ? 's' : ''}`);
  }
}

function captureFrameBlob() {
  if (!stream) throw new Error("Camera is not started");

  const ctx = canvas.getContext("2d");
  const w = video.videoWidth || 640;
  const h = video.videoHeight || 480;
  canvas.width = w;
  canvas.height = h;
  ctx.drawImage(video, 0, 0, w, h);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) return reject(new Error("Failed to capture frame"));
        resolve(blob);
      },
      "image/jpeg",
      0.9
    );
  });
}

async function postForm(url, formData) {
  const res = await fetch(url, { method: "POST", body: formData });
  const text = await res.text();

  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = { raw: text };
  }

  if (!res.ok) {
    const msg = json?.detail || res.statusText || "Request failed";
    throw new Error(`${res.status} ${msg}`);
  }

  return json;
}

async function detectApiBase() {
  for (const base of API_BASE_CANDIDATES) {
    try {
      const res = await fetch(`${base}/health`);
      if (res.ok) {
        API_BASE = base;
        updateBackendStatus(true);
        setStatus("Backend connected ✓");
        return;
      }
    } catch {
      // ignore
    }
  }
  updateBackendStatus(false);
  setStatus("Backend not found on ports 8000/8001");
}

async function analyze() {
  setStatus("Analyzing frame...");
  const blob = await captureFrameBlob();

  const fd = new FormData();
  fd.append("file", blob, "frame.jpg");

  const json = await postForm(`${API_BASE}/analyze`, fd);
  showResult(json);
  drawBoxes(json);
  setStatus("Analysis complete ✓");
}

async function registerUser() {
  const username = (usernameEl.value || "").trim();
  if (!username) throw new Error("Username is required to register");

  setStatus("Registering face...");
  const blob = await captureFrameBlob();

  const fd = new FormData();
  fd.append("username", username);
  fd.append("file", blob, "frame.jpg");

  const json = await postForm(`${API_BASE}/register`, fd);
  showResult(json);
  try {
    await analyzeOnceNoStatus();
  } catch {
    // ignore
  }
  setStatus(`✓ Registration successful for "${username}"`);
}

async function authenticate() {
  const username = (usernameEl.value || "").trim();

  setStatus("Authenticating...");
  const blob = await captureFrameBlob();

  const fd = new FormData();
  if (username) fd.append("username", username);
  fd.append("file", blob, "frame.jpg");

  const json = await postForm(`${API_BASE}/authenticate`, fd);
  showResult(json);
  try {
    await analyzeOnceNoStatus();
  } catch {
    // ignore
  }
  
  // Check if authentication was successful
  const isMatch = json?.match || json?.status === "match";
  if (isMatch) {
    setStatus(`✓ Authentication successful!`);
  } else {
    setStatus("✗ Authentication failed");
  }
}

async function analyzeOnceNoStatus() {
  const blob = await captureFrameBlob();
  const fd = new FormData();
  fd.append("file", blob, "frame.jpg");
  const json = await postForm(`${API_BASE}/analyze`, fd);
  drawBoxes(json);
  return json;
}

function startLiveDetect() {
  stopLiveDetect();
  // ~1.4 fps to keep CPU/network reasonable
  liveTimer = setInterval(async () => {
    if (!stream) return;
    try {
      await analyzeOnceNoStatus();
    } catch (e) {
      // If backend is down, avoid spamming errors
    }
  }, 700);
}

function stopLiveDetect() {
  if (liveTimer) {
    clearInterval(liveTimer);
    liveTimer = null;
  }
}

// Event Listeners
btnStart.addEventListener("click", async () => {
  try {
    await startCamera();
  } catch (e) {
    setStatus(`✗ Error: ${String(e.message || e)}`);
  }
});

btnStop.addEventListener("click", () => {
  stopCamera();
});

btnAnalyze.addEventListener("click", async () => {
  try {
    await analyze();
  } catch (e) {
    setStatus(`✗ Error: ${String(e.message || e)}`);
  }
});

btnRegister.addEventListener("click", async () => {
  try {
    await registerUser();
  } catch (e) {
    setStatus(`✗ Error: ${String(e.message || e)}`);
  }
});

btnAuth.addEventListener("click", async () => {
  try {
    await authenticate();
  } catch (e) {
    setStatus(`✗ Error: ${String(e.message || e)}`);
  }
});

// Initialize
detectApiBase();