"use client"

import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { ContactForm } from "@/components/contact-form"
import { motion } from "framer-motion"
import { Mail, Phone, MapPin } from "lucide-react"

export default function ContactPage() {
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
          Contact Us
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-lg text-gray-700 mb-10 text-center max-w-2xl mx-auto"
        >
          We&apos;d love to hear from you! Whether you have a question, feedback, or just want to say hello, feel free
          to reach out.
        </motion.p>

        <div className="grid md:grid-cols-2 gap-10">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-6 bg-agronetGreen-50 p-8 rounded-lg shadow-lg"
          >
            <h2 className="text-2xl font-semibold text-agronetOrange mb-4">Our Details</h2>
            <div className="flex items-center text-lg text-gray-800">
              <Mail className="h-6 w-6 mr-3 text-agronetGreen" />
              <span>info@agronet.com</span>
            </div>
            <div className="flex items-center text-lg text-gray-800">
              <Phone className="h-6 w-6 mr-3 text-agronetGreen" />
              <span>(123) 456-7890</span>
            </div>
            <div className="flex items-start text-lg text-gray-800">
              <MapPin className="h-6 w-6 mr-3 text-agronetGreen flex-shrink-0" />
              <span>123 Farm Road, Rural Town, AG 12345, Countryside</span>
            </div>
            <div className="mt-8">
              <h3 className="text-xl font-semibold text-agronetGreen mb-2">Business Hours</h3>
              <p className="text-gray-700">Monday - Friday: 9:00 AM - 5:00 PM</p>
              <p className="text-gray-700">Saturday: 10:00 AM - 2:00 PM</p>
              <p className="text-gray-700">Sunday: Closed</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h2 className="text-2xl font-semibold text-agronetOrange mb-4 text-center md:text-left">
              Send Us a Message
            </h2>
            <ContactForm />
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
