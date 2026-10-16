import { Outlet } from 'react-router-dom';
import { Toaster } from 'sonner';
import Header from './Header/Header';
import Footer from './Footer/Footer';
import ScrollToTop from './ScrollToTop';
import Preloader from './Preloader';
import CookieBanner from './CookieBanner';
import AddToCartModal from '../product/AddToCartModal';
import { useCart } from '../../context/CartContext';

export default function AppLayout() {
  const { quickViewProduct, setQuickViewProduct } = useCart();

  return (
    <>
      <Header />
      <main className="app-main-content">
        <Outlet />
      </main>
      <Footer />
      <ScrollToTop />
      <Preloader />
      <CookieBanner />
      <Toaster position="top-right" richColors closeButton />
      
      {quickViewProduct && (
        <AddToCartModal 
          product={quickViewProduct} 
          isOpen={!!quickViewProduct} 
          onClose={() => setQuickViewProduct(null)} 
        />
      )}
    </>
  );
}
