import { Router, Request, Response } from 'express'
import { Form } from '@/models/Form.model'
import { FormVersion } from '@/models/FormVersion.model'
import { FormApproval } from '@/models/FormApproval.model'
import { AuditLog } from '@/models/AuditLog.model'
import { authenticate, AuthRequest, authorize } from '@/middleware/auth.middleware'
import { sendSuccess, sendError } from '@/utils/response'

const router = Router({ mergeParams: true })

const logAction = async (formId: string, action: string, userId: string, details?: string) => {
  await AuditLog.create({ resourceId: formId, resource: 'FORM', action, userId, details: details ? { message: details } : undefined })
}

// POST /api/forms/:id/submit-review
router.post('/:id/submit-review', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const form = await Form.findOne({ _id: req.params.id, deletedAt: null })
    if (!form) return sendError(res, 'Form not found', 404)
    if (form.createdBy.toString() !== req.user!.id) return sendError(res, 'Unauthorized', 403)

    const version = await FormVersion.findOne({ _id: form.currentVersionId })
    if (!version || version.status !== 'DRAFT') return sendError(res, 'Only DRAFT versions can be submitted for review', 400)

    version.status = 'UNDER_REVIEW'
    await version.save()

    form.status = 'UNDER_REVIEW'
    await form.save()

    await FormApproval.create({ formId: form.id, versionId: version.id, action: 'SUBMITTED_FOR_REVIEW', by: req.user!.id })
    await logAction(form.id, 'SUBMIT_REVIEW', req.user!.id)

    return sendSuccess(res, null, 'Form submitted for review')
  } catch (error) {
    console.error('[POST /workflow/submit-review]', error)
    return sendError(res, 'Failed to submit form')
  }
})

// POST /api/forms/:id/approve
router.post('/:id/approve', authenticate, authorize('', '', ''), async (req: AuthRequest, res: Response) => {
  try {
    const form = await Form.findOne({ _id: req.params.id, deletedAt: null })
    if (!form) return sendError(res, 'Form not found', 404)

    const version = await FormVersion.findOne({ _id: form.currentVersionId })
    if (!version || version.status !== 'UNDER_REVIEW') return sendError(res, 'Form is not under review', 400)

    version.status = 'APPROVED'
    version.approvedBy = req.user!.id
    await version.save()

    form.status = 'APPROVED'
    await form.save()

    await FormApproval.create({ formId: form.id, versionId: version.id, action: 'APPROVED', comment: req.body.comment, by: req.user!.id })
    await logAction(form.id, 'APPROVE', req.user!.id, req.body.comment)

    return sendSuccess(res, null, 'Form approved')
  } catch (error) {
    console.error('[POST /workflow/approve]', error)
    return sendError(res, 'Failed to approve form')
  }
})

// POST /api/forms/:id/reject
router.post('/:id/reject', authenticate, authorize('', '', ''), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.body.comment) return sendError(res, 'Comment is required for rejection', 400)
    
    const form = await Form.findOne({ _id: req.params.id, deletedAt: null })
    if (!form) return sendError(res, 'Form not found', 404)

    const version = await FormVersion.findOne({ _id: form.currentVersionId })
    if (!version || version.status !== 'UNDER_REVIEW') return sendError(res, 'Form is not under review', 400)

    version.status = 'DRAFT'
    await version.save()

    form.status = 'DRAFT'
    await form.save()

    await FormApproval.create({ formId: form.id, versionId: version.id, action: 'REJECTED', comment: req.body.comment, by: req.user!.id })
    await logAction(form.id, 'REJECT', req.user!.id, req.body.comment)

    return sendSuccess(res, null, 'Form rejected')
  } catch (error) {
    console.error('[POST /workflow/reject]', error)
    return sendError(res, 'Failed to reject form')
  }
})

// POST /api/forms/:id/publish
router.post('/:id/publish', authenticate, authorize('', ''), async (req: AuthRequest, res: Response) => {
  try {
    const form = await Form.findOne({ _id: req.params.id, deletedAt: null })
    if (!form) return sendError(res, 'Form not found', 404)

    const version = await FormVersion.findOne({ _id: form.currentVersionId })
    if (!version || version.status !== 'APPROVED') return sendError(res, 'Only APPROVED versions can be published', 400)

    version.status = 'PUBLISHED'
    version.publishedAt = new Date()
    await version.save()

    form.status = 'PUBLISHED'
    await form.save()

    await logAction(form.id, 'PUBLISH', req.user!.id)
    return sendSuccess(res, null, 'Form published successfully')
  } catch (error) {
    console.error('[POST /workflow/publish]', error)
    return sendError(res, 'Failed to publish form')
  }
})

// POST /api/forms/:id/activate
router.post('/:id/activate', authenticate, authorize('', ''), async (req: AuthRequest, res: Response) => {
  try {
    const form = await Form.findOne({ _id: req.params.id, deletedAt: null })
    if (!form) return sendError(res, 'Form not found', 404)
    if (form.status !== 'PUBLISHED' && form.status !== 'DEACTIVATED') return sendError(res, 'Invalid status for activation', 400)

    form.status = 'ACTIVE'
    await form.save()

    await logAction(form.id, 'ACTIVATE', req.user!.id)
    return sendSuccess(res, null, 'Form is now active and ready for submissions')
  } catch (error) {
    return sendError(res, 'Failed to activate form')
  }
})

// POST /api/forms/:id/deactivate
router.post('/:id/deactivate', authenticate, authorize('', ''), async (req: AuthRequest, res: Response) => {
  try {
    const form = await Form.findOne({ _id: req.params.id, deletedAt: null })
    if (!form) return sendError(res, 'Form not found', 404)
    if (form.status !== 'ACTIVE') return sendError(res, 'Only ACTIVE forms can be deactivated', 400)

    form.status = 'DEACTIVATED'
    await form.save()

    await logAction(form.id, 'DEACTIVATE', req.user!.id)
    return sendSuccess(res, null, 'Form deactivated')
  } catch (error) {
    return sendError(res, 'Failed to deactivate form')
  }
})

// POST /api/forms/:id/archive
router.post('/:id/archive', authenticate, authorize('', ''), async (req: AuthRequest, res: Response) => {
  try {
    const form = await Form.findOne({ _id: req.params.id, deletedAt: null })
    if (!form) return sendError(res, 'Form not found', 404)

    form.status = 'ARCHIVED'
    await form.save()

    await logAction(form.id, 'ARCHIVE', req.user!.id)
    return sendSuccess(res, null, 'Form archived')
  } catch (error) {
    return sendError(res, 'Failed to archive form')
  }
})

export default router