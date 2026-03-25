import type { ReactNode } from 'react';

interface IPhoneFrameProps {
  children: ReactNode;
}

export function IPhoneFrame({ children }: IPhoneFrameProps) {
  return (
    <div className="iphone-frame" aria-hidden="true">
      {/* Left-side buttons */}
      <div className="iphone-btn iphone-btn--silent" />
      <div className="iphone-btn iphone-btn--vol-up" />
      <div className="iphone-btn iphone-btn--vol-down" />
      {/* Right-side button */}
      <div className="iphone-btn iphone-btn--power" />

      {/* Inner bezel */}
      <div className="iphone-bezel">
        {/* Screen area */}
        <div className="iphone-screen" id="phone-screen">
          {/* Status bar */}
          <div className="iphone-status-bar">
            <span className="iphone-status-time">9:41</span>
            <div className="iphone-dynamic-island" />
            <div className="iphone-status-icons">
              <CellularIcon />
              <WifiIcon />
              <BatteryIcon />
            </div>
          </div>

          {/* Scrollable app content */}
          <div className="iphone-content">
            {children}
          </div>

          {/* Home indicator */}
          <div className="iphone-home-indicator">
            <div className="iphone-home-bar" />
          </div>
        </div>
      </div>
    </div>
  );
}

function CellularIcon() {
  return (
    <svg width="17" height="12" viewBox="0 0 17 12" fill="none" aria-hidden="true">
      <rect x="0" y="9" width="3" height="3" rx="0.5" fill="currentColor" />
      <rect x="4.5" y="6" width="3" height="6" rx="0.5" fill="currentColor" />
      <rect x="9" y="3" width="3" height="9" rx="0.5" fill="currentColor" />
      <rect x="13.5" y="0" width="3" height="12" rx="0.5" fill="currentColor" />
    </svg>
  );
}

function WifiIcon() {
  return (
    <svg width="16" height="12" viewBox="0 0 16 12" fill="none" aria-hidden="true">
      <path d="M8 11.5a1.25 1.25 0 100-2.5 1.25 1.25 0 000 2.5z" fill="currentColor" />
      <path d="M4.93 7.83a4.37 4.37 0 016.14 0" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M2.4 5.3a7.5 7.5 0 0111.2 0" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M0 2.7a10.8 10.8 0 0116 0" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function BatteryIcon() {
  return (
    <svg width="27" height="13" viewBox="0 0 27 13" fill="none" aria-hidden="true">
      <rect x="0.5" y="0.5" width="23" height="12" rx="3" stroke="currentColor" strokeOpacity="0.35" />
      <rect x="2" y="2" width="20" height="9" rx="1.5" fill="currentColor" />
      <path d="M25 4.5v4a2 2 0 000-4z" fill="currentColor" fillOpacity="0.4" />
    </svg>
  );
}
