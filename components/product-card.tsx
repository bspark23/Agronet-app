'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { Product, User } from '@/lib/types';
import { Verified } from 'lucide-react';
import { useUsers } from '@/hooks/use-users-api';
import { motion } from 'framer-motion';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { getUserById } = useUsers();
  const seller: User | undefined = getUserById(product.farmerId);
  const isVerified = seller?.farmerApplicationStatus === 'approved';

  return (
    <motion.div
      className='bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300'
      whileHover={{ scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 400, damping: 10 }}>
      <Link href={`/product/${product._id}`}>
        <div className='relative w-full h-48'>
          <Image
            src={
              product.images?.[0] ||
              '/placeholder.svg?height=400&width=600&query=product image'
            }
            alt={product.name}
            fill
            style={{ objectFit: 'cover' }}
            className='transition-transform duration-300 hover:scale-105'
          />
        </div>
        <div className='p-4'>
          <h3 className='text-lg font-semibold text-gray-800 truncate'>
            {product.name}
          </h3>
          <p className='text-agronetGreen font-bold text-xl mt-1'>
            #{product.price.toFixed(2)}
          </p>
          {seller && (
            <div className='flex items-center text-sm text-gray-600 mt-2'>
              <span>{`${seller.firstname} ${seller.lastname}`}</span>
              {isVerified && (
                <Verified
                  className='h-4 w-4 text-agronetGreen ml-1'
                  aria-label='Verified Seller'
                />
              )}
            </div>
          )}
          <div className='flex items-center mt-2'>
            <div className='flex text-yellow-400'>
              {[...Array(5)].map((_, i) => (
                <span key={i}>
                  {i < Math.floor(product.ratingsAverage) ? '★' : '☆'}
                </span>
              ))}
            </div>
            <span className='text-sm text-gray-600 ml-1'>
              ({product.ratingsCount})
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
