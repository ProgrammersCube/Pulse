import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import Admin from '../models/admin.model';

export interface AdminRequest extends Request {
  admin?: any;
}

export const adminAuth = async (
  req: AdminRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      res.status(401).json({ success: false, message: 'No token provided' });
      return;
    }
    if (!process.env.JWT_SECRET) {
      res.status(401).json({ success: false, message: 'JWT_SECRET must be defined in .env file' });
      return;
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET ) as any;
    const admin = await Admin.findById(decoded.id).select('-password');
    
    if (!admin || !admin.isActive) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }
    
    req.admin = admin;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
};