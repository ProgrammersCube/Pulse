import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/user.model';

export interface PulseUserRequest extends Request {
  user?: any;
}

export const pulseUserAuth = async (
  req: PulseUserRequest,
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
    console.log('Decoded token:', decoded);
    
    const user = await User.findById(decoded.id).select('-password');
    console.log('User found in middleware:', user ? { id: user._id, walletAddress: user.walletAddress, wallets: user.wallets } : 'No user found');
    
    if (!user) {
      res.status(401).json({ success: false, message: 'User not found' });
      return;
    }
    
    req.user = user;
    next();
  } catch (error) {
    console.error('Middleware error:', error);
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
};
