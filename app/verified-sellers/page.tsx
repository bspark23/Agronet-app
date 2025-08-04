"use client"

import { useEffect, useState } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { getVerifiedSellers, type User } from "@/lib/local-storage-utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Verified, Loader2, Mail, Phone } from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"

export default function VerifiedSellersPage() {
  const [sellers, setSellers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setSellers(getVerifiedSellers())
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-agronetGreen" />
      </div>
    )
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
          Our Verified Sellers
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-lg text-gray-700 mb-8 text-center max-w-2xl mx-auto"
        >
          Connect with trusted and verified agricultural producers. Each seller on this list has been approved by
          AgroNet to ensure quality and reliability.
        </motion.p>

        {sellers.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-center text-gray-600 text-lg mt-10"
          >
            <p>No verified sellers available at the moment.</p>
            <p>Check back later!</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sellers.map((seller, index) => (
              <motion.div
                key={seller.id}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
              >
                <Card className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                  <CardHeader className="flex flex-col items-center text-center p-6">
                    <Avatar className="h-24 w-24 mb-4">
                      <AvatarImage src="/placeholder.svg?height=96&width=96" alt={seller.name} />
                      <AvatarFallback className="text-4xl">{seller.name.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <CardTitle className="text-2xl font-bold text-agronetGreen flex items-center gap-2">
                      {seller.name}{" "}
                      <Verified className="h-6 w-6 text-agronetGreen fill-agronetGreen" title="Verified Seller" />
                    </CardTitle>
                    <p className="text-sm text-gray-600">Verified Agricultural Producer</p>
                  </CardHeader>
                  <CardContent className="p-6 border-t border-gray-100 space-y-3">
                    <div className="flex items-center text-gray-700">
                      <Mail className="h-5 w-5 mr-2 text-agronetOrange" />
                      <span>{seller.email}</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <Phone className="h-5 w-5 mr-2 text-agronetOrange" />
                      <span>(123) 456-7890 (Simulated)</span>
                    </div>
                    <Link href={`/products?sellerId=${seller.id}`} className="block text-center mt-4">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-full bg-agronetGreen hover:bg-agronetGreen/90 text-white py-2 rounded-md font-semibold transition-colors"
                      >
                        View Products
                      </motion.button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
