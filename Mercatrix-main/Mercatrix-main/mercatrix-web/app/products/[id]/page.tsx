'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useProduct, useProductVariants } from '@/lib/api/products';
import { useCartStore } from '@/lib/store/cartStore';
import { motion } from 'framer-motion';
import { Star, ShieldCheck, Truck, ArrowLeft, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { toast } from 'sonner';

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params.id as string;

  const { data: product, isLoading: productLoading } = useProduct(productId);
  const { data: variants, isLoading: variantsLoading } = useProductVariants(productId);
  const addItem = useCartStore(state => state.addItem);

  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);

  if (productLoading || variantsLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-spin w-8 h-8 border-4 border-zinc-900 border-t-transparent rounded-full dark:border-white dark:border-t-transparent"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex justify-center items-center text-zinc-500">
        Product not found.
      </div>
    );
  }

  const activeVariant = variants?.find(v => v.id === selectedVariant) || variants?.[0];

  const handleAddToCart = () => {
    if (!activeVariant) return;
    
    addItem({
      id: activeVariant.id,
      variantId: activeVariant.id,
      productId: product.id,
      title: product.title,
      price: activeVariant.price,
      quantity: 1,
      imageUrl: product.imageUrl,
      vendorId: product.vendorId,
      attributes: activeVariant.attributes,
    });

    toast.success('Added to cart');
  };

  return (
    <div className="min-h-screen pt-24 pb-24 bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <Link href="/products" className="inline-flex items-center text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-white mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to products
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16">
          
          {/* Image Section */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="rounded-3xl overflow-hidden bg-zinc-100 dark:bg-zinc-900 aspect-square"
          >
            <img 
              src={product.imageUrl} 
              alt={product.title} 
              className="w-full h-full object-cover"
            />
          </motion.div>

          {/* Details Section */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col"
          >
            <div className="mb-6">
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-zinc-900 dark:text-white mb-2">
                {product.title}
              </h1>
              <p className="text-zinc-500 dark:text-zinc-400 font-medium mb-4">
                by {product.vendorName}
              </p>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center text-yellow-500">
                  <Star className="w-5 h-5 fill-current" />
                  <span className="ml-1.5 font-semibold text-zinc-900 dark:text-white">{product.averageRating}</span>
                </div>
                <span className="text-sm text-zinc-500">(128 reviews)</span>
              </div>
            </div>

            <div className="mb-8">
              <span className="text-4xl font-bold text-zinc-900 dark:text-white">
                ₹{(activeVariant?.price || product.basePrice).toLocaleString('en-IN')}
              </span>
            </div>

            <div className="mb-8 prose prose-zinc dark:prose-invert">
              <p>{product.description}</p>
            </div>

            {/* Variants */}
            {variants && variants.length > 1 && (
              <div className="mb-8">
                <h3 className="text-sm font-medium text-zinc-900 dark:text-white mb-3">Select Option</h3>
                <div className="flex flex-wrap gap-3">
                  {variants.map(variant => (
                    <button
                      key={variant.id}
                      onClick={() => setSelectedVariant(variant.id)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${
                        (selectedVariant || variants[0].id) === variant.id 
                          ? 'border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-zinc-900' 
                          : 'border-zinc-200 text-zinc-600 hover:border-zinc-300 dark:border-zinc-800 dark:text-zinc-400 dark:hover:border-zinc-700'
                      }`}
                    >
                      {Object.values(variant.attributes).join(' / ')}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-auto pt-8 border-t border-zinc-100 dark:border-zinc-800/50">
              <div className="flex gap-4">
                <Button 
                  size="lg" 
                  className="flex-1 rounded-full h-14 bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-zinc-100 dark:text-zinc-900 text-base"
                  onClick={handleAddToCart}
                >
                  <ShoppingBag className="w-5 h-5 mr-2" />
                  Add to Cart
                </Button>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 text-zinc-600 dark:text-zinc-400">
                  <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center shrink-0">
                    <Truck className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-medium">Free shipping over ₹50,000</span>
                </div>
                <div className="flex items-center gap-3 text-zinc-600 dark:text-zinc-400">
                  <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-medium">Secure split payment via Razorpay</span>
                </div>
              </div>
            </div>

          </motion.div>
        </div>
      </div>
    </div>
  );
}
