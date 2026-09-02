import { shippingFeatures } from '../../data/homeData';

export default function ShippingInfo() {
  return (
    <section className="shipping-info">
      <div className="container">
        <ul>
          {shippingFeatures.map((item) => (
            <li key={item.title}>
              <div className="media-icon">
                <i className={item.icon}></i>
              </div>
              <div className="media-body">
                <h5>{item.title}</h5>
                <span>{item.description}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
