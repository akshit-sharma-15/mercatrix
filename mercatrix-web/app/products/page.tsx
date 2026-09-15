'use client';

import { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useProducts } from '@/lib/api/products';
import { ShoppingCart, Star, Search, Filter, SlidersHorizontal, ImageOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";

function ImageWithFallback({ src, alt, className }: { src: string, alt: string, className?: string }) {
  const [error, setError] = useState(false);
  
  if (error || !src) {
    return (
      <div className={`flex flex-col items-center justify-center bg-zinc-200 dark:bg-zinc-800 text-zinc-400 ${className}`}>
        <ImageOff className="w-8 h-8 mb-2 opacity-50" />
        <span className="text-[10px] font-medium uppercase tracking-wider">No Image</span>
      </div>
    );
  }
  return <img src={src} alt={alt} className={className} onError={() => setError(true)} />;
}

function ProductsContent() {
  const { data: products, isLoading } = useProducts();
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('q') || '';
  
  // Applied filters state
  const [appliedFilters, setAppliedFilters] = useState({
    category: 'All',
    minPrice: '',
    maxPrice: '',
    sortBy: 'featured'
  });

  // Draft filters state (for the drawer)
  const [draftFilters, setDraftFilters] = useState(appliedFilters);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Sync draft filters when drawer opens
  useEffect(() => {
    if (isSheetOpen) {
      setDraftFilters(appliedFilters);
    }
  }, [isSheetOpen, appliedFilters]);

  const categories = useMemo(() => {
    if (!products) return ['All'];
    const uniqueCategories = new Set(products.map(p => p.categoryName));
    return ['All', ...Array.from(uniqueCategories)];
  }, [products]);

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex justify-center items-center">
        <div className="animate-spin w-8 h-8 border-4 border-zinc-900 border-t-transparent rounded-full dark:border-white dark:border-t-transparent"></div>
      </div>
    );
  }

  const filteredProducts = products?.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = appliedFilters.category === 'All' || p.categoryName === appliedFilters.category;
    
    // Price filter
    const price = p.basePrice;
    const min = appliedFilters.minPrice ? parseFloat(appliedFilters.minPrice) : 0;
    const max = appliedFilters.maxPrice ? parseFloat(appliedFilters.maxPrice) : Infinity;
    const matchesPrice = price >= min && price <= max;

    return matchesSearch && matchesCategory && matchesPrice;
  }).sort((a, b) => {
    if (appliedFilters.sortBy === 'price-asc') return a.basePrice - b.basePrice;
    if (appliedFilters.sortBy === 'price-desc') return b.basePrice - a.basePrice;
    if (appliedFilters.sortBy === 'rating') return b.averageRating - a.averageRating;
    return 0; // featured/default
  });

  const applyFilters = () => {
    setAppliedFilters(draftFilters);
    setIsSheetOpen(false);
  };

  const clearFilters = () => {
    const cleared = {
      category: 'All',
      minPrice: '',
      maxPrice: '',
      sortBy: 'featured'
    };
    setDraftFilters(cleared);
    setAppliedFilters(cleared);
  };

  return (
    <div className="min-h-screen pt-24 pb-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-white mb-2">
              Explore Market
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400">
              {searchQuery ? `Showing results for "${searchQuery}"` : "Discover premium products from independent creators."}
            </p>
          </div>

          <div className="flex gap-3 w-full md:w-auto justify-end">
            {/* Filter Sheet */}
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger render={<Button variant="outline" className="rounded-full gap-2 px-4 border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900" />}>
                <SlidersHorizontal className="w-4 h-4" />
                <span className="hidden sm:inline">Filters</span>
              </SheetTrigger>
              <SheetContent side="right" className="w-[100vw] sm:w-[400px] flex flex-col bg-background p-0">
                <div className="overflow-y-auto flex-1 p-6">
                  <SheetHeader className="mb-6">
                    <SheetTitle>Filter Products</SheetTitle>
                    <SheetDescription>
                      Narrow down your search by category, price, and more.
                    </SheetDescription>
                  </SheetHeader>

                  <div className="space-y-8">
                    {/* Category Filter */}
                    <div>
                      <h3 className="text-sm font-medium mb-3 text-zinc-900 dark:text-white">Category</h3>
                      <div className="flex flex-wrap gap-2">
                        {categories.map((category) => (
                          <button
                            key={category}
                            onClick={() => setDraftFilters({...draftFilters, category})}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                              draftFilters.category === category 
                                ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-sm' 
                                : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700'
                            }`}
                          >
                            {category}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Price Filter */}
                    <div>
                      <h3 className="text-sm font-medium mb-3 text-zinc-900 dark:text-white">Price Range (₹)</h3>
                      <div className="flex items-center gap-3">
                        <Input 
                          type="number" 
                          placeholder="Min" 
                          value={draftFilters.minPrice}
                          onChange={(e) => setDraftFilters({...draftFilters, minPrice: e.target.value})}
                          className="bg-zinc-100/50 dark:bg-zinc-800/50 border-transparent focus:border-zinc-300 dark:focus:border-zinc-700 transition-colors"
                        />
                        <span className="text-zinc-400">-</span>
                        <Input 
                          type="number" 
                          placeholder="Max" 
                          value={draftFilters.maxPrice}
                          onChange={(e) => setDraftFilters({...draftFilters, maxPrice: e.target.value})}
                          className="bg-zinc-100/50 dark:bg-zinc-800/50 border-transparent focus:border-zinc-300 dark:focus:border-zinc-700 transition-colors"
                        />
                      </div>
                    </div>

                    {/* Sort By */}
                    <div>
                      <h3 className="text-sm font-medium mb-3 text-zinc-900 dark:text-white">Sort By</h3>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { id: 'featured', label: 'Featured' },
                          { id: 'price-asc', label: 'Price: Low to High' },
                          { id: 'price-desc', label: 'Price: High to Low' },
                          { id: 'rating', label: 'Top Rated' },
                        ].map((option) => (
                          <button
                            key={option.id}
                            onClick={() => setDraftFilters({...draftFilters, sortBy: option.id})}
                            className={`px-3 py-2 rounded-xl text-sm font-medium transition-all text-left ${
                              draftFilters.sortBy === option.id 
                                ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-sm' 
                                : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700'
                            }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="p-6 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 flex flex-col gap-3">
                  <Button 
                    className="w-full rounded-full shadow-md" 
                    onClick={applyFilters}
                  >
                    Apply Filters
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full text-zinc-500 rounded-full"
                    onClick={clearFilters}
                  >
                    Clear All Filters
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts?.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="h-full"
            >
              <Link href={`/products/${product.id}`} className="group block h-full flex flex-col">
                <div className="relative rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-900 aspect-[4/5] mb-4 shrink-0">
                  <ImageWithFallback 
                    src={product.imageUrl} 
                    alt={product.title} 
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
                  
                  {/* Floating View Details Button on Hover */}
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                    <Button size="sm" className="rounded-full bg-white text-black hover:bg-zinc-100 shadow-lg px-6">
                      View Details
                    </Button>
                  </div>
                </div>

                <div className="flex flex-col flex-grow">
                  <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                    {product.categoryName}
                  </span>
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-medium text-zinc-900 dark:text-white line-clamp-2 pr-4 leading-snug">
                      {product.title}
                    </h3>
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-500 mb-2 truncate mt-auto pt-1">
                    by {product.vendorName}
                  </p>
                  <div className="flex items-center justify-between mt-1">
                    <p className="font-bold text-lg text-zinc-900 dark:text-white">
                      ₹{(product.basePrice).toLocaleString('en-IN')}
                    </p>
                    <div className="flex items-center gap-1 shrink-0 text-zinc-900 dark:text-white">
                      <Star className="w-4 h-4 fill-current text-yellow-400" />
                      <span className="text-sm font-bold">{product.averageRating}</span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {filteredProducts?.length === 0 && (
          <div className="text-center py-24 text-zinc-500 dark:text-zinc-400">
            No products found matching your filters.
            <div className="mt-4">
              <Button 
                variant="outline"
                onClick={clearFilters}
              >
                Clear Filters
              </Button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen pt-24 pb-12 px-4 flex justify-center items-center">
        <div className="animate-spin w-8 h-8 border-4 border-zinc-900 border-t-transparent rounded-full dark:border-white dark:border-t-transparent"></div>
      </div>
    }>
      <ProductsContent />
    </Suspense>
  );
}
