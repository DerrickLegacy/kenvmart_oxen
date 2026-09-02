import Breadcrumb from '../components/layout/Breadcrumb';

export default function CheckoutPage() {
  return (
    <div data-testid="checkout-page" className="checkout section">
      <div className="container">
        <Breadcrumb crumbs={[{ label: 'Home', to: '/' }, { label: 'Checkout' }]} />
        <div className="row">
          <div className="col-lg-8 col-12">
            <h2>Checkout</h2>
            <div className="checkout-form">
              <h4>Billing Information</h4>
              <div className="row g-3">
                <div className="col-md-6 col-12">
                  <input type="text" className="form-control" placeholder="First Name" />
                </div>
                <div className="col-md-6 col-12">
                  <input type="text" className="form-control" placeholder="Last Name" />
                </div>
                <div className="col-12">
                  <input type="email" className="form-control" placeholder="Email Address" />
                </div>
                <div className="col-12">
                  <input type="text" className="form-control" placeholder="Address" />
                </div>
              </div>
            </div>
          </div>
          <div className="col-lg-4 col-12">
            <div className="order-summary">
              <h4>Order Summary</h4>
              <button className="btn btn-primary w-100">Place Order</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
