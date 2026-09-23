import mongoose, { Schema, Document } from 'mongoose'
import { v4 as uuidv4 } from 'uuid'

export interface IFormApproval {
  _id: string
  formId: string
  versionId: string
  action: string
  comment?: string
  by: string
  createdAt: Date
}

const formApprovalSchema = new Schema<IFormApproval>({
  _id: { type: String, default: () => uuidv4() },
  formId: { type: String, ref: 'Form', required: true },
  versionId: { type: String, ref: 'FormVersion', required: true },
  action: { type: String, required: true },
  comment: { type: String },
  by: { type: String, ref: 'User', required: true }
}, {
  timestamps: { createdAt: true, updatedAt: false },
  toJSON: {
    virtuals: true,
    versionKey: false,
    transform: (doc: any, ret: any) => {
      ret.id = ret._id
      delete ret._id
    }
  }
})

export const FormApproval = mongoose.model<IFormApproval>('FormApproval', formApprovalSchema)