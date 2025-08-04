"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import {
  getSellerApplications,
  setSellerApplications,
  generateId,
  setAdminNotification,
} from "@/lib/local-storage-utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { motion } from "framer-motion"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Loader2 } from "lucide-react"

export default function ApplySellerPage() {
  const { user, isAuthenticated, isSeller, loading: authLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [reason, setReason] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push("/login")
        toast({
          title: "Authentication Required",
          description: "Please log in to apply to become a seller.",
          variant: "destructive",
        })
      } else if (isSeller) {
        router.push("/dashboard/seller")
        toast({
          title: "Already a Seller",
          description: "You are already an approved seller.",
          variant: "warning",
        })
      } else {
        // Pre-fill if user is logged in
        if (user) {
          setFullName(user.name)
          setEmail(user.email)
        }
        setLoading(false)
      }
    }
  }, [isAuthenticated, isSeller, user, authLoading, router, toast])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      toast({
        title: "Error",
        description: "User not found. Please log in again.",
        variant: "destructive",
      })
      return
    }

    const applications = getSellerApplications()
    const existingApplication = applications.find((app) => app.userId === user.id && app.status === "pending")

    if (existingApplication) {
      toast({
        title: "Application Already Submitted",
        description: "You have a pending seller application. Please wait for review.",
        variant: "warning",
      })
      return
    }

    const newApplication = {
      id: generateId(),
      userId: user.id,
      fullName,
      email,
      reason,
      status: "pending" as const,
      appliedAt: Date.now(),
    }

    applications.push(newApplication)
    setSellerApplications(applications)
    setAdminNotification(true) // Notify admin

    toast({
      title: "Application Submitted!",
      description: "Your application is under review. You’ll receive feedback in 2–5 working days.",
      variant: "success",
    })

    setFullName("")
    setEmail("")
    setReason("")
    router.push("/dashboard/buyer") // Redirect buyer to their dashboard
  }

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-agronetGreen" />
      </div>
    )
  }

  if (!isAuthenticated || isSeller) {
    return null // Should be redirected by useEffect
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 flex items-center justify-center bg-agronetGreen-50 p-4">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg"
        >
          <h1 className="mb-6 text-center text-3xl font-bold text-agronetGreen">Become a Seller</h1>
          <p className="mb-6 text-center text-gray-600">
            Fill out the form below to apply to become a verified seller on AgroNet.
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Your Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                readOnly={!!user} // Make read-only if user is logged in
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                readOnly={!!user} // Make read-only if user is logged in
              />
            </div>
            <div>
              <Label htmlFor="reason">Reason for Applying</Label>
              <Textarea
                id="reason"
                placeholder="Tell us why you want to become a seller..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
                rows={5}
              />
            </div>
            <Button type="submit" className="w-full bg-agronetOrange hover:bg-agronetOrange/90 text-white">
              Submit Application
            </Button>
          </form>
        </motion.div>
      </main>
      <Footer />
    </div>
  )
}
