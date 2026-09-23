import "dotenv/config";
import { connectMongoDB } from "@/config/mongodb";
import { Form } from "@/models/Form.model";

const start = async () => {
  await connectMongoDB();
  const forms = await Form.find();
  for (const f of forms) {
     console.log(`Form ID: ${f.id} | Slug: ${f.slug} | CreatedBy: ${f.createdBy}`);
  }
  process.exit(0);
};
start();