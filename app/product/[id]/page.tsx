"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import {
  getProductById,
  getUserById,
  getWishlist,
  setWishlist,
  generateId,
  getChats,
  setChats,
} from "@/lib/local-storage-utils"
import type { Product, User } from "@/lib/types"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Verified, Heart, MessageSquare, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { motion } from "framer-motion"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useAuth } from "@/hooks/use-auth"

export default function ProductDetailPage() {
  const params = useParams()
  const productId = params.id as string
  const router = useRouter()
  const { toast } = useToast()
  const { isAuthenticated, user } = useAuth()

  const [product, setProduct] = useState<Product | null>(null)
  const [seller, setSeller] = useState<User | null>(null)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [showSecurityPopup, setShowSecurityPopup] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchedProduct = getProductById(productId)
    if (fetchedProduct) {
      setProduct(fetchedProduct)
      const fetchedSeller = getUserById(fetchedProduct.sellerId)
      if (fetchedSeller) {
        setSeller(fetchedSeller)
      }
      if (isAuthenticated && user) {
        const wishlist = getWishlist()
        setIsWishlisted(wishlist.some((item) => item.userId === user.id && item.productId === productId))
      }
    } else {
      toast({
        title: "Product Not Found",
        description: "The product you are looking for does not exist.",
        variant: "destructive",
      })
      router.push("/products")
    }
    setLoading(false)
  }, [productId, isAuthenticated, user, router, toast])

  const handleToggleWishlist = () => {
    if (!isAuthenticated || !user) {
      toast({
        title: "Login Required",
        description: "Please log in to add products to your wishlist.",
        variant: "warning",
      })
      router.push("/login")
      return
    }

    let wishlist = getWishlist()
    if (isWishlisted) {
      wishlist = wishlist.filter((item) => !(item.userId === user.id && item.productId === productId))
      toast({
        title: "Removed from Wishlist",
        description: `${product?.name} has been removed from your wishlist.`,
        variant: "default",
      })
    } else {
      wishlist.push({ userId: user.id, productId: productId })
      toast({
        title: "Added to Wishlist!",
        description: `${product?.name} has been added to your wishlist.`,
        variant: "success",
      })
    }
    setWishlist(wishlist)
    setIsWishlisted(!isWishlisted)
  }

  const handleMessageSeller = () => {
    if (!isAuthenticated || !user) {
      toast({
        title: "Login Required",
        description: "Please log in to message sellers.",
        variant: "warning",
      })
      router.push("/login")
      return
    }
    if (user.id === seller?.id) {
      toast({
        title: "Cannot Message Yourself",
        description: "You cannot initiate a chat with your own product.",
        variant: "warning",
      })
      return
    }
    setShowSecurityPopup(true)
  }

  const confirmChatInitiation = () => {
    setShowSecurityPopup(false)
    if (!user || !seller) return

    const chats = getChats()
    let existingChat = chats.find(
      (chat) =>
        (chat.participants[0] === user.id && chat.participants[1] === seller.id) ||
        (chat.participants[0] === seller.id && chat.participants[1] === user.id),
    )

    if (!existingChat) {
      existingChat = {
        id: generateId(),
        participants: [user.id, seller.id],
        messages: [],
        lastMessageAt: Date.now(),
      }
      chats.push(existingChat)
      setChats(chats)
    }

    router.push(`/chat/${existingChat.id}`)
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-agronetGreen" />
      </div>
    )
  }

  if (!product || !seller) {
    return null // Handled by redirect in useEffect
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid md:grid-cols-2 gap-8"
        >
          <div className="relative w-full h-80 md:h-[500px] rounded-lg overflow-hidden shadow-lg">
            <Image
              src={product.image || "/placeholder.svg?height=800&width=1200&query=product image large"}
              alt={product.name}
              fill
              style={{ objectFit: "cover" }}
              className="transition-transform duration-300 hover:scale-105"
            />
          </div>
          <div className="space-y-6">
            <h1 className="text-4xl font-bold text-agronetGreen">{product.name}</h1>
            <div className="flex items-center gap-2 text-lg text-gray-700">
              <span>Sold by: {seller.name}</span>
              {seller.isVerifiedSeller && <Verified className="h-5 w-5 text-agronetGreen" title="Verified Seller" />}
            </div>
            <p className="text-5xl font-extrabold text-agronetOrange">${product.price.toFixed(2)}</p>
            <p className="text-gray-800 leading-relaxed">{product.description}</p>
            <p className="text-gray-600">
              <span className="font-semibold">Category:</span> {product.category}
            </p>
            <p className="text-gray-600">
              <span className="font-semibold">Available Quantity:</span> {product.quantity}
            </p>
            <div className="flex gap-4">
              <Button
                className="bg-agronetGreen hover:bg-agronetGreen/90 text-white text-lg px-6 py-3 rounded-full shadow-md"
                onClick={handleMessageSeller}
              >
                <MessageSquare className="h-5 w-5 mr-2" /> Message Seller
              </Button>
              <Button
                variant="outline"
                className={`border-2 ${isWishlisted ? "border-agronetOrange text-agronetOrange" : "border-gray-300 text-gray-600"} hover:bg-agronetOrange hover:text-white text-lg px-6 py-3 rounded-full shadow-md`}
                onClick={handleToggleWishlist}
              >
                <Heart className={`h-5 w-5 mr-2 ${isWishlisted ? "fill-agronetOrange" : ""}`} />
                {isWishlisted ? "Wishlisted" : "Add to Wishlist"}
              </Button>
            </div>
          </div>
        </motion.div>
      </main>
      <Footer />

      <Dialog open={showSecurityPopup} onOpenChange={setShowSecurityPopup}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-agronetOrange">Security Warning</DialogTitle>
            <DialogDescription>
              Any payment conversations or transactions outside AgroNet are at your own risk. AgroNet is not responsible
              for any issues arising from off-platform interactions.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSecurityPopup(false)}>
              Cancel
            </Button>
            <Button onClick={confirmChatInitiation} className="bg-agronetGreen hover:bg-agronetGreen/90 text-white">
              Continue to Chat
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
