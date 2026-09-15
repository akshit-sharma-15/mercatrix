import axios from 'axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export interface Address {
  id: string;
  name: string;
  phone: string;
  alternate_phone?: string | null;
  pincode: string;
  locality?: string | null;
  street: string;
  city: string;
  state: string;
  landmark?: string | null;
  address_type: 'HOME' | 'WORK';
  is_default: boolean;
}

export interface NewAddressInput {
  name: string;
  phone: string;
  alternatePhone?: string;
  pincode: string;
  locality: string;
  street: string;
  city: string;
  state: string;
  landmark?: string;
  addressType: 'HOME' | 'WORK';
  saveAddress?: boolean;
}

export interface OrderItem {
  variantId: string;
  quantity: number;
  price: number;
}

export interface CheckoutRequest {
  items?: OrderItem[];
  addressId?: string;
  newAddress?: NewAddressInput;
}

export interface CheckoutResponse {
  orderId: string;
  razorpayOrderId: string;
  amount: number;
  currency: string;
  shippingAddress: any;
}

export interface CheckoutSummaryResponse {
  items: Array<{
    variantId: string;
    productId: string;
    title: string;
    attributes: any;
    unitPrice: number;
    quantity: number;
    subtotal: number;
    imageUrl: string | null;
    vendorName: string;
    availableStock: number;
    isOutOfStock: boolean;
    isInsufficientStock: boolean;
  }>;
  summary: {
    totalItems: number;
    itemsTotal: number;
    shippingFee: number;
    freeShippingEligible: boolean;
    amountToFreeShipping: number;
    totalPayable: number;
    canProceedToPayment: boolean;
  };
}

export const fetchAddresses = async (): Promise<Address[]> => {
  const { data } = await axios.get(`${API_URL}/customer/addresses`, {
    withCredentials: true,
  });
  return data;
};

export const createAddress = async (newAddress: NewAddressInput): Promise<Address> => {
  const { data } = await axios.post(`${API_URL}/customer/addresses`, newAddress, {
    withCredentials: true,
  });
  return data;
};

export const fetchCheckoutSummary = async (items: OrderItem[]): Promise<CheckoutSummaryResponse> => {
  const { data } = await axios.post(
    `${API_URL}/checkout/summary`,
    { items },
    { withCredentials: true }
  );
  return data;
};

export const initializeCheckout = async (data: CheckoutRequest): Promise<CheckoutResponse> => {
  const { data: responseData } = await axios.post(`${API_URL}/checkout`, data, {
    withCredentials: true,
  });
  return responseData;
};

export const verifyPayment = async (data: {
  orderId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature?: string;
}) => {
  const { data: responseData } = await axios.post(`${API_URL}/checkout/verify`, data, {
    withCredentials: true,
  });
  return responseData;
};

export const deleteAddress = async (id: string): Promise<{ message: string }> => {
  const { data } = await axios.delete(`${API_URL}/customer/addresses/${id}`, {
    withCredentials: true,
  });
  return data;
};

export const setDefaultAddress = async (id: string): Promise<Address> => {
  const { data } = await axios.patch(`${API_URL}/customer/addresses/${id}/default`, {}, {
    withCredentials: true,
  });
  return data;
};

export const fetchCustomerOrders = async (): Promise<any[]> => {
  const { data } = await axios.get(`${API_URL}/customer/orders`, {
    withCredentials: true,
  });
  return data;
};

export const useAddresses = () => {
  return useQuery({
    queryKey: ['customer-addresses'],
    queryFn: fetchAddresses,
    retry: 1,
  });
};

export const useCreateAddress = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createAddress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-addresses'] });
    },
  });
};

export const useDeleteAddress = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteAddress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-addresses'] });
    },
  });
};

export const useSetDefaultAddress = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: setDefaultAddress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-addresses'] });
    },
  });
};

export const useCustomerOrders = (options?: { refetchInterval?: number | false }) => {
  return useQuery({
    queryKey: ['customer-orders'],
    queryFn: fetchCustomerOrders,
    retry: 1,
    refetchInterval: options?.refetchInterval !== undefined ? options.refetchInterval : 3000,
    refetchOnWindowFocus: true,
  });
};

export const useCheckout = () => {
  return useMutation({
    mutationFn: initializeCheckout,
  });
};

export const useVerifyPayment = () => {
  return useMutation({
    mutationFn: verifyPayment,
  });
};
