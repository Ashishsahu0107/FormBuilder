import "dotenv/config";
import { connectMongoDB } from "@/config/mongodb";
import { Form } from "@/models/Form.model";

const start = async () => {
  await connectMongoDB();
  const form = await Form.findOne();
  if (form) {
    console.log("CreatedBy length:", form.createdBy.length);
    console.log("CreatedBy literal:", JSON.stringify(form.createdBy));
  }
  process.exit(0);
};
start();