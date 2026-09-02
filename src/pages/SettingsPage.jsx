import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { profileApi } from '../services/api';
import Breadcrumb from '../components/layout/Breadcrumb';

/* ─── tiny helpers ──────────────────────────────────────────── */
function Field({ label, id, error, children }) {
  return (
    <div className="settings-field">
      <label htmlFor={id} className="settings-label">{label}</label>
      {children}
      {error && <p className="settings-field-error" role="alert">{error}</p>}
    </div>
  );
}

function SaveBtn({ submitting, saved }) {
  return (
    <button type="submit" className="settings-save-btn" disabled={submitting}>
      {submitting ? (
        <><span className="settings-spinner" />Saving…</>
      ) : saved ? (
        <><i className="lni lni-checkmark-circle" /> Saved</>
      ) : (
        'Save Changes'
      )}
    </button>
  );
}

/* ─── Profile section ────────────────────────────────────────── */
function ProfileSection({ user, onUpdated }) {
  const [fullName, setFullName] = useState(user?.full_name ?? '');
  const [phone,    setPhone]    = useState(user?.phone    ?? '');
  const [errors,   setErrors]   = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [saved,    setSaved]    = useState(false);
  const [serverError, setServerError] = useState('');

  useEffect(() => {
    setFullName(user?.full_name ?? '');
    setPhone(user?.phone ?? '');
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!fullName.trim()) errs.full_name = 'Full name is required.';
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSubmitting(true);
    setServerError('');
    try {
      const data = await profileApi.update({ full_name: fullName.trim(), phone: phone.trim() });
      onUpdated(data);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setServerError(err.message ?? 'Could not update profile.');
      if (err.errors) setErrors(err.errors);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="settings-section-body" onSubmit={handleSubmit} noValidate>
      {serverError && (
        <div className="settings-error-banner" role="alert">
          <i className="lni lni-warning" /> {serverError}
        </div>
      )}

      <div className="settings-fields-grid">
        <Field label="Full Name" id="s-full-name" error={errors.full_name}>
          <input
            id="s-full-name"
            type="text"
            className={`settings-input${errors.full_name ? ' settings-input--error' : ''}`}
            value={fullName}
            onChange={e => { setFullName(e.target.value); setErrors(p => ({ ...p, full_name: undefined })); }}
            placeholder="Your full name"
            autoComplete="name"
          />
        </Field>

        <Field label="Email Address" id="s-email">
          <input
            id="s-email"
            type="email"
            className="settings-input settings-input--readonly"
            value={user?.email ?? ''}
            readOnly
            tabIndex={-1}
          />
          <p className="settings-hint">Email cannot be changed.</p>
        </Field>

        <Field label="Phone Number" id="s-phone" error={errors.phone}>
          <input
            id="s-phone"
            type="tel"
            className={`settings-input${errors.phone ? ' settings-input--error' : ''}`}
            value={phone}
            onChange={e => { setPhone(e.target.value); setErrors(p => ({ ...p, phone: undefined })); }}
            placeholder="+256 700 000000"
            autoComplete="tel"
          />
        </Field>
      </div>

      <div className="settings-actions">
        <SaveBtn submitting={submitting} saved={saved} />
      </div>
    </form>
  );
}

/* ─── Password section ───────────────────────────────────────── */
function PasswordSection() {
  const [fields, setFields] = useState({
    current_password: '',
    new_password: '',
    new_password_confirmation: '',
  });
  const [showPwd, setShowPwd] = useState({
    current: false, new: false, confirm: false,
  });
  const [errors,  setErrors]  = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [saved,   setSaved]   = useState(false);
  const [serverError, setServerError] = useState('');

  const set = (key) => (e) => {
    setFields(p => ({ ...p, [key]: e.target.value }));
    setErrors(p => ({ ...p, [key]: undefined }));
    setServerError('');
  };

  const toggleShow = (key) => setShowPwd(p => ({ ...p, [key]: !p[key] }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!fields.current_password)            errs.current_password = 'Current password is required.';
    if (fields.new_password.length < 6)      errs.new_password = 'Must be at least 6 characters.';
    if (fields.new_password !== fields.new_password_confirmation)
      errs.new_password_confirmation = 'Passwords do not match.';
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSubmitting(true);
    setServerError('');
    try {
      await profileApi.changePassword(fields);
      setSaved(true);
      setFields({ current_password: '', new_password: '', new_password_confirmation: '' });
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setServerError(err.message ?? 'Could not change password.');
      if (err.errors) setErrors(err.errors);
    } finally {
      setSubmitting(false);
    }
  };

  const pwdField = (id, label, key, showKey) => (
    <Field label={label} id={id} error={errors[key]}>
      <div className="settings-pwd-wrap">
        <input
          id={id}
          type={showPwd[showKey] ? 'text' : 'password'}
          className={`settings-input${errors[key] ? ' settings-input--error' : ''}`}
          value={fields[key]}
          onChange={set(key)}
          autoComplete={key === 'current_password' ? 'current-password' : 'new-password'}
        />
        <button
          type="button"
          className="settings-pwd-toggle"
          onClick={() => toggleShow(showKey)}
          aria-label={showPwd[showKey] ? 'Hide password' : 'Show password'}
        >
          <i className={`lni ${showPwd[showKey] ? 'lni-eye' : 'lni-eye'}`} />
        </button>
      </div>
    </Field>
  );

  return (
    <form className="settings-section-body" onSubmit={handleSubmit} noValidate>
      {serverError && (
        <div className="settings-error-banner" role="alert">
          <i className="lni lni-warning" /> {serverError}
        </div>
      )}
      <div className="settings-fields-grid settings-fields-grid--single">
        {pwdField('s-cur-pwd',  'Current Password',      'current_password',          'current')}
        {pwdField('s-new-pwd',  'New Password',           'new_password',              'new')}
        {pwdField('s-conf-pwd', 'Confirm New Password',  'new_password_confirmation', 'confirm')}
      </div>
      <div className="settings-actions">
        <SaveBtn submitting={submitting} saved={saved} />
      </div>
    </form>
  );
}

/* ─── Danger zone ────────────────────────────────────────────── */
function DangerSection({ onLogout }) {
  return (
    <div className="settings-section-body">
      <p className="settings-hint" style={{ marginBottom: 20 }}>
        Logging out will clear your local session. Your orders and wishlist tied to your account remain safe.
      </p>
      <button type="button" className="settings-logout-btn" onClick={onLogout}>
        <i className="lni lni-exit" /> Sign Out
      </button>
    </div>
  );
}

/* ─── Main page ──────────────────────────────────────────────── */
const SECTIONS = ['Profile', 'Password', 'Account'];

export default function SettingsPage() {
  const { user, loading, logout, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [active, setActive] = useState('Profile');

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="container section">
        <div className="product-skeleton" style={{ height: 200, borderRadius: 12 }} />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container section">
        <div className="settings-unauthenticated">
          <i className="lni lni-lock-alt" />
          <h3>Sign in to manage your account</h3>
          <Link to="/login" state={{ from: { pathname: '/settings' } }} className="btn">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="settings-page">
      <div className="container">
        <Breadcrumb crumbs={[{ label: 'Home', to: '/' }, { label: 'Settings' }]} />

        <div className="settings-layout">

          {/* ── Sidebar ── */}
          <aside className="settings-sidebar">
            <div className="settings-avatar">
              <div className="settings-avatar-circle">
                {(user.full_name?.[0] ?? '?').toUpperCase()}
              </div>
              <div>
                <div className="settings-avatar-name">{user.full_name}</div>
                <div className="settings-avatar-email">{user.email}</div>
              </div>
            </div>

            <nav className="settings-nav" aria-label="Settings sections">
              {SECTIONS.map(s => (
                <button
                  key={s}
                  className={`settings-nav-item${active === s ? ' active' : ''}`}
                  onClick={() => setActive(s)}
                >
                  <i className={`lni ${
                    s === 'Profile'  ? 'lni-user' :
                    s === 'Password' ? 'lni-lock-alt' :
                    'lni-warning'
                  }`} />
                  {s === 'Account' ? 'Account Actions' : s}
                </button>
              ))}
            </nav>

            <div className="settings-sidebar-links">
              <Link to="/orders"><i className="lni lni-package" /> My Orders</Link>
              <Link to="/wishlist"><i className="lni lni-heart" /> Wishlist</Link>
            </div>
          </aside>

          {/* ── Content ── */}
          <main className="settings-content">
            {active === 'Profile' && (
              <section className="settings-section">
                <div className="settings-section-header">
                  <h2>Profile Information</h2>
                  <p>Update your name and phone number.</p>
                </div>
                <ProfileSection user={user} onUpdated={refreshUser} />
              </section>
            )}

            {active === 'Password' && (
              <section className="settings-section">
                <div className="settings-section-header">
                  <h2>Change Password</h2>
                  <p>Use a strong password you don't use elsewhere.</p>
                </div>
                <PasswordSection />
              </section>
            )}

            {active === 'Account' && (
              <section className="settings-section">
                <div className="settings-section-header">
                  <h2>Account Actions</h2>
                </div>
                <DangerSection onLogout={handleLogout} />
              </section>
            )}
          </main>

        </div>
      </div>
    </div>
  );
}
