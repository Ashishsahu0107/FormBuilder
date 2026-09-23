import "dotenv/config";
import { connectMongoDB } from "@/config/mongodb";
import { User } from "@/models/User.model";

const start = async () => {
  await connectMongoDB();
  const users = await User.find();
  console.log("Users:", users.map(u => ({ id: u.id, email: u.email, role: u.role })));
  process.exit(0);
};
start();