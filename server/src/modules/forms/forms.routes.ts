import { Router, Response } from 'express'
import { z } from 'zod'
import slugify from 'slugify'
import { prisma } from '@/lib/prisma'
import { authenticate, AuthRequest } from '@/middleware/auth.middleware'
import { validate } from '@/middleware/validate.middleware'
import { sendSuccess, sendError, sendPaginated } from '@/utils/response'

const router = Router()

// ─── Validation Schemas ───────────────────────────────────────────────────────

const createFormSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
})

const updateFormSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
})

// ─── Default empty schema for new form versions ───────────────────────────────

const buildDefaultSchema = (formId: string, title: string) => ({
  id: formId,
  version: 1,
  title,
  description: '',
  settings: {
    submitButtonText: 'Submit',
    successMessage: 'Thank you for your submission!',
    isMultiStep: false,
  },
  sections: [
    {
      id: 'section_default',
      title: '',
      fields: [],
    },
  ],
  logic: [],
})

// ─── GET /api/forms ───────────────────────────────────────────────────────────
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1)
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 10))
    const skip = (page - 1) * limit
    const status = req.query.status as string | undefined
    const search = req.query.search as string | undefined

    const where: Record<string, unknown> = {
      createdBy: req.user!.id,
      deletedAt: null,
    }

    if (status) where.status = status
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [forms, total] = await Promise.all([
      prisma.form.findMany({
        where,
        include: {
          versions: {
            where: { id: { equals: undefined } }, // will be overridden
            take: 0, // we don't need version details in list
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.form.count({ where }),
    ])

    // Fetch forms without version details for list view
    const formList = await prisma.form.findMany({
      where,
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
        updatedAt: true,
        createdBy: true,
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    })

    return sendPaginated(res, formList, total, page, limit)
  } catch (err) {
    console.error('[GET /forms]', err)
    return sendError(res, 'Failed to fetch forms')
  }
})

// ─── POST /api/forms ──────────────────────────────────────────────────────────
router.post('/', authenticate, validate(createFormSchema), async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, category, tags } = req.body
    const baseSlug = slugify(title, { lower: true, strict: true })
    const slug = `${baseSlug}-${Date.now()}`

    // Create form + first draft version in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const form = await tx.form.create({
        data: {
          title,
          slug,
          description,
          category,
          tags: tags ?? [],
          createdBy: req.user!.id,
        },
      })

      const version = await tx.formVersion.create({
        data: {
          formId: form.id,
          versionNumber: 1,
          schema: buildDefaultSchema(form.id, title),
          createdBy: req.user!.id,
        },
      })

      const updated = await tx.form.update({
        where: { id: form.id },
        data: { currentVersionId: version.id },
        include: {
          user: { select: { id: true, name: true, email: true } },
          versions: true,
        },
      })

      return updated
    })

    return sendSuccess(res, result, 'Form created', 201)
  } catch (err) {
    console.error('[POST /forms]', err)
    return sendError(res, 'Failed to create form')
  }
})

// ─── GET /api/forms/:id ───────────────────────────────────────────────────────
router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const form = await prisma.form.findFirst({
      where: {
        id: req.params.id,
        createdBy: req.user!.id,
        deletedAt: null,
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        versions: {
          orderBy: { versionNumber: 'desc' },
          select: {
            id: true,
            versionNumber: true,
            status: true,
            publishedAt: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    })

    if (!form) return sendError(res, 'Form not found', 404)

    // Attach current version schema
    let currentVersion = null
    if (form.currentVersionId) {
      currentVersion = await prisma.formVersion.findUnique({
        where: { id: form.currentVersionId },
      })
    }

    return sendSuccess(res, { ...form, currentVersion })
  } catch (err) {
    console.error('[GET /forms/:id]', err)
    return sendError(res, 'Failed to fetch form')
  }
})

// ─── PATCH /api/forms/:id ─────────────────────────────────────────────────────
router.patch('/:id', authenticate, validate(updateFormSchema), async (req: AuthRequest, res: Response) => {
  try {
    const form = await prisma.form.findFirst({
      where: { id: req.params.id, createdBy: req.user!.id, deletedAt: null },
    })
    if (!form) return sendError(res, 'Form not found', 404)

    const { title, description, category, tags } = req.body
    const updateData: Record<string, unknown> = {}
    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (category !== undefined) updateData.category = category
    if (tags !== undefined) updateData.tags = tags

    const updated = await prisma.form.update({
      where: { id: req.params.id },
      data: updateData,
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    })

    return sendSuccess(res, updated, 'Form updated')
  } catch (err) {
    console.error('[PATCH /forms/:id]', err)
    return sendError(res, 'Failed to update form')
  }
})

// ─── DELETE /api/forms/:id (soft delete) ─────────────────────────────────────
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const form = await prisma.form.findFirst({
      where: { id: req.params.id, createdBy: req.user!.id, deletedAt: null },
    })
    if (!form) return sendError(res, 'Form not found', 404)

    await prisma.form.update({
      where: { id: req.params.id },
      data: { deletedAt: new Date() },
    })

    return sendSuccess(res, null, 'Form deleted')
  } catch (err) {
    console.error('[DELETE /forms/:id]', err)
    return sendError(res, 'Failed to delete form')
  }
})

export default router
