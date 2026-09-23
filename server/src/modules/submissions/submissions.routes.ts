import { Router, Response } from "express";
import { Parser } from "json2csv";
import { Form } from "@/models/Form.model";
import { authenticate, AuthRequest } from "@/middleware/auth.middleware";
import { Submission } from "@/models/Submission.model";
import { sendSuccess, sendError, sendPaginated } from "@/utils/response";

const router = Router({ mergeParams: true });

const verifyFormAccess = async (
  formId: string,
  userId: string,
  role: string,
) => {
  const form = await Form.findById(formId);
  if (!form) return null;
  if (
    role === "SUPER_ADMIN" ||
    role === "ADMIN" ||
    form.createdBy.toString() === userId
  ) {
    return form;
  }
  return null;
};

// GET /api/forms/:id/submissions
router.get("/", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const formId = req.params.id as string;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const form = await verifyFormAccess(formId, req.user!.id, req.user!.role);
    if (!form) return sendError(res, "Form not found or access denied", 404);

    const query: any = { formId: form.id };
    if (req.query.startDate && req.query.endDate) {
      query.createdAt = {
        $gte: new Date(req.query.startDate as string),
        $lte: new Date(req.query.endDate as string),
      };
    }

    const [submissions, total] = await Promise.all([
      Submission.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Submission.countDocuments(query),
    ]);

    return sendPaginated(res, submissions, total, page, limit);
  } catch (error) {
    console.error("Fetch submissions error:", error);
    return sendError(res, "Failed to fetch submissions");
  }
});

// GET /api/forms/:id/submissions/export
router.get("/export", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const formId = req.params.id as string;
    const form = await verifyFormAccess(formId, req.user!.id, req.user!.role);
    if (!form) return sendError(res, "Form not found or access denied", 404);

    const query: any = { formId: form.id };
    if (req.query.startDate && req.query.endDate) {
      query.createdAt = {
        $gte: new Date(req.query.startDate as string),
        $lte: new Date(req.query.endDate as string),
      };
    }

    const submissions = await Submission.find(query).sort({ createdAt: -1 });
    if (!submissions.length)
      return sendError(res, "No submissions to export", 404);

    const flattenedData = submissions.map((sub: any) => {
      const flat: any = {
        Reference: sub.referenceNumber,
        SubmittedAt: sub.createdAt.toISOString(),
        Status: sub.status,
      };
      if (sub.data && typeof sub.data === "object") {
        Object.entries(sub.data).forEach(([key, value]) => {
          flat[key] = Array.isArray(value) ? value.join(", ") : value;
        });
      }
      return flat;
    });

    const json2csvParser = new Parser();
    const csv = json2csvParser.parse(flattenedData);

    res.header("Content-Type", "text/csv");
    res.attachment(`submissions-${form.slug}.csv`);
    return res.send(csv);
  } catch (error) {
    console.error("Export submissions error:", error);
    return sendError(res, "Failed to export submissions");
  }
});

// GET /api/forms/:id/analytics
router.get(
  "/analytics",
  authenticate,
  async (req: AuthRequest, res: Response) => {
    try {
      const formId = req.params.id as string;
      const form = await verifyFormAccess(formId, req.user!.id, req.user!.role);
      if (!form) return sendError(res, "Form not found or access denied", 404);

      const totalSubmissions = await Submission.countDocuments({
        formId: form.id,
      });

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const dailySubmissions = await Submission.aggregate([
        { $match: { formId: form.id, createdAt: { $gte: thirtyDaysAgo } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      return sendSuccess(res, {
        views: form.views || 0,
        totalSubmissions,
        conversionRate: form.views
          ? ((totalSubmissions / form.views) * 100).toFixed(2)
          : 0,
        dailySubmissions: dailySubmissions.map((d) => ({
          date: d._id,
          count: d.count,
        })),
      });
    } catch (error) {
      console.error("Analytics error:", error);
      return sendError(res, "Failed to fetch analytics");
    }
  },
);

// GET /api/forms/:id/submissions/:subId
router.get("/:subId", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const formId = req.params.id as string;
    const form = await verifyFormAccess(formId, req.user!.id, req.user!.role);
    if (!form) return sendError(res, "Form not found or access denied", 404);

    const submission = await Submission.findById(req.params.subId as string);
    if (!submission) return sendError(res, "Submission not found", 404);

    return sendSuccess(res, submission);
  } catch (error) {
    console.error("Fetch submission error:", error);
    return sendError(res, "Failed to fetch submission");
  }
});



export default router;
