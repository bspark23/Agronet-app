"use client"

import type React from "react"

import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { motion } from "framer-motion"
import Image from "next/image"
import { Leaf, Handshake, Users } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8 md:px-6">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl font-bold text-agronetGreen mb-8 text-center"
        >
          About AgroNet
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid md:grid-cols-2 gap-10 items-center mb-12"
        >
          <div className="relative w-full h-64 md:h-96 rounded-lg overflow-hidden shadow-lg">
            <Image
              src="/placeholder.svg?height=600&width=800"
              alt="AgroNet Team"
              fill
              style={{ objectFit: "cover" }}
              className="transition-transform duration-300 hover:scale-105"
            />
          </div>
          <div className="space-y-6">
            <h2 className="text-3xl font-semibold text-agronetOrange">Our Mission</h2>
            <p className="text-lg text-gray-700 leading-relaxed">
              At AgroNet, our mission is to revolutionize the agricultural marketplace by creating a direct,
              transparent, and efficient connection between local farmers and consumers. We are committed to empowering
              farmers, promoting sustainable practices, and ensuring access to fresh, high-quality produce for everyone.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              We believe in the power of community and the importance of knowing where your food comes from. AgroNet is
              more than just a marketplace; it's a platform built on trust, quality, and a shared passion for
              agriculture.
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center mb-12"
        >
          <CardFeature
            icon={Leaf}
            title="Sustainability"
            description="Promoting eco-friendly farming methods and reducing food waste."
          />
          <CardFeature
            icon={Handshake}
            title="Fair Trade"
            description="Ensuring fair prices for farmers and transparent transactions for buyers."
          />
          <CardFeature
            icon={Users}
            title="Community Focus"
            description="Building a strong network between local producers and consumers."
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center max-w-3xl mx-auto space-y-6"
        >
          <h2 className="text-3xl font-semibold text-agronetGreen">Our Vision</h2>
          <p className="text-lg text-gray-700 leading-relaxed">
            We envision a future where fresh, locally sourced food is accessible to all, and farmers are celebrated for
            their hard work and dedication. AgroNet aims to be the leading platform for agricultural trade, fostering a
            vibrant ecosystem where quality produce thrives and communities flourish.
          </p>
          <p className="text-lg text-gray-700 leading-relaxed">
            Join us in cultivating a healthier, more connected world, one farm-fresh product at a time.
          </p>
        </motion.div>
      </main>
      <Footer />
    </div>
  )
}

interface CardFeatureProps {
  icon: React.ElementType
  title: string
  description: string
}

function CardFeature({ icon: Icon, title, description }: CardFeatureProps) {
  return (
    <div className="bg-agronetGreen-50 p-6 rounded-lg shadow-md flex flex-col items-center">
      <Icon className="h-12 w-12 text-agronetGreen mb-4" />
      <h3 className="text-xl font-semibold text-agronetOrange mb-2">{title}</h3>
      <p className="text-gray-700 text-sm">{description}</p>
    </div>
  )
}
