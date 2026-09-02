import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth }   from '../context/AuthContext';
import { ApiError }  from '../services/api';

const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRx = /^\+?[\d\s\-().]{7,15}$/;

function validate(fields) {
  const errors = {};
  if (!fields.fullName.trim())  errors.fullName = 'Full name is required.';
  if (!fields.email.trim())     errors.email    = 'Email is required.';
  else if (!emailRx.test(fields.email.trim())) errors.email = 'Please enter a valid email address.';
  if (!fields.phone.trim())     errors.phone    = 'Phone number is required.';
  else if (!phoneRx.test(fields.phone.trim())) errors.phone = 'Phone must be 7–15 digits.';
  if (!fields.password)         errors.password = 'Password is required.';
  else if (fields.password.length < 6) errors.password = 'Password must be at least 6 characters.';
  if (fields.confirmPassword !== fields.password) errors.confirmPassword = 'Passwords do not match.';
  return errors;
}

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate     = useNavigate();

  const [fields, setFields] = useState({
    fullName: '', email: '', phone: '', password: '', confirmPassword: '',
  });
  const [errors,      setErrors]      = useState({});
  const [submitted,   setSubmitted]   = useState(false);
  const [submitting,  setSubmitting]  = useState(false);
  const [serverError, setServerError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFields(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    const errs = validate(fields);
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setSubmitting(true);
    setServerError('');
    try {
      await register({
        full_name:             fields.fullName,
        email:                 fields.email,
        phone:                 fields.phone,
        password:              fields.password,
        password_confirmation: fields.confirmPassword,
      });
      navigate('/', { replace: true });
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.errors && Object.keys(err.errors).length > 0) {
          const mapped = {};
          if (err.errors.email)    mapped.email    = err.errors.email;
          if (err.errors.phone)    mapped.phone    = err.errors.phone;
          if (err.errors.password) mapped.password = err.errors.password;
          setErrors(mapped);
        } else {
          setServerError(err.message);
        }
      } else {
        setServerError('Registration failed. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const fieldError = (name) => submitted && errors[name]
    ? <p id={`err-${name}`} className="login-error" role="alert">{errors[name]}</p>
    : null;

  return (
    <div className="login-standalone-page">
      <div className="login-card" style={{ maxWidth: '440px' }}>

        <div className="login-logo">
          <Link to="/"><img src="/assets/images/logo/logo.svg" alt="Kenvies Accessories" /></Link>
        </div>

        <h1 className="login-title">Create Account</h1>
        <p className="login-subtitle">Join Kenvies Accessories today.</p>

        {serverError && (
          <div className="login-error-banner" role="alert">{serverError}</div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {[
            { name: 'fullName',        type: 'text',     label: 'Full Name',          autocomplete: 'name' },
            { name: 'email',           type: 'email',    label: 'Email Address',      autocomplete: 'email' },
            { name: 'phone',           type: 'tel',      label: 'Phone Number',       autocomplete: 'tel' },
            { name: 'password',        type: 'password', label: 'Password (min 6)',   autocomplete: 'new-password' },
            { name: 'confirmPassword', type: 'password', label: 'Confirm Password',   autocomplete: 'new-password' },
          ].map(({ name, type, label, autocomplete }) => (
            <div className="login-field-wrap" key={name}>
              <input
                type={type}
                name={name}
                className={`login-input${submitted && errors[name] ? ' login-input--error' : ''}`}
                placeholder={label}
                value={fields[name]}
                onChange={handleChange}
                autoComplete={autocomplete}
                aria-label={label}
                aria-describedby={errors[name] ? `err-${name}` : undefined}
              />
              {fieldError(name)}
            </div>
          ))}

          <button type="submit" className="login-btn-primary" disabled={submitting}>
            {submitting ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p className="login-help" style={{ marginTop: '20px' }}>
          Already have an account? <Link to="/login">Sign In</Link>
        </p>
        <p className="login-legal">
          By registering you agree to Kenvies Accessories&apos;{' '}
          <Link to="/terms">Terms and Conditions</Link>{' '}&amp;{' '}
          <Link to="/privacy">Privacy Policy</Link>
        </p>
      </div>
    </div>
  );
}
