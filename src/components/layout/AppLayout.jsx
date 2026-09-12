import { Outlet } from 'react-router-dom';
import { Toaster } from 'sonner';
import Header from './Header/Header';
import Footer from './Footer/Footer';
import ScrollToTop from './ScrollToTop';
import Preloader from './Preloader';
import CookieBanner from './CookieBanner';

export default function AppLayout() {
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
    </>
  );
}
