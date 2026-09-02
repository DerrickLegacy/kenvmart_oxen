import { useState } from 'react';
import { Link } from 'react-router-dom';
import Breadcrumb from '../components/layout/Breadcrumb';
import { siteConfig } from '../data/siteConfig';

const CATEGORIES = [
  {
    icon: 'lni-cart',
    title: 'Orders & Checkout',
    items: [
      {
        q: 'How do I place an order?',
        a: 'Browse our products, add items to your cart, then click "Send Order" in your cart. Our team will contact you to confirm and arrange delivery.',
      },
      {
        q: 'Can I modify or cancel my order?',
        a: "Yes — as long as the order status is still \"Pending\" you can update quantities or cancel directly from your Orders page. Once processing starts, contact us and we'll do our best to help.",
      },
      {
        q: 'Do I need an account to order?',
        a: "No. You can browse and use the cart without signing in. Creating an account lets you track orders, save your wishlist, and check out faster.",
      },
    ],
  },
  {
    icon: 'lni-delivery',
    title: 'Delivery & Shipping',
    items: [
      {
        q: 'Where do you deliver?',
        a: 'We deliver across Kampala and surrounding areas. For upcountry orders, we ship via courier — our team will advise on cost and timeline when confirming your order.',
      },
      {
        q: 'How long does delivery take?',
        a: 'Same-day or next-day for most Kampala orders placed before 3 pm. Upcountry deliveries typically take 2–4 business days depending on location.',
      },
      {
        q: 'How much does delivery cost?',
        a: 'Delivery fees depend on your location and are confirmed when we process your order. Kampala central deliveries are often free on orders above a minimum value.',
      },
    ],
  },
  {
    icon: 'lni-reload',
    title: 'Returns & Warranty',
    items: [
      {
        q: 'What is your return policy?',
        a: "We accept returns within 7 days of purchase if the item is unused and in its original packaging. Contact us with your order details and we'll guide you through the process.",
      },
      {
        q: 'What warranty do your products carry?',
        a: "Most accessories come with a manufacturer's warranty — duration varies by product and brand. Warranty information is listed on individual product pages where available.",
      },
      {
        q: 'My item arrived damaged. What do I do?',
        a: 'Please contact us within 24 hours of receiving the item with photos of the damage. We will arrange a replacement or refund promptly.',
      },
    ],
  },
  {
    icon: 'lni-credit-cards',
    title: 'Payments',
    items: [
      {
        q: 'What payment methods do you accept?',
        a: 'We accept Mobile Money (MTN MoMo & Airtel Money), cash on delivery, and bank transfers. Card payments are coming soon.',
      },
      {
        q: 'Is it safe to pay online?',
        a: 'Yes. All transactions are processed securely. We never store your payment details.',
      },
      {
        q: 'Can I pay on delivery?',
        a: 'Yes — cash on delivery is available for most Kampala orders. Our team will confirm this when processing your order.',
      },
    ],
  },
];

function Accordion({ items }) {
  const [open, setOpen] = useState(null);
  return (
    <div className="help-accordion">
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={i} className={`help-accordion-item${isOpen ? ' open' : ''}`}>
            <button
              className="help-accordion-q"
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
            >
              <span>{item.q}</span>
              <i className={`lni ${isOpen ? 'lni-chevron-up' : 'lni-chevron-down'}`} />
            </button>
            {isOpen && <div className="help-accordion-a"><p>{item.a}</p></div>}
          </div>
        );
      })}
    </div>
  );
}

export default function HelpPage() {
  const [activeCategory, setActiveCategory] = useState(0);

  return (
    <div className="help-page section">
      <div className="container">
        <Breadcrumb crumbs={[{ label: 'Home', to: '/' }, { label: 'Help Center' }]} />

        {/* ── Hero ── */}
        <div className="help-hero">
          <h1>How can we help you?</h1>
          <p>Find answers to common questions or reach out to our team.</p>
          <Link to="/contact" className="btn help-hero-cta">
            <i className="lni lni-envelope" /> Contact Support
          </Link>
        </div>

        {/* ── Quick contact strip ── */}
        <div className="help-contact-strip">
          <div className="help-contact-item">
            <i className="lni lni-phone" />
            <div>
              <span className="help-contact-label">Call us</span>
              <a href={`tel:${siteConfig.phoneRaw}`}>{siteConfig.phone}</a>
            </div>
          </div>
          <div className="help-contact-item">
            <i className="lni lni-envelope" />
            <div>
              <span className="help-contact-label">Email</span>
              <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>
            </div>
          </div>
          <div className="help-contact-item">
            <i className="lni lni-clock" />
            <div>
              <span className="help-contact-label">Hours</span>
              <span>{siteConfig.hours.weekdays}<br />{siteConfig.hours.saturday}</span>
            </div>
          </div>
        </div>

        {/* ── Category tabs + FAQ ── */}
        <div className="help-main">
          <div className="help-tabs" role="tablist">
            {CATEGORIES.map((cat, i) => (
              <button
                key={i}
                role="tab"
                aria-selected={activeCategory === i}
                className={`help-tab${activeCategory === i ? ' active' : ''}`}
                onClick={() => setActiveCategory(i)}
              >
                <i className={`lni ${cat.icon}`} />
                <span>{cat.title}</span>
              </button>
            ))}
          </div>

          <div className="help-tab-content" role="tabpanel">
            <h2 className="help-section-title">
              <i className={`lni ${CATEGORIES[activeCategory].icon}`} />
              {CATEGORIES[activeCategory].title}
            </h2>
            <Accordion items={CATEGORIES[activeCategory].items} />
          </div>
        </div>

        {/* ── Still need help ── */}
        <div className="help-still-stuck">
          <h3>Still need help?</h3>
          <p>Our support team is ready to assist you.</p>
          <Link to="/contact" className="btn">Send Us a Message</Link>
        </div>

      </div>
    </div>
  );
}
