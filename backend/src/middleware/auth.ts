import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-default-key-for-dev';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
    status: string;
  };
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

export const requireApproved = (req: AuthRequest, res: Response, next: NextFunction) => {
  // Admins are always allowed
  if (req.user?.role === 'ADMIN') {
    return next();
  }
  
  if (req.user?.status !== 'APPROVED') {
    return res.status(403).json({ message: 'Account pending approval by admin' });
  }
  next();
};
