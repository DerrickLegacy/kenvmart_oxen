import { useState } from 'react';
import { Link } from 'react-router-dom';
import Breadcrumb from '../components/layout/Breadcrumb';
import { faqs } from '../data/homeData';

export default function FaqPage() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (index) => {
    setOpenIndex(prev => (prev === index ? null : index));
  };

  return (
    <div data-testid="faq-page" className="faq section">
      <Breadcrumb crumbs={[{ label: 'Home', to: '/' }, { label: 'FAQ' }]} />
      <div className="container">

        <div className="row justify-content-center">
          <div className="col-lg-8 col-12">

            <h2 style={{ fontWeight: 700, marginBottom: '8px' }}>
              Frequently Asked Questions
            </h2>
            <p style={{ color: '#666', marginBottom: '32px' }}>
              Can&apos;t find the answer you&apos;re looking for?{' '}
              <Link to="/contact">Contact our support team</Link>.
            </p>

            <div className="faq-accordion">
              {faqs.map((item, index) => {
                const isOpen = openIndex === index;
                return (
                  <div key={index} className={`faq-item${isOpen ? ' faq-item--open' : ''}`}>
                    <button
                      className="faq-question"
                      onClick={() => toggle(index)}
                      aria-expanded={isOpen}
                      aria-controls={`faq-answer-${index}`}
                      id={`faq-question-${index}`}
                    >
                      <span>{item.q}</span>
                      <i className={`lni ${isOpen ? 'lni-chevron-up' : 'lni-chevron-down'}`}></i>
                    </button>
                    {isOpen && (
                      <div
                        id={`faq-answer-${index}`}
                        className="faq-answer"
                        role="region"
                        aria-labelledby={`faq-question-${index}`}
                      >
                        <p>{item.a}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
