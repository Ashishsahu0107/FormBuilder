import { Router, Response } from 'express'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { authenticate, AuthRequest } from '@/middleware/auth.middleware'
import { validate } from '@/middleware/validate.middleware'
import { sendSuccess, sendError } from '@/utils/response'

const router = Router()

// ─── Validation Schemas ───────────────────────────────────────────────────────

const updateVersionSchema = z.object({
  schema: z.record(z.unknown()),
})

// ─── POST /api/forms/:id/versions — Create new draft version from current ─────
router.post('/:id/versions', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const form = await prisma.form.findFirst({
      where: { id: req.params.id, createdBy: req.user!.id, deletedAt: null },
    })
    if (!form) return sendError(res, 'Form not found', 404)

    // Get current version to clone schema from
    let baseSchema: Record<string, unknown> = {
      id: form.id,
      version: 1,
      title: form.title,
      description: '',
      settings: {
        submitButtonText: 'Submit',
        successMessage: 'Thank you for your submission!',
        isMultiStep: false,
      },
      sections: [{ id: 'section_default', title: '', fields: [] }],
      logic: [],
    }

    if (form.currentVersionId) {
      const current = await prisma.formVersion.findUnique({
        where: { id: form.currentVersionId },
      })
      if (current) baseSchema = current.schema as Record<string, unknown>
    }

    // Get next version number
    const latestVersion = await prisma.formVersion.findFirst({
      where: { formId: form.id },
      orderBy: { versionNumber: 'desc' },
    })
    const nextVersionNumber = (latestVersion?.versionNumber ?? 0) + 1

    const newVersion = await prisma.formVersion.create({
      data: {
        formId: form.id,
        versionNumber: nextVersionNumber,
        schema: { ...baseSchema, version: nextVersionNumber },
        createdBy: req.user!.id,
      },
    })

    // Update form's currentVersionId to new draft
    await prisma.form.update({
      where: { id: form.id },
      data: { currentVersionId: newVersion.id },
    })

    return sendSuccess(res, newVersion, 'New version created', 201)
  } catch (err) {
    console.error('[POST /forms/:id/versions]', err)
    return sendError(res, 'Failed to create version')
  }
})

// ─── GET /api/forms/:id/versions — List all versions ─────────────────────────
router.get('/:id/versions', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const form = await prisma.form.findFirst({
      where: { id: req.params.id, createdBy: req.user!.id, deletedAt: null },
    })
    if (!form) return sendError(res, 'Form not found', 404)

    const versions = await prisma.formVersion.findMany({
      where: { formId: req.params.id },
      orderBy: { versionNumber: 'desc' },
      select: {
        id: true,
        formId: true,
        versionNumber: true,
        status: true,
        publishedAt: true,
        createdAt: true,
        updatedAt: true,
        createdBy: true,
        approvedBy: true,
        creator: { select: { id: true, name: true, email: true } },
      },
    })

    return sendSuccess(res, versions)
  } catch (err) {
    console.error('[GET /forms/:id/versions]', err)
    return sendError(res, 'Failed to fetch versions')
  }
})

// ─── GET /api/forms/:id/versions/:versionId — Get specific version ────────────
router.get('/:id/versions/:versionId', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const form = await prisma.form.findFirst({
      where: { id: req.params.id, createdBy: req.user!.id, deletedAt: null },
    })
    if (!form) return sendError(res, 'Form not found', 404)

    const version = await prisma.formVersion.findFirst({
      where: { id: req.params.versionId, formId: req.params.id },
      include: {
        creator: { select: { id: true, name: true, email: true } },
      },
    })
    if (!version) return sendError(res, 'Version not found', 404)

    return sendSuccess(res, version)
  } catch (err) {
    console.error('[GET /forms/:id/versions/:versionId]', err)
    return sendError(res, 'Failed to fetch version')
  }
})

// ─── PATCH /api/forms/:id/versions/:versionId — Autosave schema ──────────────
router.patch(
  '/:id/versions/:versionId',
  authenticate,
  validate(updateVersionSchema),
  async (req: AuthRequest, res: Response) => {
    try {
      const form = await prisma.form.findFirst({
        where: { id: req.params.id, createdBy: req.user!.id, deletedAt: null },
      })
      if (!form) return sendError(res, 'Form not found', 404)

      const version = await prisma.formVersion.findFirst({
        where: { id: req.params.versionId, formId: req.params.id },
      })
      if (!version) return sendError(res, 'Version not found', 404)

      // Only DRAFT versions can be edited
      if (version.status !== 'DRAFT') {
        return sendError(res, 'Only DRAFT versions can be edited', 400)
      }

      const updated = await prisma.formVersion.update({
        where: { id: req.params.versionId },
        data: { schema: req.body.schema },
      })

      return sendSuccess(res, updated, 'Schema saved')
    } catch (err) {
      console.error('[PATCH /forms/:id/versions/:versionId]', err)
      return sendError(res, 'Failed to save schema')
    }
  }
)

export default router
