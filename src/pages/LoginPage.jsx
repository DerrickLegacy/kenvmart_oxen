import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ApiError } from '../services/api';

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      <path fill="#EA4335" d="M24 9.5c3.14 0 5.95 1.08 8.17 2.84l6.1-6.1C34.46 3.19 29.53 1 24 1 14.82 1 7.07 6.48 3.64 14.24l7.1 5.52C12.44 13.69 17.76 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.5 24.5c0-1.57-.14-3.09-.4-4.55H24v8.61h12.67c-.55 2.95-2.19 5.45-4.66 7.13l7.17 5.57C43.36 37.27 46.5 31.35 46.5 24.5z"/>
      <path fill="#FBBC05" d="M10.74 28.24A14.57 14.57 0 0 1 9.5 24c0-1.47.25-2.89.7-4.23l-7.1-5.52A23.93 23.93 0 0 0 .5 24c0 3.87.93 7.53 2.57 10.77l7.67-6.53z"/>
      <path fill="#34A853" d="M24 47c5.53 0 10.18-1.83 13.57-4.96l-7.17-5.57c-1.84 1.24-4.19 1.97-6.4 1.97-6.24 0-11.56-4.19-13.26-9.8l-7.67 6.53C7.07 41.52 14.82 47 24 47z"/>
      <path fill="none" d="M0 0h48v48H0z"/>
    </svg>
  );
}

export default function LoginPage() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const from      = location.state?.from?.pathname ?? '/';

  const [identifier,    setIdentifier]    = useState('');
  const [password,      setPassword]      = useState('');
  const [step,          setStep]          = useState('identifier');
  const [errors,        setErrors]        = useState({});
  const [submitting,    setSubmitting]    = useState(false);
  const [serverError,   setServerError]   = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);

  const validateIdentifier = () => {
    const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRx = /^\+?[\d\s\-().]{7,15}$/;
    if (!identifier.trim()) return 'Email or phone is required.';
    if (!emailRx.test(identifier.trim()) && !phoneRx.test(identifier.trim()))
      return 'Please enter a valid email or phone number.';
    return null;
  };

  const handleContinue = (e) => {
    e.preventDefault();
    const err = validateIdentifier();
    if (err) { setErrors({ identifier: err }); return; }
    setErrors({});
    setStep('password');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!password) { setErrors({ password: 'Password is required.' }); return; }
    setSubmitting(true);
    setServerError('');
    try {
      await login(identifier, password);
      navigate(from, { replace: true });
    } catch (err) {
      if (err instanceof ApiError) {
        setServerError(err.message);
      } else {
        setServerError('Login failed. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogle = () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) { alert('Google login is not configured.'); return; }
    setGoogleLoading(true);
    window.location.href =
      'https://accounts.google.com/o/oauth2/v2/auth' +
      `?client_id=${clientId}` +
      `&redirect_uri=${encodeURIComponent(window.location.origin + '/auth/google/callback')}` +
      '&response_type=code' +
      '&scope=openid%20email%20profile' +
      '&prompt=select_account';
  };

  return (
    <div className="login-standalone-page">
      <div className="login-card">

        <div className="login-logo">
          <Link to="/"><img src="/assets/images/logo/logo.svg" alt="Kenvies Accessories" /></Link>
        </div>

        <h1 className="login-title">Sign in</h1>
        <p className="login-subtitle">Use your email or phone to sign in.</p>

        {serverError && (
          <div className="login-error-banner" role="alert">{serverError}</div>
        )}

        {step === 'identifier' ? (
          <form onSubmit={handleContinue} noValidate>
            <div className="login-field-wrap">
              <input
                type="text"
                className={`login-input${errors.identifier ? ' login-input--error' : ''}`}
                placeholder="Email or Mobile Number"
                value={identifier}
                onChange={e => { setIdentifier(e.target.value); setErrors({}); }}
                autoComplete="username"
                aria-label="Email or Mobile Number"
              />
              {errors.identifier && (
                <p className="login-error" role="alert">{errors.identifier}</p>
              )}
            </div>
            <button type="submit" className="login-btn-primary">Continue</button>
          </form>
        ) : (
          <form onSubmit={handleLogin} noValidate>
            <div className="login-identifier-display">
              <span>{identifier}</span>
              <button type="button" className="login-change-link"
                onClick={() => { setStep('identifier'); setErrors({}); setServerError(''); setPassword(''); }}>
                Change
              </button>
            </div>
            <div className="login-field-wrap">
              <input
                type="password"
                className={`login-input${errors.password ? ' login-input--error' : ''}`}
                placeholder="Password"
                value={password}
                onChange={e => { setPassword(e.target.value); setErrors({}); setServerError(''); }}
                autoComplete="current-password"
                aria-label="Password"
                autoFocus
              />
              {errors.password && (
                <p className="login-error" role="alert">{errors.password}</p>
              )}
            </div>
            <button type="submit" className="login-btn-primary" disabled={submitting}>
              {submitting ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        )}

        <div className="login-divider"><span>Or log in with</span></div>

        <button type="button" className="login-btn-google" onClick={handleGoogle}
          disabled={googleLoading} aria-label="Log in with Google">
          <GoogleIcon />
          <span>{googleLoading ? 'Redirecting…' : 'Google'}</span>
        </button>

        <p className="login-help" style={{ marginTop: '16px' }}>
          No account?{' '}<Link to="/register">Create one</Link>
        </p>

        <p className="login-legal">
          By continuing you agree to Kenvies Accessories&apos;{' '}
          <Link to="/terms">Terms and Conditions</Link>{' '}&amp;{' '}
          <Link to="/privacy">Privacy Policy</Link>
        </p>
      </div>
    </div>
  );
}
