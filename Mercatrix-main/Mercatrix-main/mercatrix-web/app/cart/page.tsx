'use client';

import { useState, useEffect } from 'react';
import { useCartStore } from '@/lib/store/cartStore';
import { fetchCheckoutSummary } from '@/lib/api/orders';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function CartPage() {
  const { items, updateQuantity, removeItem, getTotalPrice } = useCartStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { 
    setMounted(true); 
  }, []);

  // Fetch summary to dynamically resolve product variant attributes (Color, Size) even for existing cart items
  const { data: summaryData } = useQuery({
    queryKey: ['cart-checkout-summary', items],
    queryFn: () => fetchCheckoutSummary(items.map(i => ({ variantId: i.variantId, quantity: i.quantity, price: i.price }))),
    enabled: mounted && items.length > 0,
  });

  // Permanently enrich items in localStorage if attributes were missing
  useEffect(() => {
    if (summaryData?.items) {
      summaryData.items.forEach(si => {
        const currentItem = items.find(i => i.variantId === si.variantId);
        if (currentItem && !currentItem.attributes && si.attributes) {
          useCartStore.setState((state) => ({
            items: state.items.map(i => 
              i.variantId === si.variantId ? { ...i, attributes: si.attributes } : i
            )
          }));
        }
      });
    }
  }, [summaryData, items]);

  const attributesMap = new Map<string, Record<string, any>>();
  summaryData?.items?.forEach(si => {
    if (si.attributes) {
      attributesMap.set(si.variantId, si.attributes as Record<string, any>);
    }
  });

  const totalPrice = mounted ? getTotalPrice() : 0;
  const shipping = totalPrice >= 1000 ? 0 : 50;
  const finalTotal = mounted && items.length > 0 ? totalPrice + shipping : 0;

  if (!mounted) {
    return <div className="min-h-screen pt-24 pb-24 bg-background" />;
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen pt-24 pb-24 bg-background flex flex-col items-center justify-center">
        <div className="w-24 h-24 bg-zinc-100 dark:bg-zinc-900 rounded-full flex items-center justify-center mb-6">
          <ShoppingBag className="w-10 h-10 text-zinc-400" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white mb-2">Your cart is empty</h2>
        <p className="text-zinc-500 dark:text-zinc-400 mb-8 max-w-sm text-center">
          Looks like you haven't added anything to your cart yet. Discover premium products from our vendors.
        </p>
        <Button asChild size="lg" className="rounded-full px-8 bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100">
          <Link href="/products">
            Start Shopping
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-24 bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-zinc-900 dark:text-white mb-10">
          Your Cart
        </h1>

        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* Cart Items List */}
          <div className="flex-1">
            <div className="space-y-6">
              {items.map((item, index) => {
                const itemAttrs = item.attributes || attributesMap.get(item.variantId);
                return (
                  <motion.div 
                    key={item.variantId}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex gap-6 p-5 rounded-3xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200/50 dark:border-zinc-800/50"
                  >
                    <div className="w-28 h-28 shrink-0 rounded-2xl overflow-hidden bg-white dark:bg-zinc-800">
                      <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                    </div>
                    
                    <div className="flex-1 flex flex-col py-1">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold text-lg text-zinc-900 dark:text-white line-clamp-1">
                            {item.title}
                          </h3>
                          
                          {/* Color & Size / Variant Attributes Badges */}
                          {itemAttrs && Object.keys(itemAttrs).length > 0 && (
                            <div className="flex flex-wrap items-center gap-2 mt-2">
                              {Object.entries(itemAttrs).map(([attrKey, attrVal]) => (
                                <span 
                                  key={attrKey} 
                                  className="inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200/80 dark:border-zinc-700/80"
                                >
                                  <span className="capitalize text-zinc-500 dark:text-zinc-400 mr-1.5">{attrKey}:</span>
                                  <span className="font-semibold text-zinc-900 dark:text-white">{String(attrVal)}</span>
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <button 
                          onClick={() => removeItem(item.variantId)}
                          className="text-zinc-400 hover:text-red-500 transition-colors p-1"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                      
                      <div className="font-semibold text-zinc-900 dark:text-white mb-auto mt-1">
                        ₹{item.price.toLocaleString('en-IN')}
                      </div>

                      <div className="flex items-center gap-3 mt-3">
                        <div className="flex items-center rounded-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-2 py-1">
                          <button 
                            onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 transition-colors"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-8 text-center text-sm font-medium text-zinc-900 dark:text-white">
                            {item.quantity}
                          </span>
                          <button 
                            onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Order Summary */}
          <div className="w-full lg:w-[400px]">
            <div className="sticky top-24 rounded-3xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200/50 dark:border-zinc-800/50 p-8">
              <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white mb-6">
                Order Summary
              </h2>
              
              <div className="space-y-4 text-sm mb-6">
                <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                  <span>Subtotal</span>
                  <span className="font-medium text-zinc-900 dark:text-white">₹{totalPrice.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                  <span>Platform Shipping Fee</span>
                  {shipping === 0 ? (
                    <span className="font-medium text-emerald-600 dark:text-emerald-400">FREE</span>
                  ) : (
                    <span className="font-medium text-zinc-900 dark:text-white">₹{shipping}</span>
                  )}
                </div>
              </div>
              
              <div className="border-t border-zinc-200 dark:border-zinc-800 pt-6 mb-8">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-zinc-900 dark:text-white">Total</span>
                  <span className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
                    ₹{finalTotal.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <Button asChild size="lg" className="w-full rounded-full h-14 bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 group">
                <Link href="/checkout">
                  Proceed to Checkout
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
