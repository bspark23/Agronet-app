"use client"

import Image from "next/image"
import Link from "next/link"
import type { Product, User } from "@/lib/types"
import { Verified } from "lucide-react"
import { getUserById } from "@/lib/local-storage-utils"
import { motion } from "framer-motion"

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const seller: User | undefined = getUserById(product.sellerId)
  const isVerified = seller?.isVerifiedSeller

  return (
    <motion.div
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 400, damping: 10 }}
    >
      <Link href={`/product/${product.id}`}>
        <div className="relative w-full h-48">
          <Image
            src={product.image || "/placeholder.svg?height=400&width=600&query=product image"}
            alt={product.name}
            fill
            style={{ objectFit: "cover" }}
            className="transition-transform duration-300 hover:scale-105"
          />
        </div>
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-800 truncate">{product.name}</h3>
          <p className="text-agronetGreen font-bold text-xl mt-1">${product.price.toFixed(2)}</p>
          {seller && (
            <div className="flex items-center text-sm text-gray-600 mt-2">
              <span>{seller.name}</span>
              {isVerified && <Verified className="h-4 w-4 text-agronetGreen ml-1" title="Verified Seller" />}
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  )
}
