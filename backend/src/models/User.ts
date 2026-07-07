import mongoose, { Schema, Document as MongooseDocument } from 'mongoose';

export interface IUser extends MongooseDocument {
  organizationId: mongoose.Types.ObjectId;
  roleId: mongoose.Types.ObjectId;
  name: string;
  email: string;
  passwordHash: string;
  refreshToken?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
    roleId: { type: Schema.Types.ObjectId, ref: 'Role', required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    passwordHash: { type: String, required: true },
    refreshToken: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Ensure unique email across the system (or per organization, assuming global uniqueness for login simplicity)
UserSchema.index({ email: 1 }, { unique: true });

export const User = mongoose.model<IUser>('User', UserSchema);
