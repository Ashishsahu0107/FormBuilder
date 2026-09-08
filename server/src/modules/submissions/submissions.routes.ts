import { Router, Request, Response } from 'express'
import { Submission } from '@/models/Submission.model'
import { prisma } from '@/lib/prisma'
import { authenticate, AuthRequest } from '@/middleware/auth.middleware'
import { sendSuccess, sendError, sendPaginated } from '@/utils/response'

const router = Router()

// POST /api/submissions/:slug — Public: submit a form
router.post('/:slug', async (req: Request, res: Response) => {
  try {
    const form = await prisma.form.findUnique({
      where: { slug: req.params.slug },
    })
    if (!form || form.status !== 'PUBLISHED') {
      return sendError(res, 'Form not found or not published', 404)
    }

    const submission = await Submission.create({
      formId: form.id,
      formSlug: form.slug,
      data: req.body,
      metadata: {
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        submittedAt: new Date(),
      },
    })

    return sendSuccess(res, submission, 'Submitted successfully', 201)
  } catch {
    return sendError(res, 'Failed to submit form')
  }
})

// GET /api/submissions/form/:formId — Auth: get all submissions for a form
router.get('/form/:formId', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 20
    const skip = (page - 1) * limit

    const [submissions, total] = await Promise.all([
      Submission.find({ formId: req.params.formId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Submission.countDocuments({ formId: req.params.formId }),
    ])

    return sendPaginated(res, submissions, total, page, limit)
  } catch {
    return sendError(res, 'Failed to fetch submissions')
  }
})

export default router
