'use client';

import { useState, useEffect } from 'react';
import { productsApi } from '@/lib/api';
import type { Product, CreateProductForm } from '@/lib/types';

export function useProducts() {
  const [products, setProductsState] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load products from API
  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const apiProducts = await productsApi.getProducts();
      setProductsState(apiProducts);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to load products';
      console.warn('Failed to load products from API:', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Create a new product
  const createProduct = async (productData: CreateProductForm) => {
    try {
      setError(null);
      const response = await productsApi.createProduct(productData);

      if (response.success && response.data) {
        const newProduct = response.data;
        setProductsState(prev => [...prev, newProduct]);
        return { success: true, product: newProduct };
      }

      return {
        success: false,
        error: response.error || response.message || 'Failed to create product',
      };
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to create product';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Update a product
  const updateProduct = async (
    id: string,
    updates: Partial<CreateProductForm>,
  ) => {
    try {
      setError(null);
      const response = await productsApi.updateProduct(id, updates);

      if (response.success && response.data) {
        const updatedProduct = response.data;
        setProductsState(prev =>
          prev.map(product => (product._id === id ? updatedProduct : product)),
        );
        return { success: true, product: updatedProduct };
      }

      return {
        success: false,
        error: response.error || response.message || 'Failed to update product',
      };
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to update product';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Delete a product
  const deleteProduct = async (id: string) => {
    try {
      setError(null);
      const response = await productsApi.deleteProduct(id);

      if (response.success) {
        setProductsState(prev => prev.filter(product => product._id !== id));
        return { success: true };
      }

      return {
        success: false,
        error: response.error || response.message || 'Failed to delete product',
      };
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to delete product';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Get a single product
  const getProduct = async (id: string) => {
    try {
      setError(null);
      return await productsApi.getProduct(id);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to get product';
      setError(errorMessage);
      throw err;
    }
  };

  // Get products by farmer
  const getProductsByFarmer = (farmerId: string) => {
    return products.filter(product => product.farmerId === farmerId);
  };

  // Search products
  const searchProducts = (query: string) => {
    const lowercaseQuery = query.toLowerCase();
    return products.filter(
      product =>
        product.name.toLowerCase().includes(lowercaseQuery) ||
        product.description.toLowerCase().includes(lowercaseQuery),
    );
  };

  // Filter products by price range
  const filterProductsByPrice = (minPrice: number, maxPrice: number) => {
    return products.filter(
      product => product.price >= minPrice && product.price <= maxPrice,
    );
  };

  // Sort products
  const sortProducts = (
    sortBy: 'name' | 'price' | 'rating' | 'date',
    order: 'asc' | 'desc' = 'asc',
  ) => {
    const sorted = [...products].sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'price':
          aValue = a.price;
          bValue = b.price;
          break;
        case 'rating':
          aValue = a.ratingsAverage;
          bValue = b.ratingsAverage;
          break;
        case 'date':
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        default:
          return 0;
      }

      if (order === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return sorted;
  };

  // Load products on mount
  useEffect(() => {
    loadProducts();
  }, []);

  return {
    products,
    loading,
    error,
    loadProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    getProduct,
    getProductsByFarmer,
    searchProducts,
    filterProductsByPrice,
    sortProducts,
  };
}
