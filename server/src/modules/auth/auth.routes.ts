import { Router, Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import { User } from '@/models/User.model'
import { validate } from '@/middleware/validate.middleware'
import { authenticate, AuthRequest } from '@/middleware/auth.middleware'
import { sendSuccess, sendError } from '@/utils/response'
import { config } from '@/config'
import { sendEmail } from '@/utils/email'

const router = Router()

// --- Validation Schemas ---

const registerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email(),
  password: z.string().min(4, 'Password must be at least 4 characters'),
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

// --- POST /api/auth/register ---
router.post('/register', validate(registerSchema), async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body
    const existing = await User.findOne({ email })
    if (existing) {
      return sendError(res, 'Email already registered', 409)
    }
    const hashed = await bcrypt.hash(password, 12)
    const user = await User.create({ name, email, password: hashed })
    
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn as any }
    )
    
    // Convert to JSON and remove password
    const userJson = user.toJSON()
    
    return sendSuccess(res, { user: userJson, token }, 'Registered successfully', 201)
  } catch (error) {
    console.error('[POST /auth/register]', error)
    return sendError(res, 'Registration failed')
  }
})

// --- POST /api/auth/login ---
router.post('/login', validate(loginSchema), async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ email })
    if (!user || !(await bcrypt.compare(password, user.password || ''))) {
      return sendError(res, 'Invalid credentials', 401)
    }
    if (!user.isActive) {
      return sendError(res, 'Account is deactivated', 403)
    }
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn as any }
    )
    
    const userJson = user.toJSON()
    
    return sendSuccess(res, { user: userJson, token })
  } catch (error) {
    console.error('[POST /auth/login]', error)
    return sendError(res, 'Login failed')
  }
})

// --- GET /api/auth/me ---
router.get('/me', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user!.id)
    if (!user) return sendError(res, 'User not found', 404)
    return sendSuccess(res, user.toJSON())
  } catch (error) {
    console.error('[GET /auth/me]', error)
    return sendError(res, 'Failed to fetch user')
  }
})

const forgotPasswordSchema = z.object({
  email: z.string().email(),
})

const resetPasswordSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6, 'OTP must be 6 digits'),
  password: z.string().min(4, 'Password must be at least 4 characters'),
})

router.post('/forgot-password', validate(forgotPasswordSchema), async (req: Request, res: Response) => {
  try {
    const { email } = req.body
    const user = await User.findOne({ email })
    if (!user) {
      return sendSuccess(res, null, 'If an account exists, a password reset link has been sent')
    }
    
    const resetToken = Math.floor(100000 + Math.random() * 900000).toString()
    const resetTokenExpiry = new Date(Date.now() + 1 * 60 * 60 * 1000) // 1 hour
    
    await User.findByIdAndUpdate(user.id, { resetToken, resetTokenExpiry })
    
    const emailSent = await sendEmail(
      email,
      'Password Reset OTP',
      `Your OTP for password reset is: ${resetToken}. It is valid for 1 hour.`
    )

    if (!emailSent) {
      return sendError(res, 'Failed to send OTP email', 500)
    }
    
    return sendSuccess(res, null, 'OTP sent successfully to your email')
  } catch (error) {
    console.error('[POST /auth/forgot-password]', error)
    return sendError(res, 'Failed to process forgot password request')
  }
})

router.post('/reset-password', validate(resetPasswordSchema), async (req: Request, res: Response) => {
  try {
    const { email, otp, password } = req.body
    const user = await User.findOne({
      email: email,
      resetToken: otp,
      resetTokenExpiry: { $gt: new Date() }
    })
    
    if (!user) {
      return sendError(res, 'Invalid or expired OTP', 400)
    }
    
    const hashed = await bcrypt.hash(password, 12)
    await User.findByIdAndUpdate(user.id, {
      password: hashed,
      $unset: { resetToken: 1, resetTokenExpiry: 1 }
    })
    
    return sendSuccess(res, null, 'Password has been reset successfully')
  } catch (error) {
    console.error('[POST /auth/reset-password]', error)
    return sendError(res, 'Failed to reset password')
  }
})

export default router