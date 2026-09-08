import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'
import rateLimit from 'express-rate-limit'

import { connectMongoDB } from '@/config/mongodb'
import { prisma } from '@/lib/prisma'
import { errorHandler, notFound } from '@/middleware/error.middleware'
import { config } from '@/config'

// ─── Route modules ────────────────────────────────────────────────────────────
import authRoutes from '@/modules/auth/auth.routes'
import formsRoutes from '@/modules/forms/forms.routes'
import versionsRoutes from '@/modules/versions/versions.routes'
import workflowRoutes from '@/modules/workflow/workflow.routes'
import publicRoutes from '@/modules/public/public.routes'

const app = express()

// ─── Security Middleware ──────────────────────────────────────────────────────
app.use(helmet())
app.use(
  cors({
    origin: config.clientUrl,
    credentials: true,
  })
)

// ─── Rate Limiting ────────────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { success: false, message: 'Too many requests, please try again later.' },
})
app.use('/api', limiter)

// ─── General Middleware ───────────────────────────────────────────────────────
app.use(morgan(config.nodeEnv === 'development' ? 'dev' : 'combined'))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    message: 'Form Builder API is running 🚀',
    timestamp: new Date().toISOString(),
    env: config.nodeEnv,
  })
})

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes)
app.use('/api/forms', formsRoutes)
app.use('/api/forms', versionsRoutes)    // nested: /api/forms/:id/versions
app.use('/api/forms', workflowRoutes)    // nested: /api/forms/:id/submit-review|approve|etc.
app.use('/api/public', publicRoutes)     // /api/public/forms/:slug

// ─── Error Handling ───────────────────────────────────────────────────────────
app.use(notFound)
app.use(errorHandler)

// ─── Start Server ─────────────────────────────────────────────────────────────
const start = async () => {
  try {
    // Connect MongoDB
    await connectMongoDB()

    // Test Prisma (PostgreSQL) connection
    await prisma.$connect()
    console.log('✅ PostgreSQL connected via Prisma')

    app.listen(config.port, () => {
      console.log(`\n🚀 Server running on http://localhost:${config.port}`)
      console.log(`📊 Environment: ${config.nodeEnv}`)
      console.log(`🌐 Client URL: ${config.clientUrl}\n`)
    })
  } catch (error) {
    console.error('❌ Failed to start server:', error)
    process.exit(1)
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect()
  console.log('\n🛑 Server stopped gracefully')
  process.exit(0)
})

start()
