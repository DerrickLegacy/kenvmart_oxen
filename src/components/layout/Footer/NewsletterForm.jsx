import { useState } from 'react';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MAX_EMAIL_LENGTH = 254;

export default function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!email.trim()) {
      setError('Please enter your email address');
      setSuccess(false);
      return;
    }

    if (email.length > MAX_EMAIL_LENGTH || !EMAIL_REGEX.test(email)) {
      setError('Please enter a valid email address');
      setSuccess(false);
      return;
    }

    setError(null);
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      setEmail('');
    }, 3000);
  };

  return (
    <div className="newsletter-form-head">
      <form className="newsletter-form" onSubmit={handleSubmit}>
        <input
          name="EMAIL"
          type="email"
          placeholder="Email address here..."
          value={email}
          onChange={e => setEmail(e.target.value)}
          maxLength={254}
        />
        <div className="button">
          <button type="submit" className="btn">Subscribe<span className="dir-part"></span></button>
        </div>
      </form>
      {error && <span className="error" role="alert">{error}</span>}
      {success && <span className="success" role="status">Thank you for subscribing!</span>}
    </div>
  );
}
