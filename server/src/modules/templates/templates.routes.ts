import { Router, Request, Response } from 'express'
import { prisma } from '@/lib/prisma'
import { authenticate, AuthRequest } from '@/middleware/auth.middleware'
import { authorize } from '@/middleware/auth.middleware'
import { sendSuccess, sendError, sendPaginated } from '@/utils/response'

const router = Router()

// GET /api/templates
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 20
    const skip = (page - 1) * limit

    const where = { isPublic: true } // for MVP, just list all public templates

    const [templates, total] = await Promise.all([
      prisma.template.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.template.count({ where })
    ])

    return sendPaginated(res, templates, total, page, limit)
  } catch (error) {
    return sendError(res, 'Failed to fetch templates')
  }
})

// POST /api/templates
router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, category, schema } = req.body
    if (!title || !category || !schema) return sendError(res, 'Missing required fields', 400)

    const template = await prisma.template.create({
      data: {
        title,
        description,
        category,
        schema,
        createdBy: req.user!.id
      }
    })
    return sendSuccess(res, template, 'Template created', 201)
  } catch (error) {
    return sendError(res, 'Failed to create template')
  }
})

export default router