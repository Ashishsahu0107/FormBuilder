import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { Form } from '@/models/Form.model'
import { FormVersion } from '@/models/FormVersion.model'
import { validate } from '@/middleware/validate.middleware'
import { authenticate, AuthRequest } from '@/middleware/auth.middleware'
import { sendSuccess, sendError, sendPaginated } from '@/utils/response'
import slugify from 'slugify'
import { v4 as uuidv4 } from 'uuid'

const router = Router()

const createFormSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  category: z.string().optional(),
})

const updateFormSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
})

// --- POST /api/forms ---
router.post('/', authenticate, validate(createFormSchema), async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, category } = req.body
    
    // Generate unique slug
    let baseSlug = slugify(title, { lower: true, strict: true })
    if (!baseSlug) baseSlug = 'form'
    let slug = baseSlug
    let counter = 1
    while (await Form.findOne({ slug })) {
      slug = `${baseSlug}-${counter}`
      counter++
    }
    
    // Create Form
    const form = await Form.create({
      title,
      slug,
      description,
      category,
      createdBy: req.user!.id
    })

    // Create Initial Draft Version
    const version = await FormVersion.create({
      formId: form.id,
      versionNumber: 1,
      createdBy: req.user!.id,
      schema: {
        id: uuidv4(),
        version: 1,
        title,
        description: description || '',
        settings: {
          submitButtonText: 'Submit',
          successMessage: 'Thank you for your submission!',
          isMultiStep: false
        },
        sections: [{ id: uuidv4(), title: '', fields: [] }],
        logic: []
      }
    })

    // Update form with current version
    await Form.findByIdAndUpdate(form.id, { currentVersionId: version.id })

    const updatedForm = await Form.findById(form.id).populate('currentVersionId')
    
    return sendSuccess(res, updatedForm, 'Form created successfully', 201)
  } catch (error) {
    console.error('[POST /forms]', error)
    return sendError(res, 'Failed to create form')
  }
})

// --- GET /api/forms ---
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 10
    const status = req.query.status as string
    const search = req.query.search as string

    const query: any = { deletedAt: null }
    
    // Non-admins can only see their own forms
    if (req.user!.role !== 'ADMIN' && req.user!.role !== 'SUPER_ADMIN') {
      query.createdBy = req.user!.id
    }
    
    if (status) query.status = status
    if (search) {
      query.title = { $regex: search, $options: 'i' }
    }

    const forms = await Form.find(query)
      .sort({ updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('createdBy', 'name email')
      .populate('currentVersionId', 'versionNumber status')

    const total = await Form.countDocuments(query)

    return sendPaginated(res, forms, total, page, limit)
  } catch (error) {
    console.error('[GET /forms]', error)
    return sendError(res, 'Failed to fetch forms')
  }
})

// --- GET /api/forms/:id ---
router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const form = await Form.findOne({ _id: req.params.id, deletedAt: null })
      .populate('createdBy', 'name email')
      .populate('currentVersionId')
      
    if (!form) return sendError(res, 'Form not found', 404)
      
    // Security check
    if (req.user!.role !== 'ADMIN' && req.user!.role !== 'SUPER_ADMIN' && form.createdBy.toString() !== req.user!.id) {
      return sendError(res, 'Unauthorized to view this form', 403)
    }

    return sendSuccess(res, form)
  } catch (error) {
    console.error('[GET /forms/:id]', error)
    return sendError(res, 'Failed to fetch form')
  }
})

// --- PATCH /api/forms/:id ---
router.patch('/:id', authenticate, validate(updateFormSchema), async (req: AuthRequest, res: Response) => {
  try {
    const form = await Form.findOne({ _id: req.params.id, deletedAt: null })
    if (!form) return sendError(res, 'Form not found', 404)
      
    if (req.user!.role !== 'ADMIN' && req.user!.role !== 'SUPER_ADMIN' && form.createdBy.toString() !== req.user!.id) {
      return sendError(res, 'Unauthorized to edit this form', 403)
    }

    Object.assign(form, req.body)
    await form.save()

    return sendSuccess(res, form, 'Form updated successfully')
  } catch (error) {
    console.error('[PATCH /forms/:id]', error)
    return sendError(res, 'Failed to update form')
  }
})

// --- DELETE /api/forms/:id ---
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const form = await Form.findOne({ _id: req.params.id, deletedAt: null })
    if (!form) return sendError(res, 'Form not found', 404)
      
    if (req.user!.role !== 'ADMIN' && req.user!.role !== 'SUPER_ADMIN' && form.createdBy.toString() !== req.user!.id) {
      return sendError(res, 'Unauthorized to delete this form', 403)
    }

    form.deletedAt = new Date()
    await form.save()

    return sendSuccess(res, null, 'Form deleted successfully')
  } catch (error) {
    console.error('[DELETE /forms/:id]', error)
    return sendError(res, 'Failed to delete form')
  }
})

export default router