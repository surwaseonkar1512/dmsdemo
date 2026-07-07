import mongoose, { Schema, Document as MongooseDocument } from 'mongoose';

export interface IOrganization extends MongooseDocument {
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrganizationSchema: Schema = new Schema(
  {
    name: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

export const Organization = mongoose.model<IOrganization>('Organization', OrganizationSchema);
