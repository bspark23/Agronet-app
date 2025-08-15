"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { useProducts } from '@/hooks/use-products-api';
import { useMessages } from '@/hooks/use-messages-api';
import { usersApi, wishlistApi } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';
import type { Product, User } from '@/lib/types';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Verified, Heart, MessageSquare, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function ProductPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { getProduct, loading, error } = useProducts();
  const { createOrGetThread } = useMessages();
  const { toast } = useToast();

  const [product, setProduct] = useState<Product | null>(null);
  const [seller, setSeller] = useState<User | null>(null);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const loadProductData = async () => {
      if (!id) return;

      try {
        // Get product details from API
        const productData = await getProduct(id as string);
        if (!productData) {
          console.error('Product not found');
          return;
        }
        setProduct(productData);

        // Get seller details from API
        if (productData.farmerId) {
          const sellerData = await usersApi.getUser(productData.farmerId);
          setSeller(sellerData);
        }

        // Check if product is in wishlist
        if (user) {
          try {
            const wishlistCheck = await wishlistApi.checkWishlist(id as string);
            setIsInWishlist(wishlistCheck.isInWishlist);
          } catch (error) {
            console.error('Error checking wishlist:', error);
          }
        }
      } catch (error) {
        console.error('Error loading product data:', error);
      }
    };

    loadProductData();
  }, [id]);

  const handleToggleWishlist = async () => {
    if (!isAuthenticated || !user) {
      toast({
        title: 'Login Required',
        description: 'Please log in to add products to your wishlist.',
        variant: 'destructive',
      });
      router.push('/login');
      return;
    }

    try {
      if (isInWishlist) {
        const result = await wishlistApi.removeFromWishlist(id as string);
        if (result.success) {
          setIsInWishlist(false);
          toast({
            title: 'Removed from Wishlist',
            description: `${product?.name} has been removed from your wishlist.`,
          });
        }
      } else {
        const result = await wishlistApi.addToWishlist(id as string);
        if (result.success) {
          setIsInWishlist(true);
          toast({
            title: 'Added to Wishlist!',
            description: `${product?.name} has been added to your wishlist.`,
          });
        }
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      toast({
        title: 'Error',
        description: 'Failed to update wishlist. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleContactFarmer = async () => {
    if (!isAuthenticated || !user) {
      toast({
        title: 'Login Required',
        description: 'Please log in to contact farmers.',
        variant: 'destructive',
      });
      router.push('/login');
      return;
    }

    if (user._id === seller?._id) {
      toast({
        title: 'Cannot Contact Yourself',
        description: 'You cannot initiate a chat with your own product.',
        variant: 'destructive',
      });
      return;
    }

    if (!seller) {
      toast({
        title: 'Farmer Information Unavailable',
        description: 'Unable to contact the farmer at this time.',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Determine who is buyer and who is farmer based on current user role
      let buyerId, farmerId;

      if (user.role === 'buyer') {
        buyerId = user._id;
        farmerId = seller._id;
      } else if (user.role === 'farmer') {
        // If current user is a farmer contacting another farmer, treat current user as buyer
        buyerId = user._id;
        farmerId = seller._id;
      } else {
        // Default case: treat current user as buyer
        buyerId = user._id;
        farmerId = seller._id;
      }

      console.log('Creating thread with:', { buyerId, farmerId });

      // Create or get existing thread. The hook may return either the raw
      // thread object or an ApiResponse wrapper { success, data }.
      const threadResp = await createOrGetThread(buyerId, farmerId);

      console.log('Thread created/retrieved:', threadResp);

      // Resolve thread id for navigation (support both shapes)
      let threadId: string | undefined;
      if (threadResp) {
        // If it's an ApiResponse with data
        if (typeof threadResp === 'object' && 'success' in threadResp) {
          if (threadResp.success && threadResp.data) {
            threadId =
              (threadResp.data as any)._id || (threadResp.data as any).id;
          }
        }

        // If it's the raw thread object
        if (
          !threadId &&
          typeof threadResp === 'object' &&
          '_id' in threadResp
        ) {
          threadId = (threadResp as any)._id;
        }
      }

      if (!threadId) {
        console.error(
          'Failed to determine thread id from response:',
          threadResp,
        );
        toast({
          title: 'Failed to Start Chat',
          description: 'Could not determine chat id. Please try again.',
          variant: 'destructive',
        });
        return;
      }

      // Navigate to the specific chat page using the resolved thread ID
      router.push(`/chat/${threadId}`);

      toast({
        title: 'Chat Started',
        description: `You can now chat with ${seller.firstname} ${seller.lastname}`,
      });
    } catch (error) {
      console.error('Error starting chat:', error);
      toast({
        title: 'Failed to Start Chat',
        description: 'Unable to start conversation. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <Loader2 className='h-8 w-8 animate-spin text-agronetGreen' />
      </div>
    );
  }

  if (!product || !seller) {
    return null; // Handled by redirect in useEffect
  }

  return (
    <div className='flex flex-col min-h-screen'>
      <Navbar />
      <main className='flex-1 container mx-auto px-4 py-8 md:px-6'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className='grid md:grid-cols-2 gap-8'>
          <div className='relative w-full h-80 md:h-[500px] rounded-lg overflow-hidden shadow-lg'>
            <Image
              src={
                product.images?.[0] ||
                '/placeholder.svg?height=800&width=1200&query=product image large'
              }
              alt={product.name}
              fill
              style={{ objectFit: 'cover' }}
              className='transition-transform duration-300 hover:scale-105'
            />
          </div>
          <div className='space-y-6'>
            <h1 className='text-4xl font-bold text-agronetGreen'>
              {product.name}
            </h1>
            <div className='flex items-center gap-2 text-lg text-gray-700'>
              <span>
                Sold by: {seller.firstname} {seller.lastname}
              </span>
              {seller.role === 'farmer' && (
                <Verified className='h-5 w-5 text-agronetGreen' />
              )}
            </div>
            <p className='text-5xl font-extrabold text-agronetOrange'>
              #{product.price.toFixed(2)}
            </p>
            <p className='text-gray-800 leading-relaxed'>
              {product.description}
            </p>
            <p className='text-gray-600'>
              <span className='font-semibold'>Type:</span> General
            </p>
            <p className='text-gray-600'>
              <span className='font-semibold'>Available Quantity:</span>{' '}
              {product.quantity}
            </p>
            <div className='flex gap-4'>
              <Button
                className='bg-agronetGreen hover:bg-agronetGreen/90 text-white text-lg px-6 py-3 rounded-full shadow-md'
                onClick={handleContactFarmer}>
                <MessageSquare className='h-5 w-5 mr-2' /> Contact Farmer
              </Button>
              <Button
                variant='outline'
                className='text-agronetOrange border-agronetOrange hover:bg-agronetOrange/10 text-lg px-6 py-3 rounded-full shadow-md'
                onClick={handleToggleWishlist}>
                <Heart
                  className={`h-5 w-5 mr-2 ${
                    isInWishlist ? 'fill-agronetOrange' : ''
                  }`}
                />
                {isInWishlist ? 'Wishlisted' : 'Add to Wishlist'}
              </Button>
            </div>
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}
