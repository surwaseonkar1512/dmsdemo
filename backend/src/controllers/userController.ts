import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import { User } from '../models/User';
import { AuthRequest } from '../middleware/authMiddleware';

export const getUsers = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const users = await User.find({ organizationId: req.user!.organizationId })
      .select('-passwordHash -refreshToken')
      .populate('roleId', 'name permissions');
    res.json(users);
  } catch (error) {
    next(error);
  }
};

export const createUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { name, email, password, roleId } = req.body;
    
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    
    const user = await User.create({
      organizationId: req.user!.organizationId,
      name,
      email,
      passwordHash,
      roleId
    });

    res.status(201).json({ message: 'User created successfully', userId: user._id });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { name, isActive, roleId } = req.body;
    
    const user = await User.findOneAndUpdate(
      { _id: id, organizationId: req.user!.organizationId },
      { name, isActive, roleId },
      { new: true }
    ).select('-passwordHash -refreshToken');

    if (!user) return res.status(404).json({ message: 'User not found' });
    
    res.json(user);
  } catch (error) {
    next(error);
  }
};

// Usually, in enterprise apps, users are disabled instead of deleted, but here is delete.
export const deleteUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    if (id === req.user!.userId) {
      return res.status(400).json({ message: 'Cannot delete yourself' });
    }

    const user = await User.findOneAndDelete({ _id: id, organizationId: req.user!.organizationId });
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
};
