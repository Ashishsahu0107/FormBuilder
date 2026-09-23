import { Router, Request, Response } from 'express'
import { Template } from '@/models/Template.model'
import { validate } from '@/middleware/validate.middleware'
import { authenticate, AuthRequest, authorize } from '@/middleware/auth.middleware'
import { sendSuccess, sendError } from '@/utils/response'
import { z } from 'zod'

const router = Router()

const createTemplateSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  thumbnail: z.string().optional(),
  schema: z.any(),
  isPublic: z.boolean().optional()
})

// GET /api/templates
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const category = req.query.category as string
    const search = req.query.search as string
    const query: any = {}
    
    if (category) query.category = category
    if (search) query.title = { $regex: search, $options: 'i' }
    
    const templates = await Template.find(query).sort({ createdAt: -1 })
    return sendSuccess(res, templates)
  } catch (error) {
    return sendError(res, 'Failed to fetch templates')
  }
})

// POST /api/templates (Admin only)
router.post('/', authenticate, authorize('', ''), validate(createTemplateSchema), async (req: AuthRequest, res: Response) => {
  try {
    const template = await Template.create({
      ...req.body,
      createdBy: req.user!.id
    })
    return sendSuccess(res, template, 'Template created successfully', 201)
  } catch (error) {
    return sendError(res, 'Failed to create template')
  }
})

// DELETE /api/templates/:id (Admin only)
router.delete('/:id', authenticate, authorize('', ''), async (req: AuthRequest, res: Response) => {
  try {
    const template = await Template.findByIdAndDelete(req.params.id)
    if (!template) return sendError(res, 'Template not found', 404)
    return sendSuccess(res, null, 'Template deleted')
  } catch (error) {
    return sendError(res, 'Failed to delete template')
  }
})

export default router