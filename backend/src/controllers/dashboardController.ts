import { Response, NextFunction } from 'express';
import { Document as DMSDocument } from '../models/Document';
import { Folder } from '../models/Folder';
import { User } from '../models/User';
import { Organization } from '../models/Organization';
import { AuthRequest } from '../middleware/authMiddleware';

export const getDashboardStats = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const organizationId = req.user!.organizationId;

    const totalDocuments = await DMSDocument.countDocuments({ organizationId, status: 'Active' });
    const folderCount = await Folder.countDocuments({ organizationId });
    const userCount = await User.countDocuments({ organizationId });
    
    // Calculate storage used
    const docs = await DMSDocument.aggregate([
      { $match: { organizationId, status: 'Active' } },
      { $group: { _id: null, totalSize: { $sum: '$fileSize' } } }
    ]);
    const storageUsed = docs.length > 0 ? docs[0].totalSize : 0;

    // Today's uploads
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const todaysUploads = await DMSDocument.countDocuments({ 
      organizationId, 
      uploadedDate: { $gte: startOfToday } 
    });

    const recentUploads = await DMSDocument.find({ organizationId, status: 'Active' })
      .sort({ uploadedDate: -1 })
      .limit(5)
      .populate('uploadedBy', 'name');

    // System-wide admin stats if needed, but per org is requested:
    // If Admin, they might see organization count, but typically tenants don't see org count.
    // Assuming Super Admin sees all, but let's stick to tenant specific for now.
    
    res.json({
      totalDocuments,
      folderCount,
      userCount,
      storageUsed,
      todaysUploads,
      recentUploads
    });
  } catch (error) {
    next(error);
  }
};
