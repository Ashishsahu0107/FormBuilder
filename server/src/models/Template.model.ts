import mongoose, { Schema, Document } from 'mongoose'
import { v4 as uuidv4 } from 'uuid'

export interface ITemplate {
  _id: string
  title: string
  description?: string
  category: string
  thumbnail?: string
  schema: any
  isPublic: boolean
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

const templateSchema = new Schema<ITemplate>({
  _id: { type: String, default: () => uuidv4() },
  title: { type: String, required: true },
  description: { type: String },
  category: { type: String, required: true },
  thumbnail: { type: String },
  schema: { type: Schema.Types.Mixed, required: true },
  isPublic: { type: Boolean, default: true },
  createdBy: { type: String, ref: 'User', required: true }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    versionKey: false,
    transform: (doc: any, ret: any) => {
      ret.id = ret._id
      delete ret._id
    }
  }
})

export const Template = mongoose.model<ITemplate>('Template', templateSchema)