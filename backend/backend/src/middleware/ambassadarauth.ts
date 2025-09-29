import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import Ambassador from '../models/ambassador.model';

export interface AmbassadorRequest extends Request {
  ambassador?: any;
}

export const ambassadorAuth = async (
  req: AmbassadorRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      res.status(401).json({ success: false, message: 'No token provided' });
      return;
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any;
    const ambassador = await Ambassador.findById(decoded.id);
    
    if (!ambassador || !ambassador.isActive) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }
    
    req.ambassador = ambassador;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
};
