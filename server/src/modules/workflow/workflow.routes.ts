import { Router, Response } from 'express'
import { prisma } from '@/lib/prisma'
import { authenticate, authorize, AuthRequest } from '@/middleware/auth.middleware'
import { sendSuccess, sendError } from '@/utils/response'
import { AuditLog } from '@/models/AuditLog.model'

const router = Router()

// â”€â”€â”€ Helper: log audit event â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const logAudit = async (
  userId: string,
  action: string,
  formId: string,
  details: Record<string, unknown>,
  ip?: string
) => {
  await AuditLog.create({
    userId,
    action,
    resource: 'Form',
    resourceId: formId,
    details,
    ipAddress: ip,
  })
}

// â”€â”€â”€ Helper: record FormApproval â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const recordApproval = async (
  formId: string,
  versionId: string,
  by: string,
  action: string,
  comment?: string
) => {
  await prisma.formApproval.create({
    data: { formId, versionId, by, action, comment },
  })
}

// â”€â”€â”€ Helper: get form with current version (authorized) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const getForm = async (formId: string) => {
  return prisma.form.findFirst({
    where: { id: formId, deletedAt: null },
    include: { versions: { orderBy: { versionNumber: 'desc' }, take: 1 } },
  })
}

// â”€â”€â”€ POST /api/forms/:id/submit-review â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// DRAFT â†’ UNDER_REVIEW  (FORM_BUILDER)
router.post(
  '/:id/submit-review',
  authenticate,
  authorize('FORM_BUILDER', 'ADMIN', 'SUPER_ADMIN'),
  async (req: AuthRequest, res: Response) => {
    try {
      const form = await getForm(req.params.id as string)
      if (!form) return sendError(res, 'Form not found', 404)
      if (form.createdBy !== req.user!.id && req.user!.role !== 'SUPER_ADMIN') {
        return sendError(res, 'Forbidden', 403)
      }
      if (form.status !== 'DRAFT') {
        return sendError(res, `Cannot submit for review from status: ${form.status}`, 400)
      }
      if (!form.currentVersionId) {
        return sendError(res, 'No current version found', 400)
      }

      const updated = await prisma.form.update({
        where: { id: form.id },
        data: { status: 'UNDER_REVIEW' },
      })

      await prisma.formVersion.update({
        where: { id: form.currentVersionId },
        data: { status: 'UNDER_REVIEW' },
      })

      await recordApproval(form.id, form.currentVersionId, req.user!.id, 'SUBMIT_REVIEW', req.body.comment)
      await logAudit(req.user!.id, 'SUBMIT_REVIEW', form.id, { fromStatus: 'DRAFT', toStatus: 'UNDER_REVIEW' }, req.ip)

      return sendSuccess(res, updated, 'Form submitted for review')
    } catch (err) {
      console.error('[POST /forms/:id/submit-review]', err)
      return sendError(res, 'Failed to submit for review')
    }
  }
)

// â”€â”€â”€ POST /api/forms/:id/approve â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// UNDER_REVIEW â†’ APPROVED  (ADMIN / APPROVER)
router.post(
  '/:id/approve',
  authenticate,
  authorize('ADMIN', 'APPROVER', 'SUPER_ADMIN'),
  async (req: AuthRequest, res: Response) => {
    try {
      const form = await getForm(req.params.id as string)
      if (!form) return sendError(res, 'Form not found', 404)
      if (form.status !== 'UNDER_REVIEW') {
        return sendError(res, `Cannot approve from status: ${form.status}`, 400)
      }
      if (!form.currentVersionId) return sendError(res, 'No current version found', 400)

      const updated = await prisma.form.update({
        where: { id: form.id },
        data: { status: 'APPROVED' },
      })

      await prisma.formVersion.update({
        where: { id: form.currentVersionId },
        data: { status: 'APPROVED', approvedBy: req.user!.id },
      })

      await recordApproval(form.id, form.currentVersionId, req.user!.id, 'APPROVE', req.body.comment)
      await logAudit(req.user!.id, 'APPROVE', form.id, { fromStatus: 'UNDER_REVIEW', toStatus: 'APPROVED', comment: req.body.comment }, req.ip)

      return sendSuccess(res, updated, 'Form approved')
    } catch (err) {
      console.error('[POST /forms/:id/approve]', err)
      return sendError(res, 'Failed to approve form')
    }
  }
)

// â”€â”€â”€ POST /api/forms/:id/reject â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// UNDER_REVIEW â†’ DRAFT with comment  (ADMIN / APPROVER)
router.post(
  '/:id/reject',
  authenticate,
  authorize('ADMIN', 'APPROVER', 'SUPER_ADMIN'),
  async (req: AuthRequest, res: Response) => {
    try {
      const form = await getForm(req.params.id as string)
      if (!form) return sendError(res, 'Form not found', 404)
      if (form.status !== 'UNDER_REVIEW') {
        return sendError(res, `Cannot reject from status: ${form.status}`, 400)
      }
      if (!form.currentVersionId) return sendError(res, 'No current version found', 400)

      const updated = await prisma.form.update({
        where: { id: form.id },
        data: { status: 'DRAFT' },
      })

      await prisma.formVersion.update({
        where: { id: form.currentVersionId },
        data: { status: 'DRAFT' },
      })

      await recordApproval(form.id, form.currentVersionId, req.user!.id, 'REJECT', req.body.comment)
      await logAudit(req.user!.id, 'REJECT', form.id, { fromStatus: 'UNDER_REVIEW', toStatus: 'DRAFT', comment: req.body.comment }, req.ip)

      return sendSuccess(res, updated, 'Form rejected and returned to draft')
    } catch (err) {
      console.error('[POST /forms/:id/reject]', err)
      return sendError(res, 'Failed to reject form')
    }
  }
)

// â”€â”€â”€ POST /api/forms/:id/publish â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// APPROVED â†’ PUBLISHED  (ADMIN)
router.post(
  '/:id/publish',
  authenticate,
  authorize('ADMIN', 'SUPER_ADMIN'),
  async (req: AuthRequest, res: Response) => {
    try {
      const form = await getForm(req.params.id as string)
      if (!form) return sendError(res, 'Form not found', 404)
      if (form.status !== 'APPROVED') {
        return sendError(res, `Cannot publish from status: ${form.status}`, 400)
      }
      if (!form.currentVersionId) return sendError(res, 'No current version found', 400)

      const now = new Date()

      const updated = await prisma.form.update({
        where: { id: form.id },
        data: { status: 'PUBLISHED' },
      })

      await prisma.formVersion.update({
        where: { id: form.currentVersionId },
        data: { status: 'PUBLISHED', publishedAt: now },
      })

      await recordApproval(form.id, form.currentVersionId, req.user!.id, 'PUBLISH')
      await logAudit(req.user!.id, 'PUBLISH', form.id, { fromStatus: 'APPROVED', toStatus: 'PUBLISHED', publishedAt: now }, req.ip)

      return sendSuccess(res, updated, 'Form published')
    } catch (err) {
      console.error('[POST /forms/:id/publish]', err)
      return sendError(res, 'Failed to publish form')
    }
  }
)

// â”€â”€â”€ POST /api/forms/:id/activate â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// PUBLISHED â†’ ACTIVE  (ADMIN)
router.post(
  '/:id/activate',
  authenticate,
  authorize('ADMIN', 'SUPER_ADMIN'),
  async (req: AuthRequest, res: Response) => {
    try {
      const form = await getForm(req.params.id as string)
      if (!form) return sendError(res, 'Form not found', 404)
      if (form.status !== 'PUBLISHED') {
        return sendError(res, `Cannot activate from status: ${form.status}`, 400)
      }

      const updated = await prisma.form.update({
        where: { id: form.id },
        data: { status: 'ACTIVE' },
      })

      if (form.currentVersionId) {
        await recordApproval(form.id, form.currentVersionId, req.user!.id, 'ACTIVATE')
      }
      await logAudit(req.user!.id, 'ACTIVATE', form.id, { fromStatus: 'PUBLISHED', toStatus: 'ACTIVE' }, req.ip)

      return sendSuccess(res, updated, 'Form activated')
    } catch (err) {
      console.error('[POST /forms/:id/activate]', err)
      return sendError(res, 'Failed to activate form')
    }
  }
)

// â”€â”€â”€ POST /api/forms/:id/deactivate â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// ACTIVE â†’ DEACTIVATED  (ADMIN)
router.post(
  '/:id/deactivate',
  authenticate,
  authorize('ADMIN', 'SUPER_ADMIN'),
  async (req: AuthRequest, res: Response) => {
    try {
      const form = await getForm(req.params.id as string)
      if (!form) return sendError(res, 'Form not found', 404)
      if (form.status !== 'ACTIVE') {
        return sendError(res, `Cannot deactivate from status: ${form.status}`, 400)
      }

      const updated = await prisma.form.update({
        where: { id: form.id },
        data: { status: 'DEACTIVATED' },
      })

      if (form.currentVersionId) {
        await recordApproval(form.id, form.currentVersionId, req.user!.id, 'DEACTIVATE', req.body.comment)
      }
      await logAudit(req.user!.id, 'DEACTIVATE', form.id, { fromStatus: 'ACTIVE', toStatus: 'DEACTIVATED', comment: req.body.comment }, req.ip)

      return sendSuccess(res, updated, 'Form deactivated')
    } catch (err) {
      console.error('[POST /forms/:id/deactivate]', err)
      return sendError(res, 'Failed to deactivate form')
    }
  }
)

// â”€â”€â”€ POST /api/forms/:id/archive â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Any status â†’ ARCHIVED  (ADMIN / SUPER_ADMIN)
router.post(
  '/:id/archive',
  authenticate,
  authorize('ADMIN', 'SUPER_ADMIN'),
  async (req: AuthRequest, res: Response) => {
    try {
      const form = await getForm(req.params.id as string)
      if (!form) return sendError(res, 'Form not found', 404)
      if (form.status === 'ARCHIVED') {
        return sendError(res, 'Form is already archived', 400)
      }

      const prevStatus = form.status

      const updated = await prisma.form.update({
        where: { id: form.id },
        data: { status: 'ARCHIVED' },
      })

      if (form.currentVersionId) {
        await recordApproval(form.id, form.currentVersionId, req.user!.id, 'ARCHIVE', req.body.comment)
      }
      await logAudit(req.user!.id, 'ARCHIVE', form.id, { fromStatus: prevStatus, toStatus: 'ARCHIVED', comment: req.body.comment }, req.ip)

      return sendSuccess(res, updated, 'Form archived')
    } catch (err) {
      console.error('[POST /forms/:id/archive]', err)
      return sendError(res, 'Failed to archive form')
    }
  }
)

export default router
