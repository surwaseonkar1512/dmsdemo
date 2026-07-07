import mongoose, { Schema, Document as MongooseDocument } from 'mongoose';

export interface IAuditLog extends MongooseDocument {
  organizationId: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId; // Optional because e.g., login failure might not have full user context
  action: string;
  entityType?: string; // Folder, Document, User
  entityId?: mongoose.Types.ObjectId;
  ipAddress?: string;
  timestamp: Date;
}

const AuditLogSchema: Schema = new Schema(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    action: { type: String, required: true },
    entityType: { type: String },
    entityId: { type: Schema.Types.ObjectId },
    ipAddress: { type: String },
    timestamp: { type: Date, default: Date.now },
  }
);

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
