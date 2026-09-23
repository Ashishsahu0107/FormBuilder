import "dotenv/config";
import { connectMongoDB } from "@/config/mongodb";
import { User } from "@/models/User.model";

const start = async () => {
  await connectMongoDB();
  const user = await User.findOne();
  if (user) {
    console.log("user.id:", user.id);
    console.log("user._id:", user._id);
    console.log("typeof user.id:", typeof user.id);
    console.log("typeof user._id:", typeof user._id);
  }
  process.exit(0);
};
start();