import "dotenv/config";
import { connectMongoDB } from "@/config/mongodb";
import { User } from "@/models/User.model";

const start = async () => {
  await connectMongoDB();
  try {
    const user = await User.create({ name: "Test", email: "test@example.com", password: "pwd" });
    console.log("user.id:", user.id);
    console.log("user._id:", user._id);
    await User.deleteOne({ email: "test@example.com" });
  } catch (e) {
    console.error("Error:", e.message);
  }
  process.exit(0);
};
start();