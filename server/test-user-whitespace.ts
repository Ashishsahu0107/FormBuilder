import "dotenv/config";
import { connectMongoDB } from "@/config/mongodb";
import { User } from "@/models/User.model";

const start = async () => {
  await connectMongoDB();
  const user = await User.findOne();
  if (user) {
    console.log("User ID length:", user._id.length);
    console.log("User ID literal:", JSON.stringify(user._id));
  }
  process.exit(0);
};
start();