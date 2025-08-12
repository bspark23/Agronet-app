"use client";

import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";
import { getProducts } from "@/lib/local-storage-utils";
import type { Product } from "@/lib/types";
import { ProductCard } from "@/components/product-card";
import { ContactForm } from "@/components/contact-form";
import { HeroSlider } from "@/components/hero-slider";

export default function HomePage() {
  const products: Product[] = getProducts();
  const featuredProducts = products.slice(0, 8); // Show first 8 as featured

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative w-full h-[60vh] md:h-[80vh] overflow-hidden">
          <HeroSlider />
          <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-center px-4">
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl md:text-6xl font-bold text-white mb-4 drop-shadow-lg"
            >
              Your Fresh Produce, Just a Click Away
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg md:text-xl text-white mb-8 max-w-2xl drop-shadow-md"
            >
              Connect directly with local farmers and verified sellers for the
              freshest agricultural products.
            </motion.p>
            <div className="flex gap-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <Button
                  asChild
                  className="bg-agronetGreen hover:bg-agronetGreen/90 text-white text-lg px-8 py-6 rounded-full shadow-lg"
                >
                  <Link href="/products">🛒 Shop Now</Link>
                </Button>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <Button
                  asChild
                  variant="outline"
                  className="border-2 border-agronetOrange text-agronetOrange hover:bg-agronetOrange hover:text-white text-lg px-8 py-6 rounded-full shadow-lg bg-transparent"
                >
                  <Link href="/apply-seller">🚜 Become a Seller</Link>
                </Button>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Featured Products */}
        <section className="py-12 md:py-20 bg-gray-50" id="featured-products">
          <div className="container mx-auto px-4 md:px-6">
            <motion.h2
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5 }}
              className="text-3xl md:text-4xl font-bold text-center text-agronetGreen mb-10"
            >
              Featured Products
            </motion.h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="text-center mt-10"
            >
              <Button
                asChild
                className="bg-agronetOrange hover:bg-agronetOrange/90 text-white text-lg px-8 py-4 rounded-full"
              >
                <Link href="/products">View All Products</Link>
              </Button>
            </motion.div>
          </div>
        </section>

        {/* About Section */}
        <section className="py-12 md:py-20 bg-white" id="about">
          <div className="container mx-auto px-4 md:px-6 text-center">
            <motion.h2
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5 }}
              className="text-3xl md:text-4xl font-bold text-agronetGreen mb-6"
            >
              About HarvestLink
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg text-gray-700 max-w-3xl mx-auto leading-relaxed"
            >
              HarvestLink is dedicated to fostering a direct connection between
              consumers and local agricultural producers. Our mission is to
              empower farmers by providing a platform to showcase their fresh,
              high-quality produce, while offering buyers a transparent and
              reliable source for their food needs. We believe in supporting
              local economies, promoting sustainable farming practices, and
              ensuring everyone has access to nutritious, farm-fresh goods.
            </motion.p>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-12 md:py-20 bg-gray-50" id="contact">
          <div className="container mx-auto px-4 md:px-6">
            <motion.h2
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5 }}
              className="text-3xl md:text-4xl font-bold text-center text-agronetGreen mb-10"
            >
              Get in Touch
            </motion.h2>
            <ContactForm />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
