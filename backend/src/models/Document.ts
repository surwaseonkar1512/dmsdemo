import mongoose, { Schema, Document as MongooseDocument } from 'mongoose';

export interface IDocument extends MongooseDocument {
  organizationId: mongoose.Types.ObjectId;
  folderId: mongoose.Types.ObjectId;
  fileName: string;
  originalFileName: string;
  storagePath: string;
  fileSize: number;
  mimeType: string;
  uploadedBy: mongoose.Types.ObjectId;
  uploadedDate: Date;
  pageCount: number;
  checksum: string;
  searchText: string;
  status: 'Active' | 'Deleted';
  createdAt: Date;
  updatedAt: Date;
}

const DocumentSchema: Schema = new Schema(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
    folderId: { type: Schema.Types.ObjectId, ref: 'Folder', required: true },
    fileName: { type: String, required: true },
    originalFileName: { type: String, required: true },
    storagePath: { type: String, required: true },
    fileSize: { type: Number, required: true },
    mimeType: { type: String, required: true },
    uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    uploadedDate: { type: Date, default: Date.now },
    pageCount: { type: Number, default: 0 },
    checksum: { type: String, required: true },
    searchText: { type: String },
    status: { type: String, enum: ['Active', 'Deleted'], default: 'Active' },
  },
  { timestamps: true }
);

// Prevent duplicate files in the same organization
DocumentSchema.index({ organizationId: 1, checksum: 1 }, { unique: true });

// Full-text search index
DocumentSchema.index({ searchText: 'text' });

export const Document = mongoose.model<IDocument>('Document', DocumentSchema);
