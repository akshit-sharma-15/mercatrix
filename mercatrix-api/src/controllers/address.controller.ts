import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/db';
import { addressSchema, updateAddressSchema } from '../schemas/address.schema';

export const getAddresses = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const addresses = await prisma.address.findMany({
      where: { user_id: userId },
      orderBy: [
        { is_default: 'desc' },
        { created_at: 'desc' } as any
      ]
    });

    res.json(addresses);
  } catch (error) {
    next(error);
  }
};

export const getAddressById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const id = req.params.id as string;

    if (!userId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const address = await prisma.address.findFirst({
      where: { id, user_id: userId }
    });

    if (!address) {
      res.status(404).json({ error: 'Address not found' });
      return;
    }

    res.json(address);
  } catch (error) {
    next(error);
  }
};

export const createAddress = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const validatedData = addressSchema.parse(req.body);

    const result = await prisma.$transaction(async (tx: any) => {
      // If marked default, unset existing default
      if (validatedData.isDefault) {
        await tx.address.updateMany({
          where: { user_id: userId, is_default: true },
          data: { is_default: false }
        });
      }

      // Check if this is the user's first address
      const existingCount = await tx.address.count({ where: { user_id: userId } });
      const shouldBeDefault = validatedData.isDefault || existingCount === 0;

      return tx.address.create({
        data: {
          user_id: userId,
          name: validatedData.name,
          phone: validatedData.phone,
          alternate_phone: validatedData.alternatePhone || null,
          pincode: validatedData.pincode,
          locality: validatedData.locality,
          street: validatedData.street,
          city: validatedData.city,
          state: validatedData.state,
          landmark: validatedData.landmark || null,
          address_type: validatedData.addressType,
          is_default: shouldBeDefault,
        }
      });
    });

    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

export const updateAddress = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const id = req.params.id as string;

    if (!userId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const existingAddress = await prisma.address.findFirst({
      where: { id, user_id: userId }
    });

    if (!existingAddress) {
      res.status(404).json({ error: 'Address not found' });
      return;
    }

    const validatedData = updateAddressSchema.parse(req.body);

    const updated = await prisma.$transaction(async (tx: any) => {
      if (validatedData.isDefault) {
        await tx.address.updateMany({
          where: { user_id: userId, is_default: true },
          data: { is_default: false }
        });
      }

      return tx.address.update({
        where: { id },
        data: {
          name: validatedData.name ?? existingAddress.name,
          phone: validatedData.phone ?? existingAddress.phone,
          alternate_phone: validatedData.alternatePhone !== undefined ? (validatedData.alternatePhone || null) : existingAddress.alternate_phone,
          pincode: validatedData.pincode ?? existingAddress.pincode,
          locality: validatedData.locality ?? existingAddress.locality,
          street: validatedData.street ?? existingAddress.street,
          city: validatedData.city ?? existingAddress.city,
          state: validatedData.state ?? existingAddress.state,
          landmark: validatedData.landmark !== undefined ? (validatedData.landmark || null) : existingAddress.landmark,
          address_type: validatedData.addressType ?? existingAddress.address_type,
          is_default: validatedData.isDefault ?? existingAddress.is_default,
        }
      });
    });

    res.json(updated);
  } catch (error) {
    next(error);
  }
};

export const deleteAddress = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const id = req.params.id as string;

    if (!userId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const existingAddress = await prisma.address.findFirst({
      where: { id, user_id: userId }
    });

    if (!existingAddress) {
      res.status(404).json({ error: 'Address not found' });
      return;
    }

    await prisma.address.delete({
      where: { id }
    });

    res.json({ message: 'Address deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const setDefaultAddress = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const id = req.params.id as string;

    if (!userId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const existingAddress = await prisma.address.findFirst({
      where: { id, user_id: userId }
    });

    if (!existingAddress) {
      res.status(404).json({ error: 'Address not found' });
      return;
    }

    await prisma.$transaction(async (tx: any) => {
      await tx.address.updateMany({
        where: { user_id: userId },
        data: { is_default: false }
      });
      await tx.address.update({
        where: { id },
        data: { is_default: true }
      });
    });

    res.json({ message: 'Default address updated successfully' });
  } catch (error) {
    next(error);
  }
};
