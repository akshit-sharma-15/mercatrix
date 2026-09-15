'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  ArrowRight, 
  ShieldCheck, 
  Zap, 
  Sparkles, 
  ShoppingBag, 
  Star, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  Package, 
  Layers, 
  Store,
  ChevronRight,
  Shield,
  Truck,
  CreditCard
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/axios';
import { useCartStore } from '@/lib/store/cartStore';
import { toast } from 'sonner';

interface ProductItem {
  id: string;
  title: string;
  description: string;
  basePrice: number;
  averageRating: number;
  imageUrl: string;
  vendorName: string;
  categoryName: string;
}

const FEATURED_FALLBACKS: ProductItem[] = [
  {
    id: 'prod-1',
    title: 'Aura Minimalist Mechanical Watch',
    description: 'Precision Japanese movement encased in sapphire crystal and brushed 316L stainless steel.',
    basePrice: 18500,
    averageRating: 4.9,
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
    vendorName: 'Atelier Horlogerie',
    categoryName: 'Watches & Accessories'
  },
  {
    id: 'prod-2',
    title: 'Studio Titanium Wireless ANC Headphones',
    description: 'Bespoke 40mm beryllium drivers delivering ultra-linear frequency response with active noise cancelling.',
    basePrice: 24900,
    averageRating: 4.8,
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
    vendorName: 'Acoustics Lab',
    categoryName: 'Tech & Audio'
  },
  {
    id: 'prod-3',
    title: 'Heritage Full-Grain Leather Weekender',
    description: 'Vegetable-tanned Tuscan leather with hand-burnished edges and solid brass hardware.',
    basePrice: 14200,
    averageRating: 5.0,
    imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80',
    vendorName: 'Tuscan Leatherworks',
    categoryName: 'Leather & Luggage'
  },
  {
    id: 'prod-4',
    title: 'Monolith Ceramic Table Lamp',
    description: 'Sculptural stoneware body with textured matte glaze and warm diffused ambient LED illumination.',
    basePrice: 8900,
    averageRating: 4.7,
    imageUrl: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80',
    vendorName: 'Studio Forma',
    categoryName: 'Home & Living'
  }
];

const CATEGORIES = [
  { name: 'All Collections', query: '' },
  { name: 'Horology', query: 'Watches' },
  { name: 'Tech & Audio', query: 'Tech' },
  { name: 'Leather Goods', query: 'Leather' },
  { name: 'Art & Living', query: 'Home' }
];

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState('All Collections');
  const addItem = useCartStore((state) => state.addItem);

  // Fetch live products from backend
  const { data: liveProducts = [] } = useQuery({
    queryKey: ['landing-products'],
    queryFn: async () => {
      try {
        const { data } = await apiClient.get('/customer/products');
        return data && data.length > 0 ? data : FEATURED_FALLBACKS;
      } catch (err) {
        return FEATURED_FALLBACKS;
      }
    },
    staleTime: 5 * 60 * 1000,
  });

  const displayProducts: ProductItem[] = liveProducts.length > 0 ? liveProducts.slice(0, 4) : FEATURED_FALLBACKS;

  const handleQuickAdd = (product: ProductItem) => {
    addItem({
      id: `${product.id}-v1`,
      productId: product.id,
      variantId: `${product.id}-v1`,
      title: product.title,
      price: product.basePrice,
      quantity: 1,
      imageUrl: product.imageUrl,
      vendorId: 'vendor-1',
      vendorName: product.vendorName,
    });
    toast.success(`Added "${product.title}" to cart`);
  };

  return (
    <div className="relative min-h-screen bg-background overflow-x-hidden text-foreground">
      
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] pointer-events-none -z-10 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-gradient-to-b from-zinc-200/50 to-transparent dark:from-zinc-800/20 dark:to-transparent rounded-full blur-3xl opacity-60" />
      </div>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
        
        {/* Floating Release Badge */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-semibold mb-8 shadow-sm"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Curated Global Marketplace</span>
          <span className="text-zinc-300 dark:text-zinc-700">•</span>
          <span className="text-zinc-500 dark:text-zinc-400 font-normal">Direct from Verified Creators</span>
        </motion.div>

        {/* Grand Headline */}
        <motion.h1 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-serif font-bold tracking-tight text-zinc-900 dark:text-white max-w-5xl leading-[1.08] mb-8"
        >
          Curated commerce, <br />
          <span className="italic font-light text-zinc-500 dark:text-zinc-400">
            engineered for scale.
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-base sm:text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto mb-12 leading-relaxed"
        >
          A unified shopping destination connecting discerning buyers with independent ateliers, boutique designers, and certified high-standard merchants.
        </motion.p>

        {/* Dual Actions */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
        >
          <Button 
            asChild 
            size="lg" 
            className="w-full sm:w-auto h-14 px-8 rounded-full bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-zinc-100 dark:text-zinc-900 font-semibold shadow-lg hover:shadow-xl transition-all gap-2"
          >
            <Link href="/products">
              Explore Collection <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
          <Button 
            asChild 
            variant="outline" 
            size="lg" 
            className="w-full sm:w-auto h-14 px-8 rounded-full border-zinc-300 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 font-semibold transition-all gap-2"
          >
            <Link href="/signup?tab=vendor">
              <Store className="w-4 h-4" /> Become a Seller
            </Link>
          </Button>
        </motion.div>

        {/* Great Images Editorial Showcase */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.35, ease: "easeOut" }}
          className="w-full max-w-6xl mt-16 sm:mt-24 grid grid-cols-1 md:grid-cols-3 gap-6 text-left"
        >
          {/* Card 1: Horology */}
          <Link href="/products" className="group relative h-96 sm:h-[420px] rounded-3xl overflow-hidden bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-md hover:shadow-2xl transition-all duration-500">
            <img 
              src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1000&q=85" 
              alt="Haute Horology Collection"
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 brightness-95 group-hover:brightness-100"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
            <div className="absolute bottom-6 left-6 right-6 text-white">
              <span className="inline-block text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md mb-2">
                Haute Horology
              </span>
              <h3 className="font-serif text-xl sm:text-2xl font-bold leading-tight">
                Mechanical Precision
              </h3>
              <p className="text-xs text-zinc-300 mt-1 line-clamp-1 opacity-90">
                Sapphire crystal and brushed steel movements.
              </p>
            </div>
          </Link>

          {/* Card 2: Acoustics */}
          <Link href="/products" className="group relative h-96 sm:h-[420px] rounded-3xl overflow-hidden bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-md hover:shadow-2xl transition-all duration-500 md:-translate-y-4">
            <img 
              src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=85" 
              alt="Acoustic Studio Engineering"
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 brightness-95 group-hover:brightness-100"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
            <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-white/90 text-zinc-900 text-[10px] font-bold uppercase tracking-wider shadow-lg">
              Featured Edition
            </div>
            <div className="absolute bottom-6 left-6 right-6 text-white">
              <span className="inline-block text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md mb-2">
                Acoustic Studio
              </span>
              <h3 className="font-serif text-xl sm:text-2xl font-bold leading-tight">
                Titanium Soundscapes
              </h3>
              <p className="text-xs text-zinc-300 mt-1 line-clamp-1 opacity-90">
                Bespoke 40mm beryllium linear transducers.
              </p>
            </div>
          </Link>

          {/* Card 3: Leather Craft */}
          <Link href="/products" className="group relative h-96 sm:h-[420px] rounded-3xl overflow-hidden bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-md hover:shadow-2xl transition-all duration-500">
            <img 
              src="https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1000&q=85" 
              alt="Tuscan Leather Craft"
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 brightness-95 group-hover:brightness-100"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
            <div className="absolute bottom-6 left-6 right-6 text-white">
              <span className="inline-block text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md mb-2">
                Artisanal Living
              </span>
              <h3 className="font-serif text-xl sm:text-2xl font-bold leading-tight">
                Heritage Tuscan Leather
              </h3>
              <p className="text-xs text-zinc-300 mt-1 line-clamp-1 opacity-90">
                Vegetable-tanned and hand-burnished luggage.
              </p>
            </div>
          </Link>
        </motion.div>

      </section>

      {/* Curated Products Live Showcase */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-zinc-200 dark:border-zinc-800">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-2">
              <Sparkles className="w-3.5 h-3.5" /> Curated Showcase
            </div>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight text-zinc-900 dark:text-white">
              Trending Editions
            </h2>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.name}
                onClick={() => setSelectedCategory(cat.name)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  selectedCategory === cat.name
                    ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900'
                    : 'bg-zinc-100 dark:bg-zinc-800/60 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayProducts.map((product) => (
            <div 
              key={product.id}
              className="group rounded-3xl bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col"
            >
              <div className="relative aspect-square overflow-hidden bg-zinc-100 dark:bg-zinc-800/40">
                <img 
                  src={product.imageUrl} 
                  alt={product.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-semibold tracking-wider uppercase text-white">
                  {product.categoryName}
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                    {product.vendorName}
                  </p>
                  <h3 className="font-serif font-semibold text-base text-zinc-900 dark:text-white line-clamp-1 mb-2">
                    {product.title}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-zinc-500 mb-4">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span className="font-medium text-zinc-800 dark:text-zinc-200">{product.averageRating}</span>
                    <span className="text-zinc-400">• Verified</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-zinc-400 uppercase font-semibold block">Price</span>
                    <span className="text-lg font-serif font-bold text-zinc-900 dark:text-white">
                      ₹{product.basePrice.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <Button 
                    size="sm"
                    onClick={() => handleQuickAdd(product)}
                    className="rounded-full bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-zinc-100 dark:text-zinc-900 text-xs px-4 h-9 gap-1.5"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    Add
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Button asChild variant="outline" size="lg" className="rounded-full px-8 border-zinc-300 dark:border-zinc-800">
            <Link href="/products">
              View All Masterpieces <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Bento Grid: The Mercatrix Standard */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-zinc-200 dark:border-zinc-800">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-5xl font-serif font-bold tracking-tight text-zinc-900 dark:text-white mb-4">
            The Mercatrix Standard
          </h2>
          <p className="text-base text-zinc-500 dark:text-zinc-400">
            Precision engineering powering transparent trade between independent vendors and modern collectors.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[320px]">
          
          {/* Card 1: Split Payments (Spans 2 cols) */}
          <div className="md:col-span-2 rounded-[32px] bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden group">
            <div className="relative z-10 max-w-lg">
              <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-6 shadow-sm">
                <CreditCard className="w-6 h-6 text-zinc-900 dark:text-white" />
              </div>
              <h3 className="text-2xl font-serif font-bold text-zinc-900 dark:text-white mb-3">
                Automated Split Settlement
              </h3>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed">
                When an order contains pieces from different ateliers, payments are automatically partitioned through our Razorpay Route escrow pipeline directly to respective merchant accounts with zero manual invoicing.
              </p>
            </div>
            
            <div className="flex items-center gap-3 text-xs font-semibold text-zinc-800 dark:text-zinc-200 pt-4">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Real-Time Razorpay Escrow Engine</span>
            </div>
          </div>

          {/* Card 2: Doorstep Tracking & Address Snapshot */}
          <div className="rounded-[32px] bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 p-8 flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-6 shadow-sm">
                <Truck className="w-6 h-6 text-zinc-900 dark:text-white" />
              </div>
              <h3 className="text-xl font-serif font-bold text-zinc-900 dark:text-white mb-2">
                Address Freezing
              </h3>
              <p className="text-zinc-500 dark:text-zinc-400 text-xs leading-relaxed">
                Every delivery address is permanently snapshotted at checkout, protecting courier dispatches against accidental updates or record shifts.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <Clock className="w-4 h-4 text-zinc-400" />
              <span>Immutable Snapshot Preservation</span>
            </div>
          </div>

          {/* Card 3: Multi-Tier Variants */}
          <div className="rounded-[32px] bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 p-8 flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-6 shadow-sm">
                <Layers className="w-6 h-6 text-zinc-900 dark:text-white" />
              </div>
              <h3 className="text-xl font-serif font-bold text-zinc-900 dark:text-white mb-2">
                Dynamic Variants
              </h3>
              <p className="text-zinc-500 dark:text-zinc-400 text-xs leading-relaxed">
                Colorways, custom sizing, and real-time inventory locking prevent duplicate orders and ensure stock integrity across warehouses.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <Package className="w-4 h-4 text-zinc-400" />
              <span>Row-Level Stock Reservation</span>
            </div>
          </div>

          {/* Card 4: Creator Empowerment (Spans 2 cols) */}
          <div className="md:col-span-2 rounded-[32px] bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden group">
            <div className="relative z-10 max-w-lg">
              <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-6 shadow-sm">
                <Shield className="w-6 h-6 text-zinc-900 dark:text-white" />
              </div>
              <h3 className="text-2xl font-serif font-bold text-zinc-900 dark:text-white mb-3">
                Verified Artisan Onboarding
              </h3>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed">
                Every merchant undergoes credential scrutiny and GST verification before catalog listing. Admin oversight guarantees genuine craftsmanship and brand trust for every buyer.
              </p>
            </div>

            <div className="flex items-center gap-3 text-xs font-semibold text-zinc-800 dark:text-zinc-200 pt-4">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>100% Authenticity Guarantee</span>
            </div>
          </div>

        </div>
      </section>

      {/* Trust & Guarantee Banner */}
      <section className="py-16 bg-zinc-100/70 dark:bg-zinc-900/30 border-y border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
            <div className="flex items-center gap-4 justify-center md:justify-start">
              <div className="w-12 h-12 rounded-2xl bg-white dark:bg-zinc-800 flex items-center justify-center shadow-sm shrink-0">
                <ShieldCheck className="w-6 h-6 text-zinc-900 dark:text-white" />
              </div>
              <div>
                <h4 className="font-serif font-bold text-sm text-zinc-900 dark:text-white">Escrow-Protected Payments</h4>
                <p className="text-xs text-zinc-500">Funds released only upon verified delivery</p>
              </div>
            </div>

            <div className="flex items-center gap-4 justify-center md:justify-start">
              <div className="w-12 h-12 rounded-2xl bg-white dark:bg-zinc-800 flex items-center justify-center shadow-sm shrink-0">
                <Truck className="w-6 h-6 text-zinc-900 dark:text-white" />
              </div>
              <div>
                <h4 className="font-serif font-bold text-sm text-zinc-900 dark:text-white">Express Insured Transit</h4>
                <p className="text-xs text-zinc-500">Free delivery on orders over ₹1,000</p>
              </div>
            </div>

            <div className="flex items-center gap-4 justify-center md:justify-start">
              <div className="w-12 h-12 rounded-2xl bg-white dark:bg-zinc-800 flex items-center justify-center shadow-sm shrink-0">
                <Clock className="w-6 h-6 text-zinc-900 dark:text-white" />
              </div>
              <div>
                <h4 className="font-serif font-bold text-sm text-zinc-900 dark:text-white">7-Day Concierge Returns</h4>
                <p className="text-xs text-zinc-500">Hassle-free reverse courier pickup</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Grand CTA */}
      <section className="py-28 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-4xl sm:text-6xl font-serif font-bold tracking-tight text-zinc-900 dark:text-white mb-6">
          Ready to experience <br />
          <span className="italic font-light text-zinc-500">elevated trade?</span>
        </h2>
        <p className="text-base sm:text-lg text-zinc-500 dark:text-zinc-400 max-w-xl mx-auto mb-10">
          Join thousands of buyers acquiring exceptional pieces, or launch your atelier with instant access to high-intent patrons.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button asChild size="lg" className="w-full sm:w-auto h-14 px-10 rounded-full bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-zinc-100 dark:text-zinc-900 font-semibold shadow-xl">
            <Link href="/products">Shop Catalog</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="w-full sm:w-auto h-14 px-10 rounded-full border-zinc-300 dark:border-zinc-800 font-semibold">
            <Link href="/signup?tab=vendor">Register as Seller</Link>
          </Button>
        </div>
      </section>

      {/* Luxury Footer */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-8">
          <div>
            <span className="font-serif font-bold text-2xl tracking-tight text-zinc-900 dark:text-white">
              Mercatrix<span className="text-zinc-400">.</span>
            </span>
            <p className="text-xs text-zinc-400 mt-1">Curated marketplace for fine independent commerce.</p>
          </div>

          <div className="flex flex-wrap gap-8 text-xs font-semibold uppercase tracking-wider text-zinc-500">
            <Link href="/products" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Catalog</Link>
            <Link href="/signup?tab=vendor" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Vendors</Link>
            <Link href="/profile" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Account</Link>
            <Link href="/cart" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Cart</Link>
          </div>

          <p className="text-xs text-zinc-400">
            © {new Date().getFullYear()} Mercatrix Inc. All rights reserved.
          </p>
        </div>
      </footer>

    </div>
  );
}
