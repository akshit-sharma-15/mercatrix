import { Request, Response } from 'express';
import { prisma } from '../config/db';

export const getProducts = async (req: Request, res: Response) => {
  try {
    const { category } = req.query;
    
    const whereClause = category ? {
      category: {
        name: String(category)
      }
    } : {};

    const products: any[] = await prisma.product.findMany({
      where: whereClause,
      include: {
        vendor: true,
        category: true,
        variants: true,
        images: true,
      }
    });

    // Map Prisma models to the format expected by the frontend
    const mappedProducts = products.map((product: any) => ({
      id: product.id,
      vendorId: product.vendor_id,
      categoryId: product.category_id,
      title: product.title,
      description: product.description,
      basePrice: Number(product.base_price),
      averageRating: Number(product.average_rating),
      imageUrl: product.images?.[0]?.image_url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
      vendorName: product.vendor?.business_name || 'Mercatrix Vendor',
      categoryName: product.category?.name || 'Uncategorized',
    }));

    res.json(mappedProducts);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const product: any = await prisma.product.findUnique({
      where: { id },
      include: {
        vendor: true,
        category: true,
        variants: true,
        images: true,
      }
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({
      id: product.id,
      vendorId: product.vendor_id,
      categoryId: product.category_id,
      title: product.title,
      description: product.description,
      basePrice: Number(product.base_price),
      averageRating: Number(product.average_rating),
      imageUrl: product.images?.[0]?.image_url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
      vendorName: product.vendor?.business_name || 'Mercatrix Vendor',
      categoryName: product.category?.name || 'Uncategorized',
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
};

export const getProductVariants = async (req: Request, res: Response) => {
  try {
    const productId = req.params.productId as string;
    const variants: any[] = await prisma.productVariant.findMany({
      where: { product_id: productId },
    });

    const mappedVariants = variants.map((variant: any) => ({
      id: variant.id,
      productId: variant.product_id,
      sku: variant.sku,
      attributes: variant.attributes,
      price: Number(variant.price),
      stockQuantity: variant.stock_quantity,
    }));

    res.json(mappedVariants);
  } catch (error) {
    console.error('Error fetching variants:', error);
    res.status(500).json({ error: 'Failed to fetch variants' });
  }
};
