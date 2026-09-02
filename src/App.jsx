import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppLayout          from './components/layout/AppLayout';
import HomePage           from './pages/HomePage';
import ProductsPage       from './pages/ProductsPage';
import ProductDetailsPage from './pages/ProductDetailsPage';
import CartPage           from './pages/CartPage';
import OrdersPage         from './pages/OrdersPage';
import LoginPage          from './pages/LoginPage';
import RegisterPage       from './pages/RegisterPage';
import AboutPage          from './pages/AboutPage';
import FaqPage            from './pages/FaqPage';
import ContactPage        from './pages/ContactPage';
import NotFoundPage       from './pages/NotFoundPage';
import WishlistPage       from './pages/WishlistPage';
import SettingsPage       from './pages/SettingsPage';
import HelpPage           from './pages/HelpPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login"    element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/" element={<AppLayout />}>
          <Route index                   element={<HomePage />} />
          <Route path="products"         element={<ProductsPage />} />
          <Route path="product/:id"      element={<ProductDetailsPage />} />
          <Route path="cart"             element={<CartPage />} />
          <Route path="orders"           element={<OrdersPage />} />
          <Route path="wishlist"         element={<WishlistPage />} />
          <Route path="settings"         element={<SettingsPage />} />
          <Route path="help"             element={<HelpPage />} />
          <Route path="about"            element={<AboutPage />} />
          <Route path="faq"              element={<FaqPage />} />
          <Route path="contact"          element={<ContactPage />} />
          <Route path="checkout"         element={<CartPage />} />
          <Route path="*"                element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
