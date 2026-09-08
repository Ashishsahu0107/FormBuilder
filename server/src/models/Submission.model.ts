import { Schema, model, Document } from 'mongoose'

export interface ISubmission extends Document {
  formId: string
  formSlug: string
  referenceNumber: string
  data: Record<string, unknown>
  metadata: {
    ipAddress?: string
    userAgent?: string
    submittedAt: Date
  }
  status: 'pending' | 'reviewed' | 'approved' | 'rejected'
  createdAt: Date
  updatedAt: Date
}

const SubmissionSchema = new Schema<ISubmission>(
  {
    formId: { type: String, required: true, index: true },
    formSlug: { type: String, required: true, index: true },
    referenceNumber: { type: String, required: true, unique: true, index: true },
    data: { type: Schema.Types.Mixed, required: true },
    metadata: {
      ipAddress: { type: String },
      userAgent: { type: String },
      submittedAt: { type: Date, default: Date.now },
    },
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'approved', 'rejected'],
      default: 'pending',
    },
  },
  { timestamps: true }
)

export const Submission = model<ISubmission>('Submission', SubmissionSchema)
