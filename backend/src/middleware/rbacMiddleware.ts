import { Response, NextFunction } from 'express';
import { AuthRequest } from './authMiddleware';
import { Role } from '../models/Role';

export const authorize = (requiredPermissions: string[]) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      const role = await Role.findById(req.user.roleId);
      if (!role) {
        return res.status(403).json({ message: 'Role not found' });
      }

      // If user has 'Admin' implicitly allow all, or explicitly check permissions
      const hasPermission = requiredPermissions.every(perm => role.permissions.includes(perm));
      
      if (!hasPermission && !role.permissions.includes('All')) {
         return res.status(403).json({ message: 'Insufficient permissions' });
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
