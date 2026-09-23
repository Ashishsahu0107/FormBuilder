import "dotenv/config";
import { connectMongoDB } from "@/config/mongodb";
import { Form } from "@/models/Form.model";
import { User } from "@/models/User.model";

const start = async () => {
  await connectMongoDB();
  const u = User;
  const form = await Form.findById("273fa937-db4b-4ced-88f5-26fef0b7df26").populate("createdBy");
  
  const formCreatedBy = form.createdBy;
  const formCreatedById = (form.createdBy as any)._id;
  const formCreatedByFallback = formCreatedById || form.createdBy;
  const formCreatedByString = formCreatedByFallback.toString();
  const reqUserId = "aa25a39a-bf6a-4782-96e6-7acd0a370381";

  console.log("formCreatedById:", formCreatedById);
  console.log("formCreatedByString:", formCreatedByString);
  console.log("reqUserId:", reqUserId);
  console.log("Are they equal?", formCreatedByString === reqUserId);
  console.log("Is it not equal?", formCreatedByString !== reqUserId);

  process.exit(0);
};
start();