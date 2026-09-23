import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'
import rateLimit from 'express-rate-limit'

import { connectMongoDB } from '@/config/mongodb'
import { errorHandler, notFound } from '@/middleware/error.middleware'
import { config } from '@/config'


import authRoutes from '@/modules/auth/auth.routes'
import formsRoutes from '@/modules/forms/forms.routes'
import versionsRoutes from '@/modules/versions/versions.routes'
import workflowRoutes from '@/modules/workflow/workflow.routes'
import publicRoutes from '@/modules/public/public.routes'
import submissionsRoutes from '@/modules/submissions/submissions.routes'
import templatesRoutes from '@/modules/templates/templates.routes'

const app = express()


app.use(helmet())
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || origin === config.clientUrl || origin.startsWith('http://localhost:')) {
        callback(null, true)
      } else {
        callback(new Error('Not allowed by CORS'))
      }
    },
    credentials: true,
  })
)


const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { success: false, message: 'Too many requests, please try again later.' },
})
app.use('/api', limiter)


app.use(morgan(config.nodeEnv === 'development' ? 'dev' : 'combined'))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())


app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    message: 'Form Builder API is running ',
    timestamp: new Date().toISOString(),
    env: config.nodeEnv,
  })
})


app.get('/', (_req, res) => {
  res.json({ success: true, message: 'Welcome to Form Builder API!' })
})

app.use('/api/auth', authRoutes)
app.use('/api/forms', formsRoutes)
app.use('/api/forms', versionsRoutes)    // nested: /api/forms/:id/versions
app.use('/api/forms', workflowRoutes)
app.use('/api/forms/:id/submissions', submissionsRoutes)
app.use('/api/templates', templatesRoutes)    // nested: /api/forms/:id/submit-review|approve|etc.
app.use('/api/public', publicRoutes)     // /api/public/forms/:slug

app.use(notFound)
app.use(errorHandler)

const start = async () => {
  try {
    // Connect MongoDB
    await connectMongoDB()



    app.listen(config.port, () => {
      console.log(`Server running on http://localhost:${config.port}`)
      console.log(`Environment: ${config.nodeEnv}`)
      console.log(`Client URL: ${config.clientUrl}\n`)
    })
  } catch (error) {
    console.error('Failed to start server:', error)
    process.exit(1)
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {

  console.log('Server stopped gracefully')
  process.exit(0)
})

start()
