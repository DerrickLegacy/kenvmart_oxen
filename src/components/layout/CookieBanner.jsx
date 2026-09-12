/**
 * CookieBanner — GDPR/cookie consent bar
 * Shown once until the user accepts or declines.
 * Preference stored in localStorage.
 */
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const STORAGE_KEY = "kenvmart_cookie_consent";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) setVisible(true);
  }, []);

  const accept = () => {
    localStorage.setItem(STORAGE_KEY, "accepted");
    setVisible(false);
  };

  const decline = () => {
    localStorage.setItem(STORAGE_KEY, "declined");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <>
      <style>{`
        .cookie-banner {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          z-index: 9999;
          background: #0f172a;
          color: #e2e8f0;
          padding: 10px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          box-shadow: 0 -2px 16px rgba(0,0,0,0.18);
          font-size: 13px;
          line-height: 1.4;
          min-height: 0;
        }

        .cookie-banner__text {
          flex: 1;
          min-width: 200px;
          color: #cbd5e1;
        }

        .cookie-banner__text a {
          color: #e18f27;
          text-decoration: underline;
          font-weight: 600;
        }
        .cookie-banner__text a:hover { opacity: 0.8; }

        .cookie-banner__actions {
          display: flex;
          gap: 10px;
          flex-shrink: 0;
        }

        .cookie-btn {
          padding: 6px 16px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: opacity 0.15s ease;
          font-family: inherit;
          white-space: nowrap;
        }
        .cookie-btn:hover { opacity: 0.85; }

        .cookie-btn--accept {
          background: #183B9B;
          color: #e18f27;
          border: 1.5px solid #183B9B;
        }

        .cookie-btn--decline {
          background: transparent;
          color: #94a3b8;
          border: 1.5px solid #334155;
        }

        @media (max-width: 600px) {
          .cookie-banner {
            flex-direction: column;
            align-items: flex-start;
            padding: 14px 16px 18px;
          }
          .cookie-banner__actions { width: 100%; }
          .cookie-btn { flex: 1; text-align: center; }
        }
      `}</style>

      <div className="cookie-banner" role="region" aria-label="Cookie consent">
        <p className="cookie-banner__text">
          We use cookies to improve your experience and show you personalised content.
          By continuing you agree to our{" "}
          <Link to="/cookies-policy">Cookies Policy</Link>.
        </p>
        <div className="cookie-banner__actions">
          <button className="cookie-btn cookie-btn--decline" onClick={decline} type="button">
            Decline
          </button>
          <button className="cookie-btn cookie-btn--accept" onClick={accept} type="button">
            Accept Cookies
          </button>
        </div>
      </div>
    </>
  );
}
