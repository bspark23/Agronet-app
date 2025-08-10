"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { useProducts } from '@/hooks/use-products-api';
import type { Product } from '@/lib/types';
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { MessageSquare, Package, Eye, Heart, Loader2, Edit, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { motion } from "framer-motion"
import Link from "next/link"

export default function SellerDashboardPage() {
  const { user, isSeller, isAdmin, isLoading: authLoading } = useAuth();
  const {
    products: allProducts,
    loading: productsLoading,
    deleteProduct,
  } = useProducts();
  const router = useRouter()
  const { toast } = useToast()

  const [sellerProducts, setSellerProducts] = useState<Product[]>([])
  const [totalMessages, setTotalMessages] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authLoading || productsLoading) return;

    if (!isSeller && !isAdmin) {
      router.push('/login');
      toast({
        title: 'Access Denied',
        description: 'You do not have permission to view this page.',
        variant: 'destructive',
      });
      return;
    }

    loadData();
  }, [
    isSeller,
    isAdmin,
    authLoading,
    productsLoading,
    allProducts,
    router,
    toast,
  ]);

    const loadData = async () => {
      if (!user?._id) return;

      try {
        setLoading(true);

        // Filter products for current seller using loaded products
        const filteredProducts = allProducts.filter(
          (p: Product) => p.farmerId === user._id,
        );
        setSellerProducts(filteredProducts);

        // TODO: Load actual messages count from API
        setTotalMessages(0);
      } catch (error) {
        console.error('Error loading seller dashboard data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load dashboard data. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

  const handleDeleteProduct = async (productId: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const result = await deleteProduct(productId);
        if (result.success) {
          // Reload seller products after successful deletion
          loadData();
          toast({
            title: 'Product Deleted',
            description: 'Your product has been successfully removed.',
            variant: 'success',
          });
        } else {
          toast({
            title: 'Error',
            description:
              result.error || 'Failed to delete product. Please try again.',
            variant: 'destructive',
          });
        }
      } catch (error) {
        console.error('Error deleting product:', error);
        toast({
          title: 'Error',
          description: 'Failed to delete product. Please try again.',
          variant: 'destructive',
        });
      }
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour >= 5 && hour < 12) return "Good Morning"
    if (hour >= 12 && hour < 17) return "Good Afternoon"
    if (hour >= 17 && hour < 22) return "Good Evening"
    return "Good Night"
  }

  if (authLoading || productsLoading || loading) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <Loader2 className='h-8 w-8 animate-spin text-agronetGreen' />
      </div>
    );
  }

  if (!isSeller && !isAdmin) {
    return null // Should be redirected by useEffect
  }

  // Mock analytics data
  const totalViews = sellerProducts.length * 150 // Avg 150 views per product
  const totalSavedItems = sellerProducts.length * 10 // Avg 10 saves per product

  return (
    <div className='flex flex-col min-h-screen'>
      <Navbar />
      <main className='flex-1 container mx-auto px-4 py-8 md:px-6'>
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className='text-3xl font-bold text-agronetGreen mb-6'>
          {getGreeting()}, {user?.firstname}!
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className='text-lg text-gray-700 mb-8'>
          Welcome to your Seller Dashboard. Manage your products and
          interactions.
        </motion.p>

        {/* Analytics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10'>
          <Card className='bg-agronetGreen-50 border-agronetGreen'>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Total Products
              </CardTitle>
              <Package className='h-4 w-4 text-agronetGreen' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-agronetGreen'>
                {sellerProducts.length}
              </div>
            </CardContent>
          </Card>
          <Card className='bg-agronetGreen-50 border-agronetGreen'>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Total Views</CardTitle>
              <Eye className='h-4 w-4 text-agronetGreen' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-agronetGreen'>
                {totalViews}
              </div>
            </CardContent>
          </Card>
          <Card className='bg-agronetGreen-50 border-agronetGreen'>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Total Messages
              </CardTitle>
              <MessageSquare className='h-4 w-4 text-agronetOrange' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-agronetOrange'>
                {totalMessages}
              </div>
            </CardContent>
          </Card>
          <Card className='bg-agronetGreen-50 border-agronetGreen'>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Saved by Buyers
              </CardTitle>
              <Heart className='h-4 w-4 text-agronetOrange' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-agronetOrange'>
                {totalSavedItems}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Product Management */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className='mb-10'>
          <div className='flex justify-between items-center mb-4'>
            <h2 className='text-2xl font-bold text-agronetGreen'>
              Your Products
            </h2>
            <Button
              asChild
              className='bg-agronetOrange hover:bg-agronetOrange/90 text-white'>
              <Link href='/post-product'>Post New Product</Link>
            </Button>
          </div>
          {sellerProducts.length === 0 ? (
            <p className='text-gray-600'>
              You haven&apos;t posted any products yet.
            </p>
          ) : (
            <div className='rounded-md border'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product Name</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead className='text-right'>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sellerProducts.map(product => (
                    <TableRow key={product._id}>
                      <TableCell className='font-medium'>
                        <Link
                          href={`/product/${product._id}`}
                          className='hover:underline text-agronetGreen'>
                          {product.name}
                        </Link>
                      </TableCell>
                      <TableCell>${product.price.toFixed(2)}</TableCell>
                      <TableCell>{product.quantity}</TableCell>
                      <TableCell className='text-right'>
                        <div className='flex justify-end gap-2'>
                          <Button
                            asChild
                            variant='outline'
                            size='sm'
                            className='border-agronetGreen text-agronetGreen hover:bg-agronetGreen hover:text-white bg-transparent'>
                            <Link href={`/post-product?id=${product._id}`}>
                              <Edit className='h-4 w-4' />
                              <span className='sr-only'>Edit</span>
                            </Link>
                          </Button>
                          <Button
                            variant='destructive'
                            size='sm'
                            onClick={() => handleDeleteProduct(product._id)}>
                            <Trash2 className='h-4 w-4' />
                            <span className='sr-only'>Delete</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </motion.div>

        {/* My Chats (Link) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}>
          <h2 className='text-2xl font-bold text-agronetGreen mb-4'>
            Your Conversations
          </h2>
          <Button
            asChild
            className='bg-agronetGreen hover:bg-agronetGreen/90 text-white'>
            <Link href='/chats'>View All Chats</Link>
          </Button>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}
