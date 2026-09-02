import { useState } from 'react';
import { Link } from 'react-router-dom';
import Breadcrumb from '../components/layout/Breadcrumb';
import { contactApi } from '../services/api';
import { siteConfig } from '../data/siteConfig';

const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(f) {
  const e = {};
  if (!f.name.trim())    e.name    = 'Name is required.';
  if (!f.email.trim())   e.email   = 'Email is required.';
  else if (!emailRx.test(f.email.trim())) e.email = 'Please enter a valid email.';
  if (!f.subject.trim()) e.subject = 'Subject is required.';
  if (!f.message.trim()) e.message = 'Message is required.';
  else if (f.message.trim().length < 20) e.message = 'Message must be at least 20 characters.';
  return e;
}

const EMPTY = { name: '', email: '', subject: '', message: '' };

const SUBJECT_OPTIONS = [
  'Order Enquiry',
  'Product Question',
  'Delivery Issue',
  'Return / Refund',
  'Payment Issue',
  'Other',
];

export default function ContactPage() {
  const [fields,  setFields]  = useState(EMPTY);
  const [errors,  setErrors]  = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [sent,    setSent]    = useState(false);
  const [serverError, setServerError] = useState('');

  const handle = (e) => {
    const { name, value } = e.target;
    setFields(p => ({ ...p, [name]: value }));
    setErrors(p => ({ ...p, [name]: undefined }));
    setServerError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate(fields);
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSubmitting(true);
    setServerError('');
    try {
      await contactApi.send(fields);
      setSent(true);
      setFields(EMPTY);
      setErrors({});
    } catch (err) {
      setServerError(err.message ?? 'Failed to send message. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="contact-page section" data-testid="contact-page">
      <div className="container">
        <Breadcrumb crumbs={[{ label: 'Home', to: '/' }, { label: 'Contact Us' }]} />

        {/* ── Page header ── */}
        <div className="contact-page-header">
          <h1>Get in Touch</h1>
          <p>Have a question, issue, or just want to say hello? We'd love to hear from you.</p>
        </div>

        <div className="contact-page-grid">

          {/* ── Left: Form ── */}
          <div className="contact-form-col">
            {sent ? (
              <div className="contact-sent-state">
                <div className="contact-sent-icon">
                  <i className="lni lni-checkmark-circle" />
                </div>
                <h3>Message sent!</h3>
                <p>Thanks for reaching out. We'll get back to you within one business day.</p>
                <button
                  className="btn"
                  style={{ marginTop: 16 }}
                  onClick={() => setSent(false)}
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="contact-form">
                <h2 className="contact-form-title">Send a Message</h2>

                {serverError && (
                  <div className="contact-server-error" role="alert">
                    <i className="lni lni-warning" /> {serverError}
                  </div>
                )}

                {/* Name + Email row */}
                <div className="contact-form-row">
                  <div className="contact-form-group">
                    <label htmlFor="c-name">Your Name *</label>
                    <input
                      id="c-name" type="text" name="name"
                      className={`contact-input${errors.name ? ' contact-input--err' : ''}`}
                      placeholder="Full name"
                      value={fields.name} onChange={handle}
                      autoComplete="name"
                    />
                    {errors.name && <span className="contact-field-error">{errors.name}</span>}
                  </div>

                  <div className="contact-form-group">
                    <label htmlFor="c-email">Email Address *</label>
                    <input
                      id="c-email" type="email" name="email"
                      className={`contact-input${errors.email ? ' contact-input--err' : ''}`}
                      placeholder="you@example.com"
                      value={fields.email} onChange={handle}
                      autoComplete="email"
                    />
                    {errors.email && <span className="contact-field-error">{errors.email}</span>}
                  </div>
                </div>

                {/* Subject */}
                <div className="contact-form-group">
                  <label htmlFor="c-subject">Subject *</label>
                  <select
                    id="c-subject" name="subject"
                    className={`contact-input contact-select${errors.subject ? ' contact-input--err' : ''}`}
                    value={fields.subject} onChange={handle}
                  >
                    <option value="">Select a topic…</option>
                    {SUBJECT_OPTIONS.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  {errors.subject && <span className="contact-field-error">{errors.subject}</span>}
                </div>

                {/* Message */}
                <div className="contact-form-group">
                  <label htmlFor="c-message">Message * <span className="contact-char-hint">({fields.message.length} / min 20)</span></label>
                  <textarea
                    id="c-message" name="message"
                    className={`contact-input contact-textarea${errors.message ? ' contact-input--err' : ''}`}
                    rows={6}
                    placeholder="Describe your question or issue…"
                    value={fields.message} onChange={handle}
                  />
                  {errors.message && <span className="contact-field-error">{errors.message}</span>}
                </div>

                <button type="submit" className="btn contact-submit-btn" disabled={submitting}>
                  {submitting ? (
                    <><span className="settings-spinner" /> Sending…</>
                  ) : (
                    <><i className="lni lni-telegram-original" /> Send Message</>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* ── Right: Info ── */}
          <aside className="contact-info-col">
            <h2 className="contact-info-title">Our Details</h2>

            <div className="contact-info-cards">
              <div className="contact-info-card">
                <div className="contact-info-card-icon">
                  <i className="lni lni-map-marker" />
                </div>
                <div>
                  <strong>Location</strong>
                  <span>{siteConfig.address}</span>
                </div>
              </div>

              <div className="contact-info-card">
                <div className="contact-info-card-icon">
                  <i className="lni lni-phone" />
                </div>
                <div>
                  <strong>Phone / WhatsApp</strong>
                  <a href={`tel:${siteConfig.phoneRaw}`}>{siteConfig.phone}</a>
                </div>
              </div>

              <div className="contact-info-card">
                <div className="contact-info-card-icon">
                  <i className="lni lni-envelope" />
                </div>
                <div>
                  <strong>Email</strong>
                  <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>
                </div>
              </div>

              <div className="contact-info-card">
                <div className="contact-info-card-icon">
                  <i className="lni lni-clock" />
                </div>
                <div>
                  <strong>Business Hours</strong>
                  <span>{siteConfig.hours.weekdays}<br />{siteConfig.hours.saturday}</span>
                </div>
              </div>
            </div>

            <div className="contact-social">
              <p>Follow us</p>
              <div className="contact-social-links">
                <a href={siteConfig.social.facebook} aria-label="Facebook" target="_blank" rel="noreferrer">
                  <i className="lni lni-facebook-filled" />
                </a>
                <a href={siteConfig.social.instagram} aria-label="Instagram" target="_blank" rel="noreferrer">
                  <i className="lni lni-instagram" />
                </a>
                <a href={siteConfig.social.twitter} aria-label="Twitter" target="_blank" rel="noreferrer">
                  <i className="lni lni-twitter-original" />
                </a>
              </div>
            </div>

            <div className="contact-help-link">
              <i className="lni lni-question-circle" />
              <span>Browse our <Link to="/help">Help Center</Link> for quick answers.</span>
            </div>
          </aside>

        </div>
      </div>
    </div>
  );
}
