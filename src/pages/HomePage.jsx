import SmallBanners from '../components/home/SmallBanners';
import TrendingProducts from '../components/home/TrendingProducts';
import TodaysDeals from '../components/home/TodaysDeals';
import NewArrivals from '../components/home/NewArrivals';
import HotProducts from '../components/home/HotProducts';
import SaleProducts from '../components/home/SaleProducts';
import Hero from '../components/home/Hero';
import RecentlyViewed from '../components/home/RecentlyViewed';
import PromoBanners from '../components/home/PromoBanners';
import HeroSlider from '../components/home/HeroSlider';

import ShippingInfo from '../components/home/ShippingInfo';
import PromoHeader from '../components/home/PromoHeader';
import CategoryGridBanner from '../components/home/CategoryGridBanner';
import CategoryDeals from '../components/home/CategoryDeals';
import PromoCarousel from '../components/home/PromoCarousel';
import { heroSlides } from '../data/homeData';
import { productsApi } from '../services/api';
import { useApi } from '../hooks/useApi';
import FeaturedVideos from '../components/home/FeaturedVideos';

export default function HomePage() {
  const { data: trendingData, loading: trendingLoading } =
    useApi(() => productsApi.trending(12), []);

  const { data: dealsData, loading: dealsLoading } =
    useApi(() => productsApi.deals(12), []);

  const { data: newData, loading: newLoading } =
    useApi(() => productsApi.newArrivals(12), []);

  const { data: hotData, loading: hotLoading } =
    useApi(() => productsApi.hot(12), []);

  const { data: saleData, loading: saleLoading } =
    useApi(() => productsApi.sale(12), []);

  return (
    <div data-testid="home-page">
      <PromoCarousel />
      <CategoryDeals />
      <CategoryGridBanner />
      <TrendingProducts products={trendingData?.products ?? []} loading={trendingLoading} />
      <PromoHeader />
      <Hero />
      <NewArrivals products={newData?.products ?? []} loading={newLoading} />
      <TodaysDeals products={dealsData?.products ?? []} loading={dealsLoading} />
      <HotProducts products={hotData?.products ?? []} loading={hotLoading} />
      <SaleProducts products={saleData?.products ?? []} loading={saleLoading} />
      <PromoBanners />
      <FeaturedVideos />
      <RecentlyViewed />
    </div>
  );
}
