import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { User } from "@/models/User.model";

export async function seedAdmin() {
  try {
    const adminExists = await User.findOne({ role: "ADMIN" });
    if (!adminExists) {
      const hashed = await bcrypt.hash("admin123", 12);
      await User.create({
        name: "Super Admin",
        email: "admin@formbuilder.com",
        password: hashed,
        role: "ADMIN",
      });
      console.log("Seeded default admin: admin@formbuilder.com / admin123");
    }
  } catch (err) {
    console.error("Failed to seed admin", err);
  }
}
