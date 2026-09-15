'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Package, Sparkles, Layers, Tag, Eye, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/axios';
import { Skeleton } from '@/components/ui/skeleton';

interface ProductVariant {
  id: string;
  sku: string;
  attributes: Record<string, any>;
  price: number;
  stock_quantity: number;
}

interface ProductImage {
  id: string;
  image_url: string;
  is_primary: boolean;
}

interface VendorProduct {
  id: string;
  title: string;
  description: string;
  base_price: number;
  average_rating: number;
  category?: {
    id: string;
    name: string;
    commission_rate: number;
  };
  images: ProductImage[];
  variants: ProductVariant[];
}

export default function VendorProducts() {
  const [searchQuery, setSearchQuery] = useState('');

  const { data: products = [], isLoading, error } = useQuery<VendorProduct[]>({
    queryKey: ['vendor-products'],
    queryFn: async () => {
      const res = await apiClient.get('/vendor/products');
      return res.data.products || [];
    },
  });

  const filteredProducts = products.filter((p) => {
    const q = searchQuery.toLowerCase();
    const titleMatch = p.title.toLowerCase().includes(q);
    const catMatch = p.category?.name?.toLowerCase().includes(q);
    return titleMatch || catMatch;
  });

  const totalStock = products.reduce((sum, p) => {
    const pStock = p.variants?.reduce((vSum, v) => vSum + (v.stock_quantity || 0), 0) || 0;
    return sum + pStock;
  }, 0);

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-xs font-semibold tracking-widest text-zinc-400 uppercase">Merchant Catalog</span>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-zinc-900 dark:text-white mt-1">
            Atelier Products
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Manage your exclusive listings, inventory stocks, and multi-attribute luxury variants.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input 
              type="text" 
              placeholder="Search your catalog..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-white transition-all w-full sm:w-64 text-xs text-zinc-900 dark:text-white"
            />
          </div>
          <Button className="rounded-full bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 text-xs px-5 shrink-0 gap-1.5">
            <Plus className="w-3.5 h-3.5" />
            Add Item
          </Button>
        </div>
      </div>

      {/* Summary KPI Pills */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-900 dark:text-white">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-zinc-400 font-medium uppercase tracking-wider">Active Catalog</span>
            <p className="text-xl font-bold text-zinc-900 dark:text-white mt-0.5">{products.length} Products</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-900 dark:text-white">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-zinc-400 font-medium uppercase tracking-wider">Total Units in Stock</span>
            <p className="text-xl font-bold text-zinc-900 dark:text-white mt-0.5">{totalStock} Units</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-900 dark:text-white">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-zinc-400 font-medium uppercase tracking-wider">Boutique Status</span>
            <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">Verified Merchant</p>
          </div>
        </div>
      </div>

      {/* Catalog Table */}
      <div className="rounded-2xl bg-white dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-zinc-200 dark:border-zinc-800/70 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-zinc-900 dark:text-white">Published Product Listings</h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Live items currently discoverable by customers on the storefront
            </p>
          </div>
          <span className="text-xs font-mono text-zinc-400">
            Showing {filteredProducts.length} of {products.length}
          </span>
        </div>

        {isLoading ? (
          <div className="p-8 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="w-14 h-14 rounded-xl" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="p-12 text-center text-red-500 text-sm flex flex-col items-center gap-2">
            <AlertCircle className="w-6 h-6" />
            <span>Failed to load your products catalog. Please ensure your vendor account is active.</span>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <Package className="w-12 h-12 text-zinc-300 dark:text-zinc-700 mx-auto" />
            <h3 className="text-base font-medium text-zinc-800 dark:text-zinc-200">No products found</h3>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto">
              {searchQuery ? 'No listings matched your search query.' : 'You have not added any products to your boutique catalog yet.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-[11px] text-zinc-400 bg-zinc-50 dark:bg-zinc-950/40 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5 font-medium">Product Listing</th>
                  <th className="px-6 py-3.5 font-medium">Category</th>
                  <th className="px-6 py-3.5 font-medium">Variants & Attributes</th>
                  <th className="px-6 py-3.5 font-medium">Inventory Stock</th>
                  <th className="px-6 py-3.5 font-medium text-right">Base Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/60">
                {filteredProducts.map((product, index) => {
                  const primaryImage = product.images?.[0]?.image_url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80';
                  const totalProductStock = product.variants?.reduce((sum, v) => sum + (v.stock_quantity || 0), 0) || 0;
                  
                  return (
                    <motion.tr 
                      key={product.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.04 }}
                      className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors"
                    >
                      <td className="px-6 py-4.5">
                        <div className="flex items-center gap-4">
                          <img 
                            src={primaryImage} 
                            alt={product.title} 
                            className="w-14 h-14 rounded-xl object-cover border border-zinc-200 dark:border-zinc-800 shrink-0 bg-zinc-100 dark:bg-zinc-900" 
                          />
                          <div>
                            <span className="font-semibold text-zinc-900 dark:text-white text-sm sm:text-base block">
                              {product.title}
                            </span>
                            <span className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-1 max-w-sm mt-0.5">
                              {product.description || 'Luxury boutique catalog listing'}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4.5 text-sm">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold text-xs border border-zinc-200 dark:border-zinc-700">
                          <Tag className="w-3.5 h-3.5 text-zinc-400" />
                          {product.category?.name || 'Curated Goods'}
                        </span>
                      </td>

                      <td className="px-6 py-4.5">
                        <div className="space-y-1.5">
                          <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                            {product.variants?.length || 1} {product.variants?.length === 1 ? 'Variant' : 'Variants'}
                          </span>
                          <div className="flex flex-wrap gap-1.5 max-w-xs">
                            {product.variants?.slice(0, 3).map((v) => {
                              const attrs = v.attributes ? Object.entries(v.attributes).map(([k, val]) => `${val}`).join(' / ') : v.sku;
                              return (
                                <span key={v.id} className="text-xs px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-mono font-medium">
                                  {attrs}
                                </span>
                              );
                            })}
                            {(product.variants?.length || 0) > 3 && (
                              <span className="text-xs text-zinc-400 self-center">+{product.variants.length - 3} more</span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4.5">
                        <div className="flex items-center gap-2">
                          <span className={`w-2.5 h-2.5 rounded-full ${
                            totalProductStock > 10 
                              ? 'bg-emerald-500' 
                              : totalProductStock > 0 
                              ? 'bg-amber-500' 
                              : 'bg-red-500'
                          }`} />
                          <span className="font-semibold text-zinc-900 dark:text-white text-sm">
                            {totalProductStock} in stock
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4.5 text-right font-bold text-zinc-900 dark:text-white text-sm sm:text-base">
                        ₹{Number(product.base_price).toLocaleString('en-IN')}
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

