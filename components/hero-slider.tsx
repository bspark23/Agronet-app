"use client"

import Image from "next/image"
import { useState, useEffect } from "react"
import { AnimatePresence, motion } from "framer-motion"

const images = [
  "/images/fruit-market.jpg",
  "/images/rice-terraces.jpg",
  "/images/fruit-market.jpg", // Repeated
  "/images/rice-terraces.jpg", // Repeated
  "/images/fruit-market.jpg", // Repeated
]

export function HeroSlider() {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length)
    }, 5000) // Change image every 5 seconds
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="absolute inset-0 w-full h-full">
      <AnimatePresence initial={false}>
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5 }}
          className="absolute inset-0 w-full h-full"
        >
          <Image
            src={images[currentIndex] || "/placeholder.svg"}
            alt={`Slide ${currentIndex + 1}`}
            fill
            style={{ objectFit: "cover" }}
            priority={currentIndex === 0} // Prioritize loading the first image
            className="brightness-[0.6]"
          />
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
