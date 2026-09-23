import "dotenv/config";
import { connectMongoDB } from "@/config/mongodb";
import { User } from "@/models/User.model";

const start = async () => {
  await connectMongoDB();
  try {
    const user = await User.findById(undefined);
    console.log("Found user:", user ? user.email : "none");
  } catch (e) {
    console.error("Error:", e.message);
  }
  process.exit(0);
};
start();