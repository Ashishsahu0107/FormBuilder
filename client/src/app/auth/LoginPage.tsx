import { useState } from 'react'
import { useAuth } from '@/lib/auth/AuthContext'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2 } from 'lucide-react'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    try {
      await login(email, password)
      navigate('/')
    } catch (err: any) {
      const data = err.response?.data
      if (data?.errors) {
        const firstError = Object.values(data.errors)[0] as string[]
        setError(firstError[0] || 'Validation failed')
      } else {
        setError(data?.message || 'Login failed')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring' as const,
        damping: 25,
        stiffness: 300,
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, damping: 25, stiffness: 300 } }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-cover bg-center relative overflow-hidden" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80")' }}>
      
      {/* Decorative background shapes */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/60 to-black/80 backdrop-blur-sm" />
      

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="z-10 w-full max-w-md px-4"
      >
        <Card className="w-full shadow-2xl border-white/10 bg-white/10 backdrop-blur-md text-white">
          <CardHeader className="space-y-1 pb-6 text-center">
            <motion.div variants={itemVariants}>
              <div className="mx-auto bg-gradient-to-br from-indigo-400 to-purple-600 w-12 h-12 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-indigo-500/30">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-white"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>
              </div>
              <CardTitle className="text-2xl font-bold tracking-tight text-white">Welcome Back</CardTitle>
              <CardDescription className="text-indigo-100/80">Sign in to your Form Builder account</CardDescription>
            </motion.div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <motion.div variants={itemVariants} className="space-y-2">
                <Label htmlFor="email" className="text-indigo-50">Email</Label>
                <div className="relative">
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="name@example.com"
                    value={email} 
                    onChange={e => setEmail(e.target.value)} 
                    required 
                    className="pl-10 bg-white/20 border-white/20 text-white placeholder:text-white/50 focus:bg-white/30 transition-colors"
                  />
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-2.5 h-5 w-5 text-indigo-200"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                </div>
              </motion.div>
              
              <motion.div variants={itemVariants} className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-indigo-50">Password</Label>
                  <a href="#" onClick={(e) => { e.preventDefault(); navigate('/forgot-password') }} className="text-xs font-medium text-indigo-300 hover:text-indigo-200 hover:underline">Forgot password?</a>
                </div>
                <div className="relative">
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="Enter your password"
                    value={password} 
                    onChange={e => setPassword(e.target.value)} 
                    required 
                    className="pl-10 bg-white/20 border-white/20 text-white placeholder:text-white/50 focus:bg-white/30 transition-colors"
                  />
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-2.5 h-5 w-5 text-indigo-200"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                </div>
              </motion.div>

              <AnimatePresence>
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                    animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                    className="text-sm text-red-200 bg-red-900/50 p-3 rounded-md border border-red-500/30 flex items-start gap-2 overflow-hidden"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 mt-0.5 shrink-0"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    <p>{error}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.div variants={itemVariants} className="pt-2">
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-white shadow-lg transition-all duration-200 border-0"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : 'Sign In'}
                </Button>
              </motion.div>
            </form>
          </CardContent>
          <CardFooter className="justify-center border-t border-white/10 mt-2 pt-6 pb-6">
            <motion.div variants={itemVariants} className="text-sm text-indigo-100/70">
              Don't have an account?{' '}
              <button onClick={() => navigate('/register')} className="font-semibold text-indigo-300 hover:text-indigo-200 hover:underline transition-colors">
                Create one now
              </button>
            </motion.div>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  )
}