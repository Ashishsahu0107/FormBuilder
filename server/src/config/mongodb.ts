import mongoose from "mongoose";

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/formbuilder";

export const connectMongoDB = async (): Promise<void> => {
  try {
    mongoose.set("strictQuery", false);
    await mongoose.connect(MONGODB_URI);
    console.log("✅ MongoDB connected");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error);
    process.exit(1);
  }
};

export const disconnectMongoDB = async (): Promise<void> => {
  await mongoose.disconnect();
  console.log("MongoDB disconnected");
};
