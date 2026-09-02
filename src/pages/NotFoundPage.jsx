import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div data-testid="not-found-page" className="not-found-page">
      <div className="not-found-code">404</div>
      <h2 className="not-found-title">Oops! Page not found</h2>
      <p className="not-found-message">
        The page you&apos;re looking for doesn&apos;t exist or may have been moved.
        <br />
        Let&apos;s get you back on track.
      </p>
      <div className="not-found-actions">
        <Link to="/" className="btn">
          <i className="lni lni-home"></i> Go Home
        </Link>
        <Link to="/products" className="btn btn-outline">
          <i className="lni lni-shop"></i> Browse Products
        </Link>
      </div>
    </div>
  );
}
