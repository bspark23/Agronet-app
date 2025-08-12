"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { useProducts } from '@/hooks/use-products-api';
import type { Product } from "@/lib/types"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { motion } from "framer-motion"
import Image from "next/image"
import { Loader2 } from "lucide-react"

export default function PostProductPage() {
  const {
    user,
    isAuthenticated,
    isSeller,
    isAdmin,
    isLoading: authLoading,
  } = useAuth();
  const { products, createProduct, updateProduct, getProduct } = useProducts();
  const router = useRouter()
  const searchParams = useSearchParams()
  const productIdToEdit = searchParams.get("id")
  const { toast } = useToast()

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [quantity, setQuantity] = useState("")
  const [image, setImage] = useState('');
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      if (authLoading) return;

      if (!isAuthenticated || (!isSeller && !isAdmin)) {
        router.push('/login');
        toast({
          title: 'Access Denied',
          description: 'You must be a seller or admin to post products.',
          variant: 'destructive',
        });
        return;
      }

      if (productIdToEdit) {
        try {
          const product = await getProduct(productIdToEdit);
          if (product && (product.farmerId === user?._id || isAdmin)) {
            setName(product.name);
            setDescription(product.description);
            setPrice(product.price.toString());
            setQuantity(product.quantity.toString());
            setImage(product.images[0] || '');
            setIsEditing(true);
          } else {
            toast({
              title: 'Product Not Found or Unauthorized',
              description: 'You cannot edit this product.',
              variant: 'destructive',
            });
            router.push('/dashboard/seller');
          }
        } catch (error) {
          console.error('Error loading product for editing:', error);
          toast({
            title: 'Error',
            description: 'Failed to load product for editing.',
            variant: 'destructive',
          });
          router.push('/dashboard/seller');
        }
      }

      setLoading(false);
    };

    loadData();
  }, [
    isAuthenticated,
    isSeller,
    isAdmin,
    user,
    productIdToEdit,
    authLoading,
    router,
    toast,
  ]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: 'Error',
        description: 'User not found. Please log in again.',
        variant: 'destructive',
      });
      return;
    }

    const productData = {
      farmerId: user._id,
      name,
      description,
      price: Number.parseFloat(price),
      quantity: Number.parseInt(quantity),
      images: image ? [image] : [],
      location: {
        type: 'Point' as const,
        coordinates: [0, 0] as [number, number], // TODO: Get actual coordinates
      },
    };

    try {
      if (isEditing && productIdToEdit) {
        const result = await updateProduct(productIdToEdit, productData);
        if (result.success) {
          toast({
            title: 'Product Updated!',
            description: 'Your product has been successfully updated.',
            variant: 'default',
          });
          router.push('/dashboard/seller');
        } else {
          toast({
            title: 'Error',
            description: result.error || 'Failed to update product.',
            variant: 'destructive',
          });
        }
      } else {
        const result = await createProduct(productData);
        if (result.success) {
          toast({
            title: 'Product Posted!',
            description: 'Your product is now live on the marketplace.',
            variant: 'default',
          });
          router.push('/dashboard/seller');
        } else {
          toast({
            title: 'Error',
            description: result.error || 'Failed to create product.',
            variant: 'destructive',
          });
        }
      }
    } catch (error) {
      console.error('Error submitting product:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-agronetGreen" />
      </div>
    )
  }

  if (!isAuthenticated || (!isSeller && !isAdmin)) {
    return null // Should be redirected by useEffect
  }

  return (
    <div className='flex flex-col min-h-screen'>
      <Navbar />
      <main className='flex-1 flex items-center justify-center bg-agronetGreen-50 p-4'>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className='w-full max-w-2xl rounded-lg bg-white p-8 shadow-lg'>
          <h1 className='mb-6 text-center text-3xl font-bold text-agronetGreen'>
            {isEditing ? 'Edit Product' : 'Post New Product'}
          </h1>
          <form onSubmit={handleSubmit} className='space-y-4'>
            <div>
              <Label htmlFor='name'>Product Name</Label>
              <Input
                id='name'
                type='text'
                placeholder='e.g., Organic Tomatoes'
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor='description'>Description</Label>
              <Textarea
                id='description'
                placeholder='Detailed description of your product...'
                value={description}
                onChange={e => setDescription(e.target.value)}
                required
                rows={5}
              />
            </div>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <Label htmlFor='price'>Price ($)</Label>
                <Input
                  id='price'
                  type='number'
                  step='0.01'
                  placeholder='e.g., 3.99'
                  value={price}
                  onChange={e => setPrice(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor='quantity'>Quantity</Label>
                <Input
                  id='quantity'
                  type='number'
                  placeholder='e.g., 100'
                  value={quantity}
                  onChange={e => setQuantity(e.target.value)}
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor='image'>Product Image</Label>
              <Input
                id='image'
                type='file'
                accept='image/*'
                onChange={handleImageUpload}
                className='mb-2'
              />
              {image && (
                <div className='relative w-32 h-32 rounded-md overflow-hidden border'>
                  <Image
                    src={image || '/placeholder.svg'}
                    alt='Product Preview'
                    fill
                    style={{ objectFit: 'cover' }}
                  />
                </div>
              )}
              <p className='text-sm text-gray-500 mt-2'>
                {isEditing
                  ? 'Upload a new image to replace the current one, or leave blank to keep.'
                  : 'Upload an image for your product.'}
              </p>
            </div>
            <Button
              type='submit'
              className='w-full bg-agronetOrange hover:bg-agronetOrange/90 text-white'>
              {isEditing ? 'Update Product' : 'Post Product'}
            </Button>
          </form>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}
