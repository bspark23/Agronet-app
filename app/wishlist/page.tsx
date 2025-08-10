"use client"

import Link from "next/link"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { useProducts } from '@/hooks/use-products-api';
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { getWishlist, setWishlist } from '@/lib/local-storage-utils';
import type { Product } from '@/lib/types';
import { ProductCard } from "@/components/product-card"
import { Button } from "@/components/ui/button"
import { Heart, Loader2, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { motion } from "framer-motion"

export default function WishlistPage() {
  const { user, isAuthenticated, isBuyer, isLoading: authLoading } = useAuth();
  const { products: allProducts, loading: productsLoading } = useProducts();
  const router = useRouter();
  const { toast } = useToast();

  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Only run auth check after auth has finished loading
    if (authLoading || productsLoading) return;

    if (!isAuthenticated || !isBuyer) {
      router.push('/login'); // Redirect if not authenticated or not a buyer
      toast({
        title: 'Access Denied',
        description: 'Please log in as a buyer to view your wishlist.',
        variant: 'destructive',
      });
      return;
    }

    // User is authenticated, load wishlist
    loadWishlist();
    setLoading(false);
  }, [
    isAuthenticated,
    isBuyer,
    user,
    authLoading,
    productsLoading,
    allProducts,
    router,
    toast,
  ]);

  const loadWishlist = () => {
    if (!user?._id) return;

    const userWishlist = getWishlist().filter(item => item.userId === user._id);
    const productsInWishlist = userWishlist
      .map(item => allProducts.find(p => p._id === item.productId))
      .filter(Boolean) as Product[];
    setWishlistProducts(productsInWishlist)
  }

  const handleRemoveFromWishlist = (productId: string) => {
    if (!user?._id) return;

    let wishlist = getWishlist()
    wishlist = wishlist.filter(
      item => !(item.userId === user._id && item.productId === productId),
    );
    setWishlist(wishlist)
    loadWishlist() // Reload wishlist after removal

    toast({
      title: "Removed from Wishlist",
      description: "Product has been removed from your wishlist.",
      variant: "default",
    })
  }

  if (authLoading || productsLoading || loading) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <Loader2 className='h-8 w-8 animate-spin text-agronetGreen' />
      </div>
    );
  }

  if (!isAuthenticated || !isBuyer) {
    return null // Should be redirected by useEffect
  }

  return (
    <div className='flex flex-col min-h-screen'>
      <Navbar />
      <main className='flex-1 container mx-auto px-4 py-8 md:px-6'>
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className='text-3xl font-bold text-agronetGreen mb-6 text-center'>
          Your Wishlist
        </motion.h1>

        {wishlistProducts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className='text-center text-gray-600 text-lg mt-10'>
            <Heart className='h-12 w-12 mx-auto mb-4 text-gray-400' />
            <p>Your wishlist is empty.</p>
            <p>Browse our products and add your favorites!</p>
            <Button
              asChild
              className='mt-6 bg-agronetOrange hover:bg-agronetOrange/90 text-white'>
              <Link href='/products'>Browse Products</Link>
            </Button>
          </motion.div>
        ) : (
          <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
            {wishlistProducts.map((product, index) => (
              <motion.div
                key={product._id}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                className='relative'>
                <ProductCard product={product} />
                <Button
                  variant='destructive'
                  size='icon'
                  className='absolute top-2 right-2 rounded-full h-8 w-8'
                  onClick={() => handleRemoveFromWishlist(product._id)}>
                  <Trash2 className='h-4 w-4' />
                  <span className='sr-only'>Remove from wishlist</span>
                </Button>
              </motion.div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
