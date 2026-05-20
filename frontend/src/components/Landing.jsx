import React from 'react'

function Landing({ onGetStarted }) {
  return (
    <div className="landing">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">Emotion Recognition AI</h1>
          <p className="hero-subtitle">Real-time face detection and emotion analysis powered by advanced AI</p>
          <button className="hero-cta" onClick={onGetStarted}>
            Get Started →
          </button>
        </div>
        <div className="hero-visual">
          <div className="floating-card card-1">
            <div className="card-icon">😊</div>
            <div className="card-label">Happy</div>
          </div>
          <div className="floating-card card-2">
            <div className="card-icon">😢</div>
            <div className="card-label">Sad</div>
          </div>
          <div className="floating-card card-3">
            <div className="card-icon">😠</div>
            <div className="card-label">Angry</div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="section-header">
          <h2>Powerful Features</h2>
          <p>Everything you need for emotion recognition</p>
        </div>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🎥</div>
            <h3>Real-time Detection</h3>
            <p>Live camera feed with instant emotion detection and face recognition</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">👤</div>
            <h3>Face Registration</h3>
            <p>Register and store face profiles for authentication and identification</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔐</div>
            <h3>Secure Auth</h3>
            <p>Biometric authentication using advanced face recognition algorithms</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3>Fast & Accurate</h3>
            <p>Optimized for speed with high accuracy emotion classification</p>
          </div>
          <div className="feature-icon">🎨</div>
            <h3>Beautiful UI</h3>
            <p>Modern, responsive interface with smooth animations</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Detailed Results</h3>
            <p>Get comprehensive analysis with emotion confidence scores</p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works">
        <div className="section-header">
          <h2>How It Works</h2>
          <p>Simple steps to get started</p>
        </div>
        <div className="steps">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Start Camera</h3>
            <p>Click "Start Camera" to enable your webcam</p>
          </div>
          <div className="step-arrow">→</div>
          <div className="step">
            <div className="step-number">2</div>
            <h3>Register Face</h3>
            <p>Enter your name and register your face</p>
          </div>
          <div className="step-arrow">→</div>
          <div className="step">
            <div className="step-number">3</div>
            <h3>Authenticate</h3>
            <p>Verify your identity with face recognition</p>
          </div>
        </div>
      </section>

      {/* Emotions Section */}
      <section className="emotions">
        <div className="section-header">
          <h2>Detects 8 Emotions</h2>
          <p>Advanced emotion classification</p>
        </div>
        <div className="emotions-grid">
          <div className="emotion-item">
            <span className="emotion-emoji">😊</span>
            <span className="emotion-name">Happiness</span>
          </div>
          <div className="emotion-item">
            <span className="emotion-emoji">😢</span>
            <span className="emotion-name">Sadness</span>
          </div>
          <div className="emotion-item">
            <span className="emotion-emoji">😠</span>
            <span className="emotion-name">Anger</span>
          </div>
          <div className="emotion-item">
            <span className="emotion-emoji">😲</span>
            <span className="emotion-name">Surprise</span>
          </div>
          <div className="emotion-item">
            <span className="emotion-emoji">😐</span>
            <span className="emotion-name">Neutral</span>
          </div>
          <div className="emotion-item">
            <span className="emotion-emoji">🤢</span>
            <span className="emotion-name">Disgust</span>
          </div>
          <div className="emotion-item">
            <span className="emotion-emoji">😨</span>
            <span className="emotion-name">Fear</span>
          </div>
          <div className="emotion-item">
            <span className="emotion-emoji">🤔</span>
            <span className="emotion-name">Contempt</span>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <h2>Ready to Try It?</h2>
        <p>Experience real-time emotion recognition powered by AI</p>
        <button className="cta-button" onClick={onGetStarted}>
          Launch App →
        </button>
      </section>
    </div>
  )
}

export default Landing
