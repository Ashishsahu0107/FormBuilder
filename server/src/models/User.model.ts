import mongoose, { Schema, Document } from "mongoose";
import { v4 as uuidv4 } from "uuid";

export interface IUser {
  _id: string;
  email: string;
  password?: string;
  name: string;
  role: "SUPER_ADMIN" | "ADMIN" | "FORM_BUILDER" | "APPROVER" | "VIEWER";
  isActive: boolean;
  resetToken?: string;
  resetTokenExpiry?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    _id: { type: String, default: () => uuidv4() },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    role: {
      type: String,
      enum: ["SUPER_ADMIN", "ADMIN", "FORM_BUILDER", "APPROVER", "VIEWER"],
      default: "FORM_BUILDER",
    },
    isActive: { type: Boolean, default: true },
    resetToken: { type: String },
    resetTokenExpiry: { type: Date },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform: (doc: any, ret: any) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.password;
      },
    },
  },
);

export const User = mongoose.model<IUser>("User", userSchema);
