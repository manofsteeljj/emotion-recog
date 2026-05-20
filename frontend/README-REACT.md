# Emotion Recognition Frontend (React)

A modern React-based frontend for real-time emotion recognition and face authentication.

## Features

- 🎥 Real-time camera feed with live emotion detection
- 😊 Emotion recognition overlay on detected faces
- 👤 Face registration and authentication
- 🎨 Modern, responsive UI with smooth animations
- ⚡ Built with React 18 and Vite for fast development

## Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Canvas API** - Face detection overlay rendering
- **MediaDevices API** - Camera access

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── Header.jsx          # App header with status badge
│   │   ├── CameraSection.jsx   # Camera feed and controls
│   │   ├── ControlPanel.jsx    # User actions and results
│   │   └── Footer.jsx          # App footer
│   ├── utils/
│   │   ├── api.js              # API communication utilities
│   │   └── canvas.js           # Canvas drawing utilities
│   ├── App.jsx                 # Main app component
│   ├── main.jsx                # React entry point
│   └── index.css               # Global styles
├── index-react.html            # HTML template
├── vite.config.js              # Vite configuration
└── package.json                # Dependencies
```

## Installation

1. Install dependencies:
```bash
npm install
```

## Running the App

1. Start the backend server (see backend/README.md)

2. Start the React development server:
```bash
npm run dev
```

3. Open your browser to `http://localhost:3000`

## Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Usage

1. **Start Camera**: Click "▶ Start Camera" to begin the video feed
2. **Analyze**: Click "🔍 Analyze" to detect faces and emotions in the current frame
3. **Register Face**: Enter a username and click "📸 Register Face" to save your face
4. **Authenticate**: Click "🔐 Authenticate" to verify your identity

## API Endpoints

The frontend connects to the backend on:
- Primary: `http://127.0.0.1:8000`
- Fallback: `http://127.0.0.1:8001`

Endpoints used:
- `GET /health` - Backend health check
- `POST /analyze` - Analyze frame for faces and emotions
- `POST /register` - Register a new face
- `POST /authenticate` - Authenticate a face

## Browser Compatibility

Requires a modern browser with support for:
- ES6+ JavaScript
- MediaDevices API (camera access)
- Canvas API
- Fetch API

## Development

The app uses Vite's hot module replacement (HMR) for instant updates during development.

## Original Version

The original vanilla JavaScript version is still available in:
- `index.html` - Original HTML file
- `app.js` - Original JavaScript file

## License

MIT
