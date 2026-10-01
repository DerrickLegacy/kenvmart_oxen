import { useEffect, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function GoogleAuthCallback() {
  const { googleLoginFromCallback, acceptServerRedirectAuth } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [status, setStatus] = useState({ state: 'loading', message: 'Completing sign in…' });

  useEffect(() => {
    let cancelled = false;

    async function complete() {
      try {
        const query = new URLSearchParams(location.search);
        const fragment = new URLSearchParams(location.hash.replace(/^#/, ''));

        const packed = fragment.get('auth');
        const code = query.get('code');
        const error = query.get('error') || query.get('auth_error');

        if (error) {
          setStatus({ state: 'error', message: decodeURIComponent(error) });
          return;
        }

        if (!packed && !code) {
          setStatus({ state: 'error', message: 'No authorization data was received from Google. Please try again.' });
          return;
        }

        let data;

        if (packed) {
          try {
            data = JSON.parse(decodeURIComponent(packed));
          } catch {
            setStatus({ state: 'error', message: 'Could not decode the response from Google. Please try again.' });
            return;
          }

          if (!data?.token || !data?.user) {
            setStatus({ state: 'error', message: 'Google returned an incomplete response. Please try again.' });
            return;
          }

          await acceptServerRedirectAuth({ token: data.token, user: data.user });
        } else if (code) {
          const redirectUri = window.location.origin + '/auth/google/callback';
          data = await googleLoginFromCallback({ code, redirect_uri: redirectUri });
        }

        if (cancelled) return;

        const isNew = data?.is_new_user === true;
        setStatus({
          state: 'success',
          message: isNew ? 'Welcome! Your account has been created.' : 'Signed in successfully.'
        });

        window.setTimeout(() => {
          navigate('/', { replace: true });
        }, 700);
      } catch (err) {
        if (cancelled) return;
        const msg = err?.message || String(err) || 'Sign-in failed. Please try again.';
        setStatus({ state: 'error', message: msg });
      }
    }

    complete();

    return () => { cancelled = true; };
  }, [location, navigate, googleLoginFromCallback, acceptServerRedirectAuth]);

  return (
    <div className="login-standalone-page">
      <div className="login-card" style={{ textAlign: 'center' }}>

        <div className="login-logo" style={{ marginBottom: '20px' }}>
          <Link to="/"><img src="/assets/images/logo/logo.svg" alt="Kenvies Accessories" /></Link>
        </div>

        {status.state === 'loading' && (
          <>
            <div style={{
              width: 44, height: 44, margin: '16px auto 20px',
              borderRadius: '50%', border: '3px solid #e8ecf4',
              borderTopColor: '#e18f27', animation: 'spin 0.9s linear infinite',
            }} />
            <h1 className="login-title" style={{ marginTop: 0 }}>Almost there…</h1>
            <p className="login-subtitle">{status.message}</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </>
        )}

        {status.state === 'success' && (
          <>
            <div style={{
              width: 56, height: 56, margin: '16px auto 20px',
              borderRadius: '50%', background: '#34A853',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
              fontSize: 30, lineHeight: 1, fontWeight: 700,
            }}>✓</div>
            <h1 className="login-title" style={{ marginTop: 0 }}>Signed in</h1>
            <p className="login-subtitle">{status.message}</p>
            <p style={{ marginTop: 12, color: '#6b7280' }}>Redirecting you home…</p>
          </>
        )}

        {status.state === 'error' && (
          <>
            <div style={{
              width: 56, height: 56, margin: '16px auto 20px',
              borderRadius: '50%', background: '#EA4335',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
              fontSize: 28, lineHeight: 1, fontWeight: 700,
            }}>!</div>
            <h1 className="login-title" style={{ marginTop: 0 }}>Couldn&apos;t sign in</h1>
            <div className="login-error-banner" role="alert" style={{ marginTop: 8 }}>{status.message}</div>
            <div style={{ marginTop: 20, display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/login" className="login-btn-primary" style={{ textDecoration: 'none', padding: '10px 20px' }}>Back to Sign in</Link>
              <Link to="/" className="login-btn-google" style={{ textDecoration: 'none', padding: '10px 20px', justifyContent: 'center' }}>Go Home</Link>
            </div>
          </>
        )}

      </div>
    </div>
  );
}
