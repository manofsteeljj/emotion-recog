import React from 'react'

function Header({ backendStatus, onLogoClick, currentPage }) {
  return (
    <div className="header">
      <div className="header-content">
        <div className="header-inner">
          <div className="brand" style={{ cursor: 'pointer' }} onClick={onLogoClick}>
            <h1>Emotion Recognition</h1>
            <div className="tagline">Realtime face &amp; emotion demo</div>
          </div>

          <nav className="header-nav">
            <a href="#" className="nav-link" onClick={(e) => { e.preventDefault(); onLogoClick(); }}>
              {currentPage === 'landing' ? 'App' : 'Home'}
            </a>
            <a href="#" className="nav-link">Docs</a>
            <a href="#" className="nav-link">Repo</a>
            <span className={`status-badge ${backendStatus.online ? 'online' : 'offline'}`}>
              <span className="status-dot"></span>
              {backendStatus.message}
            </span>
          </nav>
        </div>
      </div>
    </div>
  )
}

export default Header
