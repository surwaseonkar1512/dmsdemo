import mongoose, { Schema, Document as MongooseDocument } from 'mongoose';

export interface IFolder extends MongooseDocument {
  organizationId: mongoose.Types.ObjectId;
  name: string;
  parentId: mongoose.Types.ObjectId | null;
  path: string; // The physical path part or materialized path
  createdAt: Date;
  updatedAt: Date;
}

const FolderSchema: Schema = new Schema(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
    name: { type: String, required: true },
    parentId: { type: Schema.Types.ObjectId, ref: 'Folder', default: null },
    path: { type: String, required: true },
  },
  { timestamps: true }
);

// Compound index to ensure folder names are unique within the same parent folder
FolderSchema.index({ organizationId: 1, parentId: 1, name: 1 }, { unique: true });

export const Folder = mongoose.model<IFolder>('Folder', FolderSchema);
