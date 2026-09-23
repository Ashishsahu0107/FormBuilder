import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { Form } from '@/models/Form.model'
import { FormVersion } from '@/models/FormVersion.model'
import { validate } from '@/middleware/validate.middleware'
import { authenticate, AuthRequest } from '@/middleware/auth.middleware'
import { sendSuccess, sendError } from '@/utils/response'

const router = Router({ mergeParams: true }) // to access :id from parent router

const saveSchemaObj = z.object({
  schema: z.any()
})

// --- GET /api/forms/:id/versions ---
router.get('/:id/versions', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const form = await Form.findOne({ _id: req.params.id, deletedAt: null })
    if (!form) return sendError(res, 'Form not found', 404)

    if (req.user!.role !== 'ADMIN' && req.user!.role !== 'SUPER_ADMIN' && form.createdBy.toString() !== req.user!.id) {
      return sendError(res, 'Unauthorized', 403)
    }

    const versions = await FormVersion.find({ formId: req.params.id }).sort({ versionNumber: -1 }).populate('createdBy', 'name').populate('approvedBy', 'name')
    return sendSuccess(res, versions)
  } catch (error) {
    console.error('[GET /versions]', error)
    return sendError(res, 'Failed to fetch versions')
  }
})

// --- POST /api/forms/:id/versions ---
router.post('/:id/versions', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const form = await Form.findOne({ _id: req.params.id, deletedAt: null })
    if (!form) return sendError(res, 'Form not found', 404)

    if (req.user!.role !== 'ADMIN' && req.user!.role !== 'SUPER_ADMIN' && form.createdBy.toString() !== req.user!.id) {
      return sendError(res, 'Unauthorized', 403)
    }

    const latestVersion = await FormVersion.findOne({ formId: form.id }).sort({ versionNumber: -1 })
    if (!latestVersion) return sendError(res, 'No previous version found', 400)

    const newVersion = await FormVersion.create({
      formId: form.id,
      versionNumber: latestVersion.versionNumber + 1,
      createdBy: req.user!.id,
      schema: latestVersion.schema, // copy schema
      status: 'DRAFT'
    })

    form.currentVersionId = newVersion.id
    form.status = 'DRAFT'
    await form.save()

    return sendSuccess(res, newVersion, 'New draft version created', 201)
  } catch (error) {
    console.error('[POST /versions]', error)
    return sendError(res, 'Failed to create version')
  }
})

// --- GET /api/forms/:id/versions/:versionId ---
router.get('/:id/versions/:versionId', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const form = await Form.findOne({ _id: req.params.id, deletedAt: null })
    if (!form) return sendError(res, 'Form not found', 404)

    if (req.user!.role !== 'ADMIN' && req.user!.role !== 'SUPER_ADMIN' && form.createdBy.toString() !== req.user!.id) {
      return sendError(res, 'Unauthorized', 403)
    }

    const version = await FormVersion.findOne({ _id: req.params.versionId, formId: form.id })
    if (!version) return sendError(res, 'Version not found', 404)

    return sendSuccess(res, version)
  } catch (error) {
    console.error('[GET /versions/:versionId]', error)
    return sendError(res, 'Failed to fetch version')
  }
})

// --- PATCH /api/forms/:id/versions/:versionId ---
router.patch('/:id/versions/:versionId', authenticate, validate(saveSchemaObj), async (req: AuthRequest, res: Response) => {
  try {
    const form = await Form.findOne({ _id: req.params.id, deletedAt: null })
    if (!form) return sendError(res, 'Form not found', 404)

    if (req.user!.role !== 'ADMIN' && req.user!.role !== 'SUPER_ADMIN' && form.createdBy.toString() !== req.user!.id) {
      return sendError(res, 'Unauthorized', 403)
    }

    const version = await FormVersion.findOne({ _id: req.params.versionId, formId: form.id })
    if (!version) return sendError(res, 'Version not found', 404)

    if (version.status !== 'DRAFT') {
      return sendError(res, 'Can only edit DRAFT versions', 400)
    }

    version.schema = req.body.schema
    await version.save()

    return sendSuccess(res, version, 'Schema saved successfully')
  } catch (error) {
    console.error('[PATCH /versions/:versionId]', error)
    return sendError(res, 'Failed to save schema')
  }
})

export default router