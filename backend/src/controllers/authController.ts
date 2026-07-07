import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import { User } from '../models/User';
import { Organization } from '../models/Organization';
import { Role } from '../models/Role';
import { generateTokens, verifyRefreshToken } from '../utils/jwt';
import { AuditLog } from '../models/AuditLog';

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'Invalid credentials or inactive account' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const tokens = generateTokens({
      userId: user._id.toString(),
      organizationId: user.organizationId.toString(),
      roleId: user.roleId.toString()
    });

    user.refreshToken = tokens.refreshToken;
    await user.save();

    await AuditLog.create({
      organizationId: user.organizationId,
      userId: user._id,
      action: 'Login',
      ipAddress: req.ip
    });

    res.json(tokens);
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(401).json({ message: 'Refresh token required' });

    const payload = verifyRefreshToken(token);
    const user = await User.findById(payload.userId);

    if (!user || user.refreshToken !== token) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    const tokens = generateTokens({
      userId: user._id.toString(),
      organizationId: user.organizationId.toString(),
      roleId: user.roleId.toString()
    });

    user.refreshToken = tokens.refreshToken;
    await user.save();

    res.json(tokens);
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired refresh token' });
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.body; // In real app, extract from authenticated request, but for simplicity we assume client sends it or we get from req.user
    const user = await User.findById(userId);
    if (user) {
      user.refreshToken = undefined;
      await user.save();

      await AuditLog.create({
        organizationId: user.organizationId,
        userId: user._id,
        action: 'Logout',
        ipAddress: req.ip
      });
    }
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

export const seedAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgCount = await Organization.countDocuments();
    if (orgCount > 0) {
      return res.status(400).json({ message: 'System already seeded' });
    }

    const org = await Organization.create({ name: 'Default Organization' });

    const role = await Role.create({
      organizationId: org._id,
      name: 'Admin',
      permissions: ['All']
    });

    const passwordHash = await bcrypt.hash('admin123', 10);

    const user = await User.create({
      organizationId: org._id,
      roleId: role._id,
      name: 'Super Admin',
      email: 'admin@example.com',
      passwordHash
    });

    res.json({ message: 'Admin seeded successfully', email: 'admin@example.com', password: 'admin123' });
  } catch (error) {
    next(error);
  }
};
