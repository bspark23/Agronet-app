"use client"

import { useState, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { productsApi } from '@/lib/api';
import type { Product } from "@/lib/types"
import { ProductCard } from "@/components/product-card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { motion } from "framer-motion"
import { Loader2 } from "lucide-react"

export default function ProductsPage() {
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [priceFilter, setPriceFilter] = useState("all")
  const [sellerStatusFilter, setSellerStatusFilter] = useState("all")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const products = await productsApi.getProducts();
        setAllProducts(products);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching products:', err);
        setError(err.message || 'Failed to load products');
        // Fallback to empty array if API fails
        setAllProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [])

  useEffect(() => {
    let currentProducts = [...allProducts];

    // Filter by search term
    if (searchTerm) {
      currentProducts = currentProducts.filter(
        product =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // Filter by category
    if (categoryFilter !== 'all') {
      currentProducts = currentProducts.filter(
        product => product.category === categoryFilter,
      );
    }

    // Filter by price
    if (priceFilter !== 'all') {
      currentProducts.sort((a, b) => {
        if (priceFilter === 'low-to-high') {
          return a.price - b.price;
        } else {
          // high-to-low
          return b.price - a.price;
        }
      });
    }

    // Filter by seller status - For now, we'll skip this filter since we need to implement seller verification
    // if (sellerStatusFilter !== "all") {
    //   const verifiedSellerIds = new Set(getVerifiedSellers().map((s) => s.id))
    //   currentProducts = currentProducts.filter((product) => {
    //     const isVerified = verifiedSellerIds.has(product.sellerId)
    //     return sellerStatusFilter === "verified" ? isVerified : !isVerified
    //   })
    // }

    setFilteredProducts(currentProducts);
  }, [allProducts, searchTerm, categoryFilter, priceFilter, sellerStatusFilter])

  const allCategories = Array.from(new Set(allProducts.map((p) => p.category)))

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-agronetGreen" />
      </div>
    )
  }

  if (error) {
    return (
      <div className='flex flex-col min-h-screen'>
        <Navbar />
        <main className='flex-1 container mx-auto px-4 py-8 md:px-6'>
          <div className='text-center'>
            <h1 className='text-2xl font-bold text-red-600 mb-4'>
              Error Loading Products
            </h1>
            <p className='text-gray-600'>{error}</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8 md:px-6">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-3xl font-bold text-agronetGreen mb-6 text-center"
        >
          Our Products
        </motion.h1>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-4"
        >
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="col-span-full md:col-span-1"
          />
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Filter by Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {allCategories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={priceFilter} onValueChange={setPriceFilter}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Sort by Price" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">No Price Sort</SelectItem>
              <SelectItem value="low-to-high">Price: Low to High</SelectItem>
              <SelectItem value="high-to-low">Price: High to Low</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sellerStatusFilter} onValueChange={setSellerStatusFilter}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Filter by Seller Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sellers</SelectItem>
              <SelectItem value="verified">Verified Sellers</SelectItem>
              <SelectItem value="unverified">Unverified Sellers</SelectItem>
            </SelectContent>
          </Select>
        </motion.div>

        {/* Product Grid */}
        {filteredProducts.length === 0 ? (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center text-gray-600 text-lg mt-10"
          >
            No products found matching your criteria.
          </motion.p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
