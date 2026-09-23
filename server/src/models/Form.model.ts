import mongoose, { Schema, Document } from "mongoose";
import { v4 as uuidv4 } from "uuid";

export interface IForm {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  category?: string;
  tags: string[];
  views: number;
  status:
    | "DRAFT"
    | "UNDER_REVIEW"
    | "APPROVED"
    | "PUBLISHED"
    | "ACTIVE"
    | "DEACTIVATED"
    | "ARCHIVED";
  currentVersionId?: string;
  createdBy: string;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const formSchema = new Schema<IForm>(
  {
    _id: { type: String, default: () => uuidv4() },
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String },
    category: { type: String },
    tags: { type: [String], default: [] },
    views: { type: Number, default: 0 },
    status: {
      type: String,
      enum: [
        "DRAFT",
        "UNDER_REVIEW",
        "APPROVED",
        "PUBLISHED",
        "ACTIVE",
        "DEACTIVATED",
        "ARCHIVED",
      ],
      default: "DRAFT",
    },
    currentVersionId: { type: String, ref: "FormVersion" },
    createdBy: { type: String, ref: "User", required: true },
    deletedAt: { type: Date },
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

export const Form = mongoose.model<IForm>("Form", formSchema);
