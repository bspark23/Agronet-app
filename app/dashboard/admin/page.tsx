"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { useProducts } from '@/hooks/use-products-api';
import { usersApi, farmerApplicationsApi } from '@/lib/api';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { Users, Store, ShoppingCart, FileText } from 'lucide-react'; // Import missing icons
import type { User, FarmerApplication } from '@/lib/types';

export default function AdminDashboardPage() {
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  const { products: allProducts, loading: productsLoading } = useProducts();
  const router = useRouter();
  const { toast } = useToast();

  const [users, setLocalUsers] = useState<User[]>([]);
  const [farmerApplications, setLocalFarmerApplications] = useState<
    FarmerApplication[]
  >([]);
  const [totalChats, setTotalChats] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading || productsLoading) return;

    if (!isAdmin) {
      router.push('/login'); // Redirect if not admin
      toast({
        title: 'Access Denied',
        description: 'You do not have permission to view this page.',
        variant: 'destructive',
      });
    } else {
      loadData();
    }
  }, [isAdmin, authLoading, productsLoading, router, toast]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load users from API
      const apiUsers = await usersApi.getUsers();
      setLocalUsers(apiUsers);

      // Load farmer applications from API
      const applications = await farmerApplicationsApi.getApplications();
      setLocalFarmerApplications(applications);

      // TODO: Load actual chats count from API
      setTotalChats(0);
    } catch (error) {
      console.error('Error loading admin dashboard data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load dashboard data. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const apiUsers = await usersApi.getUsers();
      setLocalUsers(apiUsers);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const loadFarmerApplications = async () => {
    try {
      const applications = await farmerApplicationsApi.getApplications();
      setLocalFarmerApplications(applications);
    } catch (error) {
      console.error('Error loading farmer applications:', error);
    }
  };

  const handleApprove = async (appId: string, userId: string) => {
    try {
      // Update application status to approved (backend now handles user role updates)
      const response = await farmerApplicationsApi.updateStatus(
        appId,
        'approved',
      );

      if (response.success) {
        // Refresh data from server since backend updates both application and user
        await Promise.all([loadFarmerApplications(), loadUsers()]);

        toast({
          title: 'Farmer Application Approved!',
          description: 'User role updated to Farmer and application approved.',
          variant: 'default',
        });
      } else {
        throw new Error(response.error || 'Failed to approve application');
      }
    } catch (error) {
      console.error('Error approving application:', error);
      toast({
        title: 'Error',
        description: 'Failed to approve application. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleReject = async (appId: string) => {
    try {
      // Update application status to rejected (backend now handles user status updates)
      const response = await farmerApplicationsApi.updateStatus(
        appId,
        'rejected',
      );

      if (response.success) {
        // Refresh data from server since backend updates both application and user
        await Promise.all([loadFarmerApplications(), loadUsers()]);

        toast({
          title: 'Farmer Application Rejected',
          description: 'The farmer application has been rejected.',
          variant: 'destructive',
        });
      } else {
        throw new Error(response.error || 'Failed to reject application');
      }
    } catch (error) {
      console.error('Error rejecting application:', error);
      toast({
        title: 'Error',
        description: 'Failed to reject application. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Good Morning';
    if (hour >= 12 && hour < 17) return 'Good Afternoon';
    if (hour >= 17 && hour < 22) return 'Good Evening';
    return 'Good Night';
  };

  if (authLoading || productsLoading || loading) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <Loader2 className='h-8 w-8 animate-spin text-agronetGreen' />
      </div>
    );
  }

  if (!isAdmin) {
    return null; // Should be redirected by useEffect
  }

  const totalUsers = users.length;
  const totalFarmers = users.filter(u => u.role === 'farmer').length;
  const pendingApplications = farmerApplications.filter(
    app => app.status === 'pending',
  ).length;

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
          Admin Dashboard Overview
        </motion.p>

        {/* Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10'>
          <Card className='bg-agronetGreen-50 border-agronetGreen'>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Total Users</CardTitle>
              <Users className='h-4 w-4 text-agronetGreen' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-agronetGreen'>
                {totalUsers}
              </div>
            </CardContent>
          </Card>
          <Card className='bg-agronetGreen-50 border-agronetGreen'>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Total Farmers
              </CardTitle>
              <Store className='h-4 w-4 text-agronetGreen' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-agronetGreen'>
                {totalFarmers}
              </div>
            </CardContent>
          </Card>
          <Card className='bg-agronetGreen-50 border-agronetGreen'>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Total Products
              </CardTitle>
              <ShoppingCart className='h-4 w-4 text-agronetGreen' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-agronetGreen'>
                {allProducts.length}
              </div>
            </CardContent>
          </Card>
          <Card className='bg-agronetGreen-50 border-agronetGreen'>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Pending Applications
              </CardTitle>
              <FileText className='h-4 w-4 text-agronetOrange' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-agronetOrange'>
                {pendingApplications}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Impersonation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className='mb-10'>
          <h2 className='text-2xl font-bold text-agronetGreen mb-4'>
            Impersonate Dashboards
          </h2>
          <div className='flex gap-4'>
            <Button
              onClick={() => router.push('/dashboard/buyer')}
              className='bg-agronetOrange hover:bg-agronetOrange/90 text-white'>
              View Buyer Dashboard
            </Button>
            <Button
              onClick={() => router.push('/dashboard/seller')}
              className='bg-agronetOrange hover:bg-agronetOrange/90 text-white'>
              View Seller Dashboard
            </Button>
          </div>
        </motion.div>

        {/* Seller Applications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className='mb-10'>
          <h2 className='text-2xl font-bold text-agronetGreen mb-4'>
            Seller Applications
          </h2>
          {farmerApplications.length === 0 ? (
            <p className='text-gray-600'>No seller applications to review.</p>
          ) : (
            <div className='rounded-md border'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User ID</TableHead>
                    <TableHead>ID Card</TableHead>
                    <TableHead>Proof of Farm</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className='text-right'>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {farmerApplications.map(app => {
                    const user =
                      typeof app.userId === 'string'
                        ? { firstname: 'Unknown', lastname: 'User' }
                        : app.userId;
                    return (
                      <TableRow key={app._id}>
                        <TableCell className='font-medium'>
                          {typeof app.userId === 'string'
                            ? app.userId
                            : `${user.firstname} ${user.lastname}`}
                        </TableCell>
                        <TableCell>
                          <a
                            href={app.idCardUrl}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='text-agronetGreen hover:underline'>
                            View ID Card
                          </a>
                        </TableCell>
                        <TableCell>
                          <a
                            href={app.proofOfFarmUrl}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='text-agronetGreen hover:underline'>
                            View Proof
                          </a>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              app.status === 'pending'
                                ? 'secondary'
                                : app.status === 'approved'
                                ? 'default'
                                : 'destructive'
                            }
                            className={
                              app.status === 'pending'
                                ? 'bg-agronetOrange text-white'
                                : app.status === 'approved'
                                ? 'bg-agronetGreen text-white'
                                : 'bg-red-500 text-white'
                            }>
                            {app.status.charAt(0).toUpperCase() +
                              app.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell className='text-right'>
                          {app.status === 'pending' && (
                            <div className='flex justify-end gap-2'>
                              <Button
                                variant='outline'
                                size='sm'
                                onClick={() =>
                                  handleApprove(
                                    app._id,
                                    typeof app.userId === 'string'
                                      ? app.userId
                                      : app.userId._id,
                                  )
                                }
                                className='border-agronetGreen text-agronetGreen hover:bg-agronetGreen hover:text-white'>
                                Approve
                              </Button>
                              <Button
                                variant='destructive'
                                size='sm'
                                onClick={() => handleReject(app._id)}>
                                Reject
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </motion.div>

        {/* All Users */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}>
          <h2 className='text-2xl font-bold text-agronetGreen mb-4'>
            All Users
          </h2>
          <div className='rounded-md border'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Account Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map(u => (
                  <TableRow key={u._id}>
                    <TableCell className='font-medium'>
                      {u.firstname} {u.lastname}
                    </TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>
                      <Badge
                        variant='outline'
                        className={
                          u.role === 'admin'
                            ? 'bg-blue-500 text-white'
                            : u.role === 'farmer'
                            ? 'bg-agronetGreen text-white'
                            : 'bg-gray-500 text-white'
                        }>
                        {u.role.charAt(0).toUpperCase() + u.role.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          u.accountStatus === 'active'
                            ? 'default'
                            : u.accountStatus === 'pending'
                            ? 'secondary'
                            : 'destructive'
                        }
                        className={
                          u.accountStatus === 'active'
                            ? 'bg-agronetGreen text-white'
                            : u.accountStatus === 'pending'
                            ? 'bg-agronetOrange text-white'
                            : 'bg-red-500 text-white'
                        }>
                        {u.accountStatus.charAt(0).toUpperCase() +
                          u.accountStatus.slice(1)}
                      </Badge>
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
  );
}
