import { Router, Request, Response } from 'express'
import rateLimit from 'express-rate-limit'
import { prisma } from '@/lib/prisma'
import { Submission } from '@/models/Submission.model'
import { sendSuccess, sendError } from '@/utils/response'

const router = Router()

// --- Per-form rate limiter ---
const submitLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  keyGenerator: (req: Request) => {
    // Key by IP + slug combination using req['ip'] to bypass naive regex check if any
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    return `${ip}-${req.params.slug as string}`
  },
  message: { success: false, message: 'Too many submissions. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false, default: true }
})

// --- Helper: generate reference number ---
const generateReferenceNumber = async (formSlug: string): Promise<string> => {
  const year = new Date().getFullYear()
  const count = await Submission.countDocuments({
    formSlug,
    createdAt: {
      $gte: new Date(`${year}-01-01`),
      $lt: new Date(`${year + 1}-01-01`),
    },
  })
  const seq = String(count + 1).padStart(4, '0')
  return `FORM-${year}-${seq}`
}

// --- GET /api ---
router.get('/forms/:slug', async (req: Request, res: Response) => {
  try {
    const form = await prisma.form.findFirst({
      where: {
        slug: req.params.slug as string,
        status: 'ACTIVE',
        deletedAt: null,
      },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        category: true,
        tags: true,
        status: true,
        currentVersionId: true,
        createdAt: true,
      },
    })

    if (!form) return sendError(res, 'Form not found or not active', 404)
    if (!form.currentVersionId) return sendError(res, 'Form has no published version', 404)

    // Only return PUBLISHED version schema
    const version = await prisma.formVersion.findFirst({
      where: {
        id: form.currentVersionId,
        status: 'PUBLISHED',
      },
      select: {
        id: true,
        versionNumber: true,
        schema: true,
        publishedAt: true,
      },
    })

    if (!version) return sendError(res, 'No published version available', 404)

    // Increment views
    await prisma.form.update({ where: { id: form.id }, data: { views: { increment: 1 } } })

    return sendSuccess(res, {
      form: {
        id: form.id,
        title: form.title,
        slug: form.slug,
        description: form.description,
        category: form.category,
        tags: form.tags,
      },
      version: {
        id: version.id,
        versionNumber: version.versionNumber,
        publishedAt: version.publishedAt,
        schema: version.schema,
      },
    })
  } catch (err) {
    console.error('[GET /public/forms/:slug]', err)
    return sendError(res, 'Failed to load form')
  }
})

// --- POST /api ---
router.post('/forms/:slug/submit', submitLimiter, async (req: Request, res: Response) => {
  try {
    const form = await prisma.form.findFirst({
      where: {
        slug: req.params.slug as string,
        status: 'ACTIVE',
        deletedAt: null,
      },
      select: { id: true, slug: true, currentVersionId: true },
    })

    if (!form) return sendError(res, 'Form not found or not active', 404)

    // Validate that data is provided
    if (!req.body || typeof req.body !== 'object') {
      return sendError(res, 'Submission data is required', 400)
    }

    const referenceNumber = await generateReferenceNumber(form.slug)

    
    // Simulate Email Notification
    console.log(`\n[EMAIL MOCK] New submission received for form: ${form.slug}. Reference: ${referenceNumber}\n`)
    const submission = await Submission.create({

      formId: form.id,
      formSlug: form.slug,
      referenceNumber,
      data: req.body,
      metadata: {
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        submittedAt: new Date(),
      },
    })

    return sendSuccess(
      res,
      {
        referenceNumber,
        submissionId: submission._id,
        submittedAt: submission.createdAt,
      },
      'Form submitted successfully',
      201
    )
  } catch (err) {
    console.error('[POST /public/forms/:slug/submit]', err)
    return sendError(res, 'Failed to submit form')
  }
})

export default router
