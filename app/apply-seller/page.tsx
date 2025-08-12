"use client"

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { farmerApplicationsApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Loader2, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';

export default function ApplySellerPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    farmName: '',
    farmLocation: '',
    farmSize: '',
    cropsGrown: '',
    experience: '',
    contactPhone: '',
    description: '',
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated || !user) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to submit an application.',
        variant: 'destructive',
      });
      router.push('/login');
      return;
    }

    setLoading(true);

    try {
      const applicationData = {
        userId: user._id,
        farmName: formData.farmName,
        farmLocation: formData.farmLocation,
        farmSize: formData.farmSize,
        cropsGrown: formData.cropsGrown.split(',').map(crop => crop.trim()),
        experience: parseInt(formData.experience),
        contactPhone: formData.contactPhone,
        description: formData.description,
      };

      const result = await farmerApplicationsApi.createApplication(
        applicationData,
      );

      if (result.success) {
        setSubmitted(true);
        toast({
          title: 'Application Submitted!',
          description:
            "Your farmer application has been submitted successfully. We'll review it and get back to you soon.",
        });
      } else {
        throw new Error(result.error || 'Failed to submit application');
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      toast({
        title: 'Submission Failed',
        description:
          error instanceof Error
            ? error.message
            : 'Failed to submit application. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className='flex flex-col min-h-screen'>
        <Navbar />
        <main className='flex-1 container mx-auto px-4 py-8 md:px-6'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className='max-w-2xl mx-auto text-center'>
            <CheckCircle className='h-16 w-16 text-green-500 mx-auto mb-6' />
            <h1 className='text-3xl font-bold text-agronetGreen mb-4'>
              Application Submitted Successfully!
            </h1>
            <p className='text-gray-600 mb-8'>
              Thank you for your interest in becoming a verified farmer on
              AgroNet. Our team will review your application and contact you
              within 3-5 business days.
            </p>
            <div className='space-y-4'>
              <Button
                onClick={() => router.push('/dashboard/buyer')}
                className='bg-agronetGreen hover:bg-green-600 mr-4'>
                Go to Dashboard
              </Button>
              <Button variant='outline' onClick={() => router.push('/')}>
                Back to Home
              </Button>
            </div>
          </motion.div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className='flex flex-col min-h-screen'>
      <Navbar />
      <main className='flex-1 container mx-auto px-4 py-8 md:px-6'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className='max-w-2xl mx-auto'>
          <div className='text-center mb-8'>
            <h1 className='text-3xl font-bold text-agronetGreen mb-4'>
              Apply to Become a Verified Farmer
            </h1>
            <p className='text-gray-600'>
              Join our community of trusted farmers and start selling your
              produce directly to buyers.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className='text-agronetGreen'>
                Farmer Application Form
              </CardTitle>
              <CardDescription>
                Please provide detailed information about your farming
                operation.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className='space-y-6'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='farmName'>Farm Name *</Label>
                    <Input
                      id='farmName'
                      name='farmName'
                      value={formData.farmName}
                      onChange={handleInputChange}
                      placeholder='Enter your farm name'
                      required
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='farmLocation'>Farm Location *</Label>
                    <Input
                      id='farmLocation'
                      name='farmLocation'
                      value={formData.farmLocation}
                      onChange={handleInputChange}
                      placeholder='City, State/Province'
                      required
                    />
                  </div>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='farmSize'>Farm Size (acres) *</Label>
                    <Input
                      id='farmSize'
                      name='farmSize'
                      value={formData.farmSize}
                      onChange={handleInputChange}
                      placeholder='e.g., 50 acres'
                      required
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='experience'>Years of Experience *</Label>
                    <Input
                      id='experience'
                      name='experience'
                      type='number'
                      value={formData.experience}
                      onChange={handleInputChange}
                      placeholder='e.g., 5'
                      min='0'
                      required
                    />
                  </div>
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='cropsGrown'>Crops Grown *</Label>
                  <Input
                    id='cropsGrown'
                    name='cropsGrown'
                    value={formData.cropsGrown}
                    onChange={handleInputChange}
                    placeholder='e.g., Tomatoes, Corn, Lettuce (comma separated)'
                    required
                  />
                  <p className='text-sm text-gray-500'>
                    List the main crops you grow, separated by commas
                  </p>
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='contactPhone'>Contact Phone *</Label>
                  <Input
                    id='contactPhone'
                    name='contactPhone'
                    type='tel'
                    value={formData.contactPhone}
                    onChange={handleInputChange}
                    placeholder='e.g., +1-555-123-4567'
                    required
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='description'>Farm Description *</Label>
                  <Textarea
                    id='description'
                    name='description'
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder='Tell us about your farming practices, certifications, and what makes your farm special...'
                    rows={4}
                    required
                  />
                </div>

                <Button
                  type='submit'
                  className='w-full bg-agronetGreen hover:bg-green-600'
                  disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                      Submitting Application...
                    </>
                  ) : (
                    'Submit Application'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}
