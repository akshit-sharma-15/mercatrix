import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, TokenPayload } from '../utils/jwt';
import { prisma } from '../config/db';

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

export const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.cookies.accessToken || req.headers.authorization?.split(' ')[1];

    if (!token) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const payload = verifyAccessToken(token);
    req.user = payload;

    // Check if user is blocked (immediate block enforcement)
    if (payload.role === 'VENDOR') {
      const vendorProfile = await prisma.vendorProfile.findUnique({
        where: { user_id: payload.userId }
      });
      if (vendorProfile?.is_blocked) {
        res.status(403).json({ message: 'Vendor account is blocked', reason: vendorProfile.block_reason });
        return;
      }
    }

    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};
