export default function CookiesPolicyPage() {
  return (
    <div className="container" style={{ maxWidth: 800, padding: '40px 20px 60px' }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>
        Cookies Policy
      </h1>
      <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 32 }}>
        Last updated: September 2026
      </p>

      <Section title="What are cookies?">
        Cookies are small text files placed on your device when you visit a website.
        They help the site remember your preferences and improve your experience.
      </Section>

      <Section title="How we use cookies">
        KenvieStores uses cookies to:
        <ul style={{ marginTop: 10, paddingLeft: 20, lineHeight: 2 }}>
          <li>Keep you signed in across pages</li>
          <li>Remember items in your cart and wishlist</li>
          <li>Understand how visitors use the site so we can improve it</li>
          <li>Show you relevant products and promotions</li>
        </ul>
      </Section>

      <Section title="Types of cookies we use">
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14, marginTop: 10 }}>
          <thead>
            <tr style={{ background: '#f8f9fc', textAlign: 'left' }}>
              <Th>Type</Th>
              <Th>Purpose</Th>
              <Th>Duration</Th>
            </tr>
          </thead>
          <tbody>
            <Row type="Essential" purpose="Cart, wishlist, and login session" duration="Session" />
            <Row type="Functional" purpose="Remember your preferences (language, region)" duration="1 year" />
            <Row type="Analytics" purpose="Understand how pages are used (page views, clicks)" duration="2 years" />
          </tbody>
        </table>
      </Section>

      <Section title="Your choices">
        You can control cookies through the banner shown when you first visit the site.
        You can also clear cookies at any time through your browser settings.
        Note that disabling essential cookies may affect site functionality (e.g. your cart
        may not persist between visits).
      </Section>

      <Section title="Third-party cookies">
        We do not currently use any third-party advertising or tracking cookies.
        If this changes, this policy will be updated.
      </Section>

      <Section title="Contact us">
        If you have questions about this policy, contact us at{' '}
        <a href="/contact" style={{ color: '#183B9B', fontWeight: 600 }}>our contact page</a>.
      </Section>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', marginBottom: 10 }}>
        {title}
      </h2>
      <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.75 }}>{children}</p>
    </div>
  );
}

function Th({ children }) {
  return (
    <th style={{ padding: '10px 14px', fontWeight: 700, fontSize: 13,
      borderBottom: '2px solid #e5e7eb', color: '#0f172a' }}>
      {children}
    </th>
  );
}

function Row({ type, purpose, duration }) {
  return (
    <tr style={{ borderBottom: '1px solid #f0f2f5' }}>
      <td style={{ padding: '10px 14px', fontWeight: 600, color: '#183B9B' }}>{type}</td>
      <td style={{ padding: '10px 14px', color: '#374151' }}>{purpose}</td>
      <td style={{ padding: '10px 14px', color: '#6b7280' }}>{duration}</td>
    </tr>
  );
}
