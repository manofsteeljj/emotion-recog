import '../styles/LandingPage.css'

function LandingPage({ onGetStarted }) {
  return (
    <div className="landing-page">

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Emotion Recognition AI</h1>
          <p className="hero-tagline">Real-time facial emotion detection using deep learning</p>
          <button className="cta-button" onClick={onGetStarted}>Explore Project</button>
        </div>
      </section>

      {/* About Section */}
      <section className="about-section">
        <div className="container">
          <h2>About the Project</h2>
          <div className="about-content">
            <p className="about-description">
              This machine learning project implements a real-time emotion recognition system that detects
              and classifies human emotions from facial expressions. Using convolutional neural networks (CNN)
              and advanced computer vision techniques, the system analyzes facial features to identify eight
              distinct emotions with high accuracy.
            </p>
            <div className="ml-type">
              <span className="label">ML Type:</span>
              <span className="value">Classification (CNN — Convolutional Neural Network)</span>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works-section">
        <div className="container">
          <h2>How It Works</h2>
          <div className="workflow">
            <div className="workflow-step">
              <div className="step-icon">📸</div>
              <h3>Input</h3>
              <p>Capture facial image from camera or upload photo</p>
            </div>
            <div className="workflow-arrow">→</div>
            <div className="workflow-step">
              <div className="step-icon">⚙️</div>
              <h3>Processing</h3>
              <p>Detect faces and extract facial features using CNN</p>
            </div>
            <div className="workflow-arrow">→</div>
            <div className="workflow-step">
              <div className="step-icon">😊</div>
              <h3>Prediction</h3>
              <p>Classify emotion and return confidence scores</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <h2>Key Features</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🎥</div>
              <h3>Real-time Detection</h3>
              <p>Process live video streams with instant emotion classification and face detection overlay</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🧠</div>
              <h3>Deep Learning Model</h3>
              <p>Trained CNN model with 8-class emotion classification achieving high accuracy on diverse datasets</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Confidence Scores</h3>
              <p>Get detailed probability scores for each emotion class with visual confidence indicators</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">👤</div>
              <h3>Face Recognition</h3>
              <p>Integrated face detection and registration system for user identification and authentication</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3>Fast Processing</h3>
              <p>Optimized inference pipeline for real-time performance on standard hardware</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🎨</div>
              <h3>Modern Interface</h3>
              <p>Clean, responsive UI with real-time visualization of detection results and metrics</p>
            </div>
          </div>
        </div>
      </section>

      {/* Visual Section */}
      <section className="visual-section">
        <div className="container">
          <h2>System Interface Preview</h2>
          <div className="visual-placeholder">
            <div className="placeholder-content">
              <div className="placeholder-icon">🖼️</div>
              <p>Model Workflow Visualization</p>
              <p className="placeholder-subtitle">Real-time emotion detection with face overlay and confidence metrics</p>
            </div>
          </div>
        </div>
      </section>

      {/* Emotions Section */}
      <section className="emotions-section">
        <div className="container">
          <h2>Detectable Emotions (8 Classes)</h2>
          <div className="emotions-grid">
            <div className="emotion-badge">😊 Happiness</div>
            <div className="emotion-badge">😢 Sadness</div>
            <div className="emotion-badge">😠 Anger</div>
            <div className="emotion-badge">😲 Surprise</div>
            <div className="emotion-badge">😐 Neutral</div>
            <div className="emotion-badge">🤢 Disgust</div>
            <div className="emotion-badge">😨 Fear</div>
            <div className="emotion-badge">🤔 Contempt</div>
          </div>
        </div>
      </section>

      {/* Developer Section */}
      <section className="developer-section">
        <div className="container">
          <h2>Project Information</h2>
          <div className="developer-info">
            <div className="info-item">
              <span className="info-label">Student Name:</span>
              <span className="info-value">Miri</span>
            </div>
            <div className="info-item">
              <span className="info-label">Course / Section:</span>
              <span className="info-value">Machine Learning &amp; Computer Vision</span>
            </div>
            <div className="info-item">
              <span className="info-label">Project Type:</span>
              <span className="info-value">Deep Learning Classification (CNN)</span>
            </div>
            <div className="info-item">
              <span className="info-label">Technologies:</span>
              <span className="info-value">Python, FastAPI, OpenCV, TensorFlow, React</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <p>&copy; 2026 Emotion Recognition ML Project. All rights reserved.</p>
          <p className="footer-subtitle">Built with React, FastAPI, and Deep Learning</p>
        </div>
      </footer>

    </div>
  )
}

export default LandingPage
