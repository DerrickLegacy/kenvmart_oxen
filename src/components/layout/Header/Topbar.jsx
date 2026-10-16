import React from 'react';

export default function Topbar() {
  return (
    <div className="topbar" style={{ background: '#0b1a33', color: '#fff', padding: '8px 0', fontSize: '13px' }}>
      <div className="container">
        <div className="row">
          <div className="col-12">
            <div className="text-center">
              <span className="flash-deal-text">
                <i className="lni lni-bolt-alt mr-2" style={{ color: '#e18f27' }} />
                <strong>Flash Sale:</strong> Up to 70% off on all Chargers & Accessories! Limited time only.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}