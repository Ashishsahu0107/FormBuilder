import mongoose, { Schema, Document } from "mongoose";
import { v4 as uuidv4 } from "uuid";

export interface IFormVersion {
  _id: string;
  formId: string;
  versionNumber: number;
  schema: any;
  status: "DRAFT" | "UNDER_REVIEW" | "APPROVED" | "PUBLISHED";
  createdBy: string;
  approvedBy?: string;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const formVersionSchema = new Schema<IFormVersion>(
  {
    _id: { type: String, default: () => uuidv4() },
    formId: { type: String, ref: "Form", required: true },
    versionNumber: { type: Number, required: true },
    schema: { type: Schema.Types.Mixed, required: true },
    status: {
      type: String,
      enum: ["DRAFT", "UNDER_REVIEW", "APPROVED", "PUBLISHED"],
      default: "DRAFT",
    },
    createdBy: { type: String, ref: "User", required: true },
    approvedBy: { type: String, ref: "User" },
    publishedAt: { type: Date },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform: (doc: any, ret: any) => {
        ret.id = ret._id;
        delete ret._id;
      },
    },
  },
);

// Compound unique index for formId + versionNumber
formVersionSchema.index({ formId: 1, versionNumber: 1 }, { unique: true });

export const FormVersion = mongoose.model<IFormVersion>(
  "FormVersion",
  formVersionSchema,
);
