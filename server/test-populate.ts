import "dotenv/config";
import { connectMongoDB } from "@/config/mongodb";
import { Form } from "@/models/Form.model";
import { User } from "@/models/User.model";

const start = async () => {
  await connectMongoDB();
  // Ensure User model is loaded
  const u = User;
  const form = await Form.findOne().populate("createdBy", "name email");
  if (form) {
    console.log("Raw form.createdBy:", form.createdBy);
    console.log("Type:", typeof form.createdBy);
    console.log("Is populated object?", typeof form.createdBy === "object");
    console.log("As any _id:", (form.createdBy as any)._id);
    console.log("As any id:", (form.createdBy as any).id);
    console.log("ToString:", form.createdBy.toString());
  } else {
    console.log("No form found");
  }
  process.exit(0);
};

start();