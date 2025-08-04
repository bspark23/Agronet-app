"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getProducts, getWishlist, type Product } from "@/lib/local-storage-utils"
import { ProductCard } from "@/components/product-card"
import { Heart, Loader2, ShoppingCart, FileText } from "lucide-react"
import { motion } from "framer-motion"

export default function BuyerDashboardPage() {
  const { user, isBuyer, isAdmin, loading: authLoading } = useAuth()
  const router = useRouter()
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading) {
      if (!isBuyer && !isAdmin) {
        router.push("/login") // Redirect if not buyer or admin
      } else {
        loadWishlist()
        setLoading(false)
      }
    }
  }, [isBuyer, isAdmin, authLoading, router])

  const loadWishlist = () => {
    const allProducts = getProducts()
    const userWishlist = getWishlist().filter((item) => item.userId === user?.id)
    const productsInWishlist = userWishlist
      .map((item) => allProducts.find((p) => p.id === item.productId))
      .filter(Boolean) as Product[]
    setWishlistProducts(productsInWishlist)
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour >= 5 && hour < 12) return "Good Morning"
    if (hour >= 12 && hour < 17) return "Good Afternoon"
    if (hour >= 17 && hour < 22) return "Good Evening"
    return "Good Night"
  }

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-agronetGreen" />
      </div>
    )
  }

  if (!isBuyer && !isAdmin) {
    return null // Should be redirected by useEffect
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8 md:px-6">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-3xl font-bold text-agronetGreen mb-6"
        >
          {getGreeting()}, {user?.name}!
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-lg text-gray-700 mb-8"
        >
          Welcome to your Buyer Dashboard.
        </motion.p>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10"
        >
          <Card className="bg-agronetGreen-50 border-agronetGreen">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Browse Products</CardTitle>
              <ShoppingCart className="h-4 w-4 text-agronetGreen" />
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => router.push("/products")}
                className="w-full bg-agronetGreen hover:bg-agronetGreen/90 text-white"
              >
                Shop Now
              </Button>
            </CardContent>
          </Card>
          <Card className="bg-agronetGreen-50 border-agronetGreen">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">My Wishlist</CardTitle>
              <Heart className="h-4 w-4 text-agronetOrange" />
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => router.push("/wishlist")}
                className="w-full bg-agronetOrange hover:bg-agronetOrange/90 text-white"
              >
                View Wishlist
              </Button>
            </CardContent>
          </Card>
          <Card className="bg-agronetGreen-50 border-agronetGreen">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Become a Seller</CardTitle>
              <FileText className="h-4 w-4 text-agronetGreen" />
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => router.push("/apply-seller")}
                className="w-full bg-agronetGreen hover:bg-agronetGreen/90 text-white"
              >
                Apply Now
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Wishlist Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mb-10"
        >
          <h2 className="text-2xl font-bold text-agronetGreen mb-4">Your Wishlist</h2>
          {wishlistProducts.length === 0 ? (
            <p className="text-gray-600">Your wishlist is empty. Start adding products!</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {wishlistProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </motion.div>
      </main>
      <Footer />
    </div>
  )
}
