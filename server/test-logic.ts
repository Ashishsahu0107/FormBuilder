import "dotenv/config";
import { connectMongoDB } from "@/config/mongodb";
import { Form } from "@/models/Form.model";
import { User } from "@/models/User.model";
import { FormVersion } from "@/models/FormVersion.model";

const start = async () => {
  await connectMongoDB();
  const u = User;
  const fv = FormVersion;
  const form = await Form.findOne({ _id: "273fa937-db4b-4ced-88f5-26fef0b7df26", deletedAt: null })
        .populate("createdBy", "name email")
        .populate("currentVersionId");

  const reqUser = { role: "FORM_BUILDER", id: "aa25a39a-bf6a-4782-96e6-7acd0a370381" };

  console.log("form.createdBy:", form?.createdBy);
  
  if (
    reqUser.role !== "ADMIN" &&
    reqUser.role !== "SUPER_ADMIN" &&
    String((form?.createdBy as any).id || (form?.createdBy as any)._id || form?.createdBy) !== String(reqUser.id)
  ) {
    console.log("403 Triggered!");
    console.log("Left side:", String((form?.createdBy as any).id || (form?.createdBy as any)._id || form?.createdBy));
    console.log("Right side:", String(reqUser.id));
  } else {
    console.log("Authorized successfully!");
  }
  process.exit(0);
};
start();