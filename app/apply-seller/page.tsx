"use client"

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { useFarmerApplicationsApi } from '@/hooks/use-farmer-applications-api';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Button } from "@/components/ui/button"
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
import { useToast } from "@/hooks/use-toast"
import { motion } from 'framer-motion';

export default function ApplySellerPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const { createApplication, loading: apiLoading } = useFarmerApplicationsApi();

  const [formData, setFormData] = useState({
    businessName: '',
    businessAddress: '',
    businessPhone: '',
    businessEmail: '',
    businessDescription: '',
    certifications: '',
    experience: '',
    products: '',
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
        businessName: formData.businessName,
        businessAddress: formData.businessAddress,
        businessPhone: formData.businessPhone,
        businessEmail: formData.businessEmail,
        businessDescription: formData.businessDescription,
        certifications: formData.certifications,
        experience: formData.experience,
        products: formData.products,
      };

      const result = await createApplication(applicationData);

      if (result) {
        setSubmitted(true);
        toast({
          title: 'Application Submitted!',
          description:
            "Your farmer application has been submitted successfully. We'll review it and get back to you soon.",
        });
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
                    <Label htmlFor='businessName'>Business Name *</Label>
                    <Input
                      id='businessName'
                      name='businessName'
                      value={formData.businessName}
                      onChange={handleInputChange}
                      placeholder='Enter your business name'
                      required
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='businessPhone'>Business Phone *</Label>
                    <Input
                      id='businessPhone'
                      name='businessPhone'
                      type='tel'
                      value={formData.businessPhone}
                      onChange={handleInputChange}
                      placeholder='e.g., +1-555-123-4567'
                      required
                    />
                  </div>
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='businessAddress'>Business Address *</Label>
                  <Input
                    id='businessAddress'
                    name='businessAddress'
                    value={formData.businessAddress}
                    onChange={handleInputChange}
                    placeholder='Complete business address'
                    required
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='businessEmail'>Business Email *</Label>
                  <Input
                    id='businessEmail'
                    name='businessEmail'
                    type='email'
                    value={formData.businessEmail}
                    onChange={handleInputChange}
                    placeholder='business@example.com'
                    required
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='businessDescription'>
                    Business Description *
                  </Label>
                  <Textarea
                    id='businessDescription'
                    name='businessDescription'
                    value={formData.businessDescription}
                    onChange={handleInputChange}
                    placeholder='Tell us about your farming business, practices, and operations...'
                    rows={4}
                    required
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='products'>Products/Crops *</Label>
                  <Textarea
                    id='products'
                    name='products'
                    value={formData.products}
                    onChange={handleInputChange}
                    placeholder='List the products/crops you grow and sell...'
                    rows={3}
                    required
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='experience'>Experience</Label>
                  <Textarea
                    id='experience'
                    name='experience'
                    value={formData.experience}
                    onChange={handleInputChange}
                    placeholder='Describe your farming experience and background...'
                    rows={3}
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='certifications'>Certifications</Label>
                  <Textarea
                    id='certifications'
                    name='certifications'
                    value={formData.certifications}
                    onChange={handleInputChange}
                    placeholder='List any relevant certifications (organic, fair trade, etc.)...'
                    rows={2}
                  />
                </div>

                <Button
                  type='submit'
                  className='w-full bg-agronetGreen hover:bg-green-600'
                  disabled={loading || apiLoading}>
                  {loading || apiLoading ? (
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
