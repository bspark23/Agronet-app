"use client"

import { useState, useEffect, createContext, useContext, type ReactNode } from "react"
import { getLoggedInUserId, setLoggedInUserId, getUsers, getUserById, type User } from "@/lib/local-storage-utils"
import { useRouter } from "next/navigation"

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => boolean
  logout: () => void
  register: (name: string, email: string, password: string) => boolean
  isAuthenticated: boolean
  isAdmin: boolean
  isBuyer: boolean
  isSeller: boolean
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const userId = getLoggedInUserId()
    if (userId) {
      const currentUser = getUserById(userId)
      if (currentUser) {
        setUser(currentUser)
      } else {
        setLoggedInUserId(null) // Clear invalid user ID
      }
    }
    setLoading(false)
  }, [])

  const login = (email: string, password: string): boolean => {
    const users = getUsers()
    const foundUser = users.find((u) => u.email === email && u.password === password)
    if (foundUser) {
      setLoggedInUserId(foundUser.id)
      setUser(foundUser)
      return true
    }
    return false
  }

  const logout = () => {
    setLoggedInUserId(null)
    setUser(null)
    router.push("/login")
  }

  const register = (name: string, email: string, password: string): boolean => {
    const users = getUsers()
    const existingUser = users.find((u) => u.email === email)
    if (existingUser) {
      return false // User with this email already exists
    }

    const newUser: User = {
      id: `user-${Date.now()}`,
      name,
      email,
      password,
      role: "buyer", // Default role
      isVerifiedSeller: false,
    }
    users.push(newUser)
    localStorage.setItem(
      "agronet_data",
      JSON.stringify({ ...JSON.parse(localStorage.getItem("agronet_data") || "{}"), users }),
    )
    return true
  }

  const isAuthenticated = !!user
  const isAdmin = user?.role === "admin"
  const isBuyer = user?.role === "buyer"
  const isSeller = user?.role === "seller"

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        register,
        isAuthenticated,
        isAdmin,
        isBuyer,
        isSeller,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
