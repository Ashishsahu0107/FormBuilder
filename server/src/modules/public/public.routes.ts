import { Router, Request, Response } from "express";
import { Form } from "@/models/Form.model";
import { FormVersion } from "@/models/FormVersion.model";
import { Submission } from "@/models/Submission.model";
import { sendSuccess, sendError } from "@/utils/response";

const router = Router();

// GET /api/public/forms/:slug
router.get("/forms/:slug", async (req: Request, res: Response) => {
  try {
    const form = await Form.findOne({
      slug: req.params.slug,
      status: "ACTIVE",
      deletedAt: null,
    });
    if (!form) return sendError(res, "Form not found or inactive", 404);

    const version = await FormVersion.findOne({ _id: form.currentVersionId });
    if (!version) return sendError(res, "Form schema not found", 404);

    return sendSuccess(res, {
      form: { title: form.title, description: form.description },
      schema: version.schema,
    });
  } catch (error) {
    console.error("[GET /public/forms/:slug]", error);
    return sendError(res, "Failed to load form");
  }
});

// POST /api/public/forms/:slug/submit
router.post("/forms/:slug/submit", async (req: Request, res: Response) => {
  try {
    const form = await Form.findOne({
      slug: req.params.slug,
      status: "ACTIVE",
      deletedAt: null,
    });
    if (!form) return sendError(res, "Form not found or inactive", 404);

    // Ensure version exists
    const version = await FormVersion.findOne({ _id: form.currentVersionId });
    if (!version) return sendError(res, "Form schema not found", 404);

    const now = new Date();
    const year = now.getFullYear();
    const count = await Submission.countDocuments({ formId: form.id });
    const referenceNumber = `FORM-${year}-${(count + 1).toString().padStart(4, "0")}`;

    const submission = await Submission.create({
      formId: form.id,
      formSlug: form.slug,
      data: req.body,
      metadata: {
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
        submittedAt: now,
      },
      referenceNumber,
    });

    return sendSuccess(
      res,
      { referenceNumber: submission.referenceNumber },
      "Form submitted successfully",
      201,
    );
  } catch (error) {
    console.error("[POST /public/forms/:slug/submit]", error);
    return sendError(res, "Failed to submit form");
  }
});

export default router;
