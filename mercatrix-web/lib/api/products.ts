import axios from 'axios';
import { useQuery } from '@tanstack/react-query';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export interface Product {
  id: string;
  vendorId: string;
  categoryId: string;
  title: string;
  description: string;
  basePrice: number;
  averageRating: number;
  imageUrl: string;
  vendorName: string;
  categoryName: string;
}

export interface ProductVariant {
  id: string;
  productId: string;
  sku: string;
  attributes: Record<string, string>;
  price: number;
  stockQuantity: number;
}

export const fetchProducts = async (): Promise<Product[]> => {
  const { data } = await axios.get(`${API_URL}/customer/products`);
  return data;
};

export const fetchProductById = async (id: string): Promise<Product | undefined> => {
  const { data } = await axios.get(`${API_URL}/customer/products/${id}`);
  return data;
};

export const fetchProductVariants = async (productId: string): Promise<ProductVariant[]> => {
  const { data } = await axios.get(`${API_URL}/customer/products/${productId}/variants`);
  return data;
};

export const useProducts = () => {
  return useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
  });
};

export const useProduct = (id: string) => {
  return useQuery({
    queryKey: ['products', id],
    queryFn: () => fetchProductById(id),
    enabled: !!id,
  });
};

export const useProductVariants = (productId: string) => {
  return useQuery({
    queryKey: ['variants', productId],
    queryFn: () => fetchProductVariants(productId),
    enabled: !!productId,
  });
};
