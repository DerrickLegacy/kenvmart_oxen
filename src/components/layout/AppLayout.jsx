import { Outlet } from 'react-router-dom';
import Header from './Header/Header';
import Footer from './Footer/Footer';
import ScrollToTop from './ScrollToTop';
import Preloader from './Preloader';

export default function AppLayout() {
  return (
    <>
      <Header />
      <Outlet />
      <Footer />
      <ScrollToTop />
      <Preloader />
    </>
  );
}
