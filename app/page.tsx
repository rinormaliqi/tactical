import Header from '@/components/store/Header';
import Hero from '@/components/store/Hero';
import Footer from '@/components/store/Footer';
import FeaturedSection from '@/components/store/FeaturedSection';

export default function HomePage() {
  return (
    <>
      <Header transparent />
      <main>
        <Hero />
        <FeaturedSection />
      </main>
      <Footer />
    </>
  );
}
