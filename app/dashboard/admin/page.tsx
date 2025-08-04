"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import {
  getUsers,
  getSellerApplications,
  setUsers,
  setSellerApplications,
  type User,
  type SellerApplication,
  getProducts,
  getChats,
} from "@/lib/local-storage-utils"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { motion } from "framer-motion"
import { Loader2 } from "lucide-react"
import { Users, Store, ShoppingCart, FileText } from "lucide-react" // Import missing icons

export default function AdminDashboardPage() {
  const { user, isAdmin, loading: authLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const [users, setLocalUsers] = useState<User[]>([])
  const [sellerApplications, setLocalSellerApplications] = useState<SellerApplication[]>([])
  const [totalProducts, setTotalProducts] = useState(0)
  const [totalChats, setTotalChats] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading) {
      if (!isAdmin) {
        router.push("/login") // Redirect if not admin
        toast({
          title: "Access Denied",
          description: "You do not have permission to view this page.",
          variant: "destructive",
        })
      } else {
        loadData()
        setLoading(false)
      }
    }
  }, [isAdmin, authLoading, router, toast])

  const loadData = () => {
    setLocalUsers(getUsers())
    setLocalSellerApplications(getSellerApplications())
    setTotalProducts(getProducts().length)
    setTotalChats(getChats().length)
  }

  const handleApprove = (appId: string, userId: string) => {
    const updatedApplications = sellerApplications.map((app) =>
      app.id === appId ? { ...app, status: "approved" } : app,
    )
    setLocalSellerApplications(updatedApplications)
    setSellerApplications(updatedApplications)

    const updatedUsers = users.map((u) => (u.id === userId ? { ...u, role: "seller", isVerifiedSeller: true } : u))
    setLocalUsers(updatedUsers)
    setUsers(updatedUsers)

    toast({
      title: "Seller Approved!",
      description: "User role updated to Seller and marked as verified.",
      variant: "success",
    })
  }

  const handleReject = (appId: string) => {
    const updatedApplications = sellerApplications.map((app) =>
      app.id === appId ? { ...app, status: "rejected" } : app,
    )
    setLocalSellerApplications(updatedApplications)
    setSellerApplications(updatedApplications)

    toast({
      title: "Seller Application Rejected",
      description: "The seller application has been rejected.",
      variant: "warning",
    })
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

  if (!isAdmin) {
    return null // Should be redirected by useEffect
  }

  const totalUsers = users.length
  const totalSellers = users.filter((u) => u.role === "seller").length
  const pendingApplications = sellerApplications.filter((app) => app.status === "pending").length

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
          Admin Dashboard Overview
        </motion.p>

        {/* Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10"
        >
          <Card className="bg-agronetGreen-50 border-agronetGreen">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-agronetGreen" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-agronetGreen">{totalUsers}</div>
            </CardContent>
          </Card>
          <Card className="bg-agronetGreen-50 border-agronetGreen">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sellers</CardTitle>
              <Store className="h-4 w-4 text-agronetGreen" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-agronetGreen">{totalSellers}</div>
            </CardContent>
          </Card>
          <Card className="bg-agronetGreen-50 border-agronetGreen">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <ShoppingCart className="h-4 w-4 text-agronetGreen" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-agronetGreen">{totalProducts}</div>
            </CardContent>
          </Card>
          <Card className="bg-agronetGreen-50 border-agronetGreen">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Applications</CardTitle>
              <FileText className="h-4 w-4 text-agronetOrange" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-agronetOrange">{pendingApplications}</div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Impersonation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mb-10"
        >
          <h2 className="text-2xl font-bold text-agronetGreen mb-4">Impersonate Dashboards</h2>
          <div className="flex gap-4">
            <Button
              onClick={() => router.push("/dashboard/buyer")}
              className="bg-agronetOrange hover:bg-agronetOrange/90 text-white"
            >
              View Buyer Dashboard
            </Button>
            <Button
              onClick={() => router.push("/dashboard/seller")}
              className="bg-agronetOrange hover:bg-agronetOrange/90 text-white"
            >
              View Seller Dashboard
            </Button>
          </div>
        </motion.div>

        {/* Seller Applications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mb-10"
        >
          <h2 className="text-2xl font-bold text-agronetGreen mb-4">Seller Applications</h2>
          {sellerApplications.length === 0 ? (
            <p className="text-gray-600">No seller applications to review.</p>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Applicant Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sellerApplications.map((app) => (
                    <TableRow key={app.id}>
                      <TableCell className="font-medium">{app.fullName}</TableCell>
                      <TableCell>{app.email}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{app.reason}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            app.status === "pending"
                              ? "secondary"
                              : app.status === "approved"
                                ? "success"
                                : "destructive"
                          }
                          className={
                            app.status === "pending"
                              ? "bg-agronetOrange text-white"
                              : app.status === "approved"
                                ? "bg-agronetGreen text-white"
                                : "bg-red-500 text-white"
                          }
                        >
                          {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {app.status === "pending" && (
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleApprove(app.id, app.userId)}
                              className="border-agronetGreen text-agronetGreen hover:bg-agronetGreen hover:text-white"
                            >
                              Approve
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => handleReject(app.id)}>
                              Reject
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </motion.div>

        {/* All Users */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <h2 className="text-2xl font-bold text-agronetGreen mb-4">All Users</h2>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Verified Seller</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.name}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          u.role === "admin"
                            ? "bg-blue-500 text-white"
                            : u.role === "seller"
                              ? "bg-agronetGreen text-white"
                              : "bg-gray-500 text-white"
                        }
                      >
                        {u.role.charAt(0).toUpperCase() + u.role.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {u.isVerifiedSeller ? (
                        <Badge variant="success" className="bg-agronetGreen text-white">
                          Yes
                        </Badge>
                      ) : (
                        <Badge variant="secondary">No</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  )
}
