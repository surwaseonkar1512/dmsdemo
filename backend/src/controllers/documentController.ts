import { Request, Response, NextFunction } from 'express';
import { Document as DMSDocument } from '../models/Document';
import { Folder } from '../models/Folder';
import { AuthRequest } from '../middleware/authMiddleware';
import { generateFileChecksum } from '../utils/checksum';
import { saveFileToDisk, deleteFileFromDisk } from '../utils/fileStorage';
import { extractTextFromPDF } from '../utils/pdfReader';
import { AuditLog } from '../models/AuditLog';

export const uploadDocument = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const file = req.file;
    const { folderId } = req.body;
    const organizationId = req.user!.organizationId;

    if (!file) return res.status(400).json({ message: 'No file uploaded' });
    if (!folderId) return res.status(400).json({ message: 'Folder ID is required' });

    const folder = await Folder.findOne({ _id: folderId, organizationId });
    if (!folder) return res.status(404).json({ message: 'Folder not found' });

    // Generate Checksum
    const checksum = await generateFileChecksum(file.path);

    // Duplicate Check
    const existingDoc = await DMSDocument.findOne({ organizationId, checksum });
    if (existingDoc) {
      await deleteFileFromDisk(file.path); // Delete temp file
      return res.status(400).json({ message: 'Duplicate document already exists' });
    }

    // Save physically
    const physicalPath = await saveFileToDisk(file.path, organizationId, folder.path, file.filename);

    // Extract Text (OCR disabled by default for performance, could be passed as flag)
    const enableOcr = req.body.enableOcr === 'true';
    const searchText = await extractTextFromPDF(physicalPath, enableOcr);

    const doc = await DMSDocument.create({
      organizationId,
      folderId,
      fileName: file.filename,
      originalFileName: file.originalname,
      storagePath: physicalPath,
      fileSize: file.size,
      mimeType: file.mimetype,
      uploadedBy: req.user!.userId,
      checksum,
      searchText
    });

    await AuditLog.create({
      organizationId,
      userId: req.user!.userId,
      action: 'Upload',
      entityType: 'Document',
      entityId: doc._id,
      ipAddress: req.ip
    });

    res.status(201).json(doc);
  } catch (error) {
    if (req.file) await deleteFileFromDisk(req.file.path);
    next(error);
  }
};

export const searchDocuments = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { q, folderId, status, page = 1, limit = 20 } = req.query;
    const organizationId = req.user!.organizationId;

    let query: any = { organizationId };

    if (folderId) query.folderId = folderId;
    if (status) query.status = status;
    else query.status = 'Active';

    if (q) {
      query.$text = { $search: q as string };
    }

    const skip = (Number(page) - 1) * Number(limit);

    const docs = await DMSDocument.find(query)
      .sort(q ? { score: { $meta: "textScore" } } : { uploadedDate: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate('uploadedBy', 'name email');

    const total = await DMSDocument.countDocuments(query);

    res.json({
      data: docs,
      total,
      page: Number(page),
      limit: Number(limit),
      pages: Math.ceil(total / Number(limit))
    });
  } catch (error) {
    next(error);
  }
};

export const downloadDocument = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const doc = await DMSDocument.findOne({ _id: id, organizationId: req.user!.organizationId });

    if (!doc) return res.status(404).json({ message: 'Document not found' });

    await AuditLog.create({
      organizationId: req.user!.organizationId,
      userId: req.user!.userId,
      action: 'Download',
      entityType: 'Document',
      entityId: doc._id,
      ipAddress: req.ip
    });

    res.download(doc.storagePath, doc.originalFileName);
  } catch (error) {
    next(error);
  }
};

export const deleteDocument = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const doc = await DMSDocument.findOne({ _id: id, organizationId: req.user!.organizationId });

    if (!doc) return res.status(404).json({ message: 'Document not found' });

    doc.status = 'Deleted';
    await doc.save();

    await AuditLog.create({
      organizationId: req.user!.organizationId,
      userId: req.user!.userId,
      action: 'Delete',
      entityType: 'Document',
      entityId: doc._id,
      ipAddress: req.ip
    });

    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    next(error);
  }
};
