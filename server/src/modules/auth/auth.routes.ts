import { Router, Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { validate } from '@/middleware/validate.middleware'
import { authenticate, AuthRequest } from '@/middleware/auth.middleware'
import { sendSuccess, sendError } from '@/utils/response'
import { config } from '@/config'

const router = Router()

// ─── Validation Schemas ───────────────────────────────────────────────────────

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

// ─── POST /api/auth/register ──────────────────────────────────────────────────
router.post('/register', validate(registerSchema), async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return sendError(res, 'Email already registered', 409)
    }
    const hashed = await bcrypt.hash(password, 12)
    const user = await prisma.user.create({
      data: { name, email, password: hashed },
      select: { id: true, email: true, name: true, role: true, isActive: true, createdAt: true },
    })
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    )
    return sendSuccess(res, { user, token }, 'Registered successfully', 201)
  } catch (error) {
    console.error('[POST /auth/register]', error)
    return sendError(res, 'Registration failed')
  }
})

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
router.post('/login', validate(loginSchema), async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return sendError(res, 'Invalid credentials', 401)
    }
    if (!user.isActive) {
      return sendError(res, 'Account is deactivated', 403)
    }
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    )
    return sendSuccess(res, {
      user: { id: user.id, email: user.email, name: user.name, role: user.role, isActive: user.isActive },
      token,
    })
  } catch (error) {
    console.error('[POST /auth/login]', error)
    return sendError(res, 'Login failed')
  }
})

// ─── GET /api/auth/me ─────────────────────────────────────────────────────────
router.get('/me', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { id: true, email: true, name: true, role: true, isActive: true, createdAt: true, updatedAt: true },
    })
    if (!user) return sendError(res, 'User not found', 404)
    return sendSuccess(res, user)
  } catch (error) {
    console.error('[GET /auth/me]', error)
    return sendError(res, 'Failed to fetch user')
  }
})

export default router
