import mongoose, { Schema, Document as MongooseDocument } from 'mongoose';

export interface IRole extends MongooseDocument {
  organizationId: mongoose.Types.ObjectId;
  name: string; // e.g., Admin, Manager, Employee, Viewer
  permissions: string[];
}

const RoleSchema: Schema = new Schema(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
    name: { type: String, required: true },
    permissions: [{ type: String }],
  },
  { timestamps: true }
);

// Ensure unique role names per organization
RoleSchema.index({ organizationId: 1, name: 1 }, { unique: true });

export const Role = mongoose.model<IRole>('Role', RoleSchema);
