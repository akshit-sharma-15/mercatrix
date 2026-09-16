import { z } from 'zod';

export const addressSchema = z.object({
  name: z.string().trim().min(2, 'Full name must be at least 2 characters').max(100),
  phone: z.string().trim().regex(/^[6-9]\d{9}$/, 'Please enter a valid 10-digit mobile number'),
  alternatePhone: z.string().trim().regex(/^[6-9]\d{9}$/, 'Please enter a valid 10-digit alternate phone number').optional().nullable().or(z.literal('')),
  pincode: z.string().trim().regex(/^\d{6}$/, 'Please enter a valid 6-digit PIN code'),
  locality: z.string().trim().min(2, 'Locality / Area / Colony is required'),
  street: z.string().trim().min(3, 'Address (Flat / House No. / Building / Street) is required'),
  city: z.string().trim().min(2, 'City / District / Town is required'),
  state: z.string().trim().min(2, 'State is required'),
  landmark: z.string().trim().optional().nullable().or(z.literal('')),
  addressType: z.enum(['HOME', 'WORK']).default('HOME'),
  isDefault: z.boolean().optional().default(false),
  saveAddress: z.boolean().optional().default(true),
});

export const updateAddressSchema = addressSchema.partial();

export type AddressInput = z.infer<typeof addressSchema>;
export type UpdateAddressInput = z.infer<typeof updateAddressSchema>;
