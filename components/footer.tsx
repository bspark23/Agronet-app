"use client"

import Link from "next/link"
import { useAuth } from '@/hooks/use-auth';
import { Facebook, Instagram, Twitter } from "lucide-react"
import { motion } from "framer-motion"

export function Footer() {
  const { isSeller, isAdmin } = useAuth();
  
  return (
    <motion.footer
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5 }}
      className='bg-agronetGreen text-white py-8'>
      <div className='container mx-auto px-4 md:px-6 grid grid-cols-1 md:grid-cols-3 gap-8'>
        <div className='space-y-4'>
          <h3 className='text-lg font-bold'>AgroNet</h3>
          <p className='text-sm'>
            Connecting farmers and buyers for a sustainable future.
          </p>
          <div className='flex space-x-4'>
            <Link
              href='#'
              className='hover:text-agronetOrange transition-colors'>
              <Facebook className='h-6 w-6' />
            </Link>
            <Link
              href='#'
              className='hover:text-agronetOrange transition-colors'>
              <Twitter className='h-6 w-6' />
            </Link>
            <Link
              href='#'
              className='hover:text-agronetOrange transition-colors'>
              <Instagram className='h-6 w-6' />
            </Link>
          </div>
        </div>
        <div className='space-y-4'>
          <h3 className='text-lg font-bold'>Quick Links</h3>
          <ul className='space-y-2 text-sm'>
            <li>
              <Link
                href='/products'
                className='hover:text-agronetOrange transition-colors'>
                Products
              </Link>
            </li>
            <li>
              <Link
                href='/verified-sellers'
                className='hover:text-agronetOrange transition-colors'>
                Verified Sellers
              </Link>
            </li>
            <li>
              <Link
                href='/about'
                className='hover:text-agronetOrange transition-colors'>
                About Us
              </Link>
            </li>
            <li>
              <Link
                href='/contact'
                className='hover:text-agronetOrange transition-colors'>
                Contact
              </Link>
            </li>
            {/* Only show Become a Seller link if user is not already a seller or admin */}
            {!isSeller && !isAdmin && (
              <li>
                <Link
                  href='/apply-seller'
                  className='hover:text-agronetOrange transition-colors'>
                  Become a Seller
                </Link>
              </li>
            )}
          </ul>
        </div>
        <div className='space-y-4'>
          <h3 className='text-lg font-bold'>Contact Us</h3>
          <p className='text-sm'>123 Farm Road, Rural Town, AG 12345</p>
          <p className='text-sm'>Email: info@agronet.com</p>
          <p className='text-sm'>Phone: (123) 456-7890</p>
        </div>
      </div>
      <div className='mt-8 text-center text-sm'>
        &copy; {new Date().getFullYear()} AgroNet. All rights reserved.
      </div>
    </motion.footer>
  );
}
