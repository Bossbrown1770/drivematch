import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import CarCard from '@/components/cars/CarCard';
import { Button } from '@/components/ui/button';
import { ArrowRight, Shield, Zap, Award, Phone } from 'lucide-react';
import { motion } from 'framer-motion';

const fadeUp = { hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

export default function Home() {
  const [featuredCars, setFeaturedCars] = useState([]);
  const [latestCars, setLatestCars] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCars = async () => {
      setLoading(true);
      const [featuredRes, latestRes] = await Promise.all([
        supabase
          .from('cars')
          .select('*')
          .eq('featured', true)
          .eq('status', 'Available')
          .order('created_at', { ascending: false })
          .limit(6),
        supabase
          .from('cars')
          .select('*')
          .eq('status', 'Available')
          .order('created_at', { ascending: false })
          .limit(8)
      ]);
      if (featuredRes.data) setFeaturedCars(featuredRes.data);
      if (latestRes.data) setLatestCars(latestRes.data);
      setLoading(false);
    };
    fetchCars();
  }, []);

  return (
    <div className="overflow-hidden">
      {/* Hero */}
      <section className="relative min-h-[85vh] flex items-center bg-gradient-to-br from-slate-900 via-primary/90 to-slate-800 overflow-hidden">
        <div className="opacity-10 rounded absolute inset-0">
          <div className="absolute top-20 left-20 w-96 h-96 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-20 right-20 w-64 h-64 rounded-full bg-accent blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 text-white">
          <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.15 } } }} className="max-w-3xl">
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm mb-6">
              <Zap className="w-3.5 h-3.5 text-accent" />
              <span>Trusted by thousands of buyers nationwide</span>
            </motion.div>
            <motion.h1 variants={fadeUp} className="font-playfair text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight mb-6">
              Find Your <span className="text-accent">Perfect</span> Drive
            </motion.h1>
            <motion.p variants={fadeUp} className="text-lg sm:text-xl text-white/80 mb-8 leading-relaxed max-w-2xl">
              Premium selection of new, used, and certified pre-owned vehicles. Transparent pricing, detailed history, and flexible financing options.
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-wrap gap-3">
              <Link to="/inventory">
                <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2 h-12 px-6 font-semibold shadow-lg">
                  Browse Inventory <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link to="/inventory?condition=New">
                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 h-12 px-6">
                  New Arrivals
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
        <div className="absolute right-0 top-0 bottom-0 w-1/2 hidden lg:block">
          <img
            src="https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=900&q=85"
            alt="Premium car"
            className="w-full h-full object-cover opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 to-transparent" />
        </div>
      </section>

      {/* Stats */}
      <section className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: 'Vehicles in Stock', value: '500+' },
              { label: 'Happy Customers', value: '10K+' },
              { label: 'Years Experience', value: '15+' },
              { label: 'Brands Available', value: '40+' }
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-2xl sm:text-3xl font-bold font-playfair text-primary">{s.value}</p>
                <p className="text-sm text-muted-foreground mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Cars */}
      {(featuredCars.length > 0 || loading) && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-sm font-semibold text-accent uppercase tracking-widest mb-1">Handpicked</p>
              <h2 className="font-playfair text-3xl sm:text-4xl font-bold">Featured Vehicles</h2>
            </div>
            <Link to="/inventory?featured=true">
              <Button variant="ghost" className="gap-1.5 text-primary hidden sm:flex">View all <ArrowRight className="w-4 h-4" /></Button>
            </Link>
          </div>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array(3).fill(0).map((_, i) => <CarSkeleton key={i} />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredCars.map((car) => <CarCard key={car.id} car={car} />)}
            </div>
          )}
        </section>
      )}

      {/* Latest Listings */}
      <section className="bg-muted/40 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-sm font-semibold text-accent uppercase tracking-widest mb-1">Fresh Stock</p>
              <h2 className="font-playfair text-3xl sm:text-4xl font-bold">Latest Listings</h2>
            </div>
            <Link to="/inventory">
              <Button variant="ghost" className="gap-1.5 text-primary hidden sm:flex">View all <ArrowRight className="w-4 h-4" /></Button>
            </Link>
          </div>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {Array(4).fill(0).map((_, i) => <CarSkeleton key={i} />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {latestCars.map((car) => <CarCard key={car.id} car={car} />)}
            </div>
          )}
        </div>
      </section>

      {/* Why Us */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="text-center mb-12">
          <p className="text-sm font-semibold text-accent uppercase tracking-widest mb-1">Why AutoDrive</p>
          <h2 className="font-playfair text-3xl sm:text-4xl font-bold">A Dealership You Can Trust</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: Shield, title: 'Verified Listings', desc: 'Every vehicle is inspected and verified before listing. Full history reports available.' },
            { icon: Award, title: 'Best Price Guarantee', desc: 'Competitive pricing with transparent costs. No hidden fees or surprise charges.' },
            { icon: Phone, title: '24/7 Support', desc: 'Our team is available around the clock to help you find and finance your perfect vehicle.' }
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="text-center p-8 rounded-2xl border border-border bg-card hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="font-playfair text-3xl sm:text-4xl font-bold mb-4">Ready to Find Your Next Car?</h2>
          <p className="text-primary-foreground/80 mb-8 text-lg max-w-xl mx-auto">Browse our full inventory of hundreds of vehicles across all makes and models.</p>
          <Link to="/inventory">
            <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2 h-12 px-8 font-semibold shadow-lg">
              Explore Inventory <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}

function CarSkeleton() {
  return (
    <div className="bg-card rounded-2xl overflow-hidden border border-border/60 animate-pulse">
      <div className="aspect-[16/10] bg-muted" />
      <div className="p-4 space-y-2">
        <div className="h-4 bg-muted rounded w-3/4" />
        <div className="h-3 bg-muted rounded w-1/2" />
        <div className="h-3 bg-muted rounded w-full mt-3" />
      </div>
    </div>
  );
}
