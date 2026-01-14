import { Request, Response, NextFunction } from 'express';
import { auth } from '../config/firebase';
import { User } from '../models/User';

// Extend Request interface to include user
export interface AuthRequest extends Request {
  user?: any;
}

/**
 * Firebase Authentication Middleware
 * Verifies Firebase ID token and attaches user to request
 */
export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      res.status(401).json({ 
        success: false, 
        message: 'Access token required' 
      });
      return;
    }

    // Verify Firebase ID token
    const decodedToken = await auth.verifyIdToken(token);
    
    // Get user from database
    const user = await User.findOne({ firebaseUid: decodedToken.uid });
    
    if (!user) {
      res.status(401).json({ 
        success: false, 
        message: 'User not found in database' 
      });
      return;
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ 
      success: false, 
      message: 'Invalid or expired token' 
    });
  }
};

/**
 * Role-based Authorization Middleware
 * Checks if user has required role
 */
export const authorize = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ 
        success: false, 
        message: 'Insufficient permissions' 
      });
      return;
    }

    next();
  };
};

/**
 * Optional Authentication Middleware
 * Attaches user if token exists, but doesn't require it
 */
export const optionalAuth = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decodedToken = await auth.verifyIdToken(token);
      const user = await User.findOne({ firebaseUid: decodedToken.uid });
      req.user = user;
    }
    
    next();
  } catch (error) {
    // Optional auth - continue even if token is invalid
    next();
  }
};
