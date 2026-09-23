import "dotenv/config";
import { connectMongoDB } from "@/config/mongodb";
import { Form } from "@/models/Form.model";
import { Submission } from "@/models/Submission.model";

const start = async () => {
  await connectMongoDB();
  try {
    const formId = "273fa937-db4b-4ced-88f5-26fef0b7df26";
    const form = await Form.findOne({ _id: formId, deletedAt: null });
    
    console.log("Verifying access...");
    if (!form) {
       console.log("Form not found");
       process.exit(1);
    }
    console.log("Form accessed.");

    const totalSubmissions = await Submission.countDocuments({
      formId: form.id,
    });

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    console.log("Aggregating...");
    const dailySubmissions = await Submission.aggregate([
      { $match: { formId: form.id, createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        }
      }
    ]);
    console.log("Success");
  } catch (error: any) {
    console.error("Crash:", error);
  }
  process.exit(0);
};
start();