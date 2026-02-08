/**
 * Registration Step 2 - Email Verification
 * /register/step2
 * 
 * Redesigned with luxurious and professional aesthetics:
 * - Elegant typography and spacious layout
 * - Subtle animations for smooth transitions and sequential field reveals
 * - Minimalist design with premium feel using soft gradients and metallic accents
 * - Replaced particle background with subtle animated gradient background
 * - Sequential animations for OTP fields
 */

'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { useVerifyEmail } from '@/hooks/use-auth-flow'
import { 
  Mail, 
  CheckCircle2, 
  ArrowRight, 
  RefreshCw, 
  Sparkles,
  Lock,
  ShieldCheck
} from 'lucide-react'
import { motion, AnimatePresence, stagger } from 'framer-motion'

type ScreenType = 'email-sent' | 'verify-code'

export default function RegisterStep2Page() {
  const router = useRouter()
  const { toast } = useToast()
  const { verifyEmail, isLoading } = useVerifyEmail()

  const [screen, setScreen] = useState<ScreenType>('email-sent')
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [email, setEmail] = useState('')
  const [resendCountdown, setResendCountdown] = useState(60)
  const [isResending, setIsResending] = useState(false)
  const [firstName, setFirstName] = useState('')

  // Load email from session storage on mount
  useEffect(() => {
    const storedEmail = sessionStorage.getItem('registration_email')
    const storedFirstName = sessionStorage.getItem('registration_firstName')
    
    if (!storedEmail) {
      toast({
        title: 'Session expired',
        description: 'Please start registration again',
        variant: 'destructive',
      })
      router.push('/register')
      return
    }
    
    setEmail(storedEmail)
    setFirstName(storedFirstName || '')
  }, [router, toast])

  // Handle resend countdown
  useEffect(() => {
    if (screen === 'verify-code' && resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendCountdown, screen])

  // Auto-advance to verification screen after 3 seconds
  useEffect(() => {
    if (screen === 'email-sent') {
      const timer = setTimeout(() => {
        setScreen('verify-code')
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [screen])

  // OTP input handler with auto-focus
  const handleCodeChange = (index: number, value: string) => {
    const newCode = [...code]
    
    // Only allow numbers
    if (value && !/^\d$/.test(value)) return
    
    newCode[index] = value
    setCode(newCode)

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`)
      nextInput?.focus()
    }

    // Auto-submit when all 6 digits are entered
    if (index === 5 && value && newCode.every(digit => digit !== '')) {
      handleSubmit(newCode.join(''))
    }
  }

  // Handle backspace
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`)
      prevInput?.focus()
    }
  }

  // Handle paste
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    const newCode = pastedData.split('')
    
    // Fill remaining slots with empty strings
    while (newCode.length < 6) {
      newCode.push('')
    }
    
    setCode(newCode)
    
    // Focus last filled input or first empty
    const focusIndex = Math.min(pastedData.length, 5)
    const input = document.getElementById(`code-${focusIndex}`)
    input?.focus()

    // Auto-submit if all 6 digits pasted
    if (pastedData.length === 6) {
      handleSubmit(pastedData)
    }
  }

  const handleSubmit = async (codeString?: string) => {
    const finalCode = codeString || code.join('')

    if (finalCode.length !== 6) {
      toast({
        title: 'Invalid code',
        description: 'Please enter all 6 digits',
        variant: 'destructive',
      })
      return
    }

    try {
      const response = await verifyEmail({
        email,
        code: finalCode,
      })

      toast({
        title: 'Email verified! ✨',
        description: 'Redirecting to complete your profile...',
      })

      console.log('Verification response:', response)

      // Store temp token for next step
      if (response?.tempToken) {
        sessionStorage.setItem('registration_tempToken', response.tempToken)
      }

      // Navigate to step 3
      setTimeout(() => {
        router.push('/register/step3')
      }, 1000)
    } catch (err) {
      // Clear code on error
      setCode(['', '', '', '', '', ''])
      document.getElementById('code-0')?.focus()

      const errorMessage = err instanceof Error ? err.message : 'Verification failed'
      toast({
        title: 'Verification failed',
        description: errorMessage,
        variant: 'destructive',
      })
    }
  }

  const handleResendCode = async () => {
    if (resendCountdown > 0) return

    setIsResending(true)
    try {
      // Call API to resend code
      const response = await fetch('/api/auth/resend-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (!response.ok) {
        throw new Error('Failed to resend code')
      }

      toast({
        title: 'Code sent! 📧',
        description: `A new verification code has been sent to ${email}`,
      })

      setResendCountdown(60)
    } catch (err) {
      toast({
        title: 'Failed to resend',
        description: 'Please try again in a moment',
        variant: 'destructive',
      })
    } finally {
      setIsResending(false)
    }
  }

  const skipToVerification = () => {
    setScreen('verify-code')
  }

  return (
    <main className="relative w-full min-h-screen overflow-hidden flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Subtle animated gradient background */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-r from-blue-50/20 via-purple-50/20 to-blue-50/20 dark:from-blue-950/20 dark:via-purple-950/20 dark:to-blue-950/20"
        animate={{
          backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'linear',
        }}
        style={{ backgroundSize: '200% 200%' }}
      />

      <AnimatePresence mode="wait">
        {screen === 'email-sent' && (
          <EmailSentScreen
            key="email-sent"
            email={email}
            firstName={firstName}
            onSkip={skipToVerification}
          />
        )}

        {screen === 'verify-code' && (
          <VerifyCodeScreen
            key="verify-code"
            email={email}
            firstName={firstName}
            code={code}
            isLoading={isLoading}
            resendCountdown={resendCountdown}
            isResending={isResending}
            onCodeChange={handleCodeChange}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            onSubmit={() => handleSubmit()}
            onResend={handleResendCode}
            onBack={() => router.push('/register')}
          />
        )}
      </AnimatePresence>
    </main>
  )
}

// Email Sent Confirmation Screen
function EmailSentScreen({ 
  email, 
  firstName,
  onSkip 
}: { 
  email: string
  firstName: string
  onSkip: () => void 
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="relative z-10 w-full max-w-md mx-4"
    >
      <Card className="p-10 border-none shadow-xl bg-white/90 dark:bg-gray-900/90 backdrop-blur-md">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, type: 'spring', stiffness: 150 }}
          className="flex justify-center mb-8"
        >
          <div className="relative w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
            <Mail className="w-10 h-10 text-white" strokeWidth={2} />
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, duration: 0.3 }}
              className="absolute -bottom-1 -right-1 w-8 h-8 bg-white dark:bg-gray-900 rounded-full flex items-center justify-center shadow-md border border-gray-200 dark:border-gray-700"
            >
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            </motion.div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="text-center space-y-4"
        >
          <h1 className="text-2xl font-serif font-bold text-gray-900 dark:text-white">
            Verification Email Sent
          </h1>
          
          <div className="space-y-2">
            <p className="text-base text-gray-600 dark:text-gray-300">
              Dear {firstName}, we've dispatched a verification code to
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-md">
              <Mail className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="font-medium text-gray-900 dark:text-white">
                {email}
              </span>
            </div>
          </div>

          <p className="text-sm text-gray-500 dark:text-gray-400 pt-2">
            Kindly check your inbox (including spam) for the 6-digit code.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="mt-8 flex justify-center"
        >
          <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse" />
          <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse mx-2" style={{ animationDelay: '0.2s' }} />
          <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="mt-6 text-center"
        >
          <button
            onClick={onSkip}
            className="text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors inline-flex items-center gap-1"
          >
            Proceed to enter code
            <ArrowRight className="w-3 h-3" />
          </button>
        </motion.div>
      </Card>
    </motion.div>
  )
}

// OTP Verification Screen
function VerifyCodeScreen({
  email,
  firstName,
  code,
  isLoading,
  resendCountdown,
  isResending,
  onCodeChange,
  onKeyDown,
  onPaste,
  onSubmit,
  onResend,
  onBack,
}: {
  email: string
  firstName: string
  code: string[]
  isLoading: boolean
  resendCountdown: number
  isResending: boolean
  onCodeChange: (index: number, value: string) => void
  onKeyDown: (index: number, e: React.KeyboardEvent<HTMLInputElement>) => void
  onPaste: (e: React.ClipboardEvent) => void
  onSubmit: () => void
  onResend: () => void
  onBack: () => void
}) {
  const allFilled = code.every(digit => digit !== '')

  const inputVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="relative z-10 w-full max-w-md mx-4"
    >
      <Card className="p-10 border-none shadow-xl bg-white/90 dark:bg-gray-900/90 backdrop-blur-md">
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, type: 'spring' }}
            className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl mb-6 shadow-md"
          >
            <ShieldCheck className="w-8 h-8 text-white" strokeWidth={2} />
          </motion.div>

          <h1 className="text-2xl font-serif font-bold text-gray-900 dark:text-white mb-2">
            Verify Your Email
          </h1>
          
          <p className="text-gray-600 dark:text-gray-300 mb-1">
            Code sent to
          </p>
          <div className="inline-flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white">
            <Mail className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            {email}
          </div>
        </div>

        {/* OTP Input */}
        <div className="mb-8">
          <motion.div 
            className="flex justify-center gap-4 mb-6" 
            onPaste={onPaste}
            variants={{
              visible: {
                transition: {
                  staggerChildren: 0.1
                }
              }
            }}
            initial="hidden"
            animate="visible"
          >
            {code.map((digit, index) => (
              <motion.div
                key={index}
                variants={inputVariants}
              >
                <Input
                  id={`code-${index}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => onCodeChange(index, e.target.value)}
                  onKeyDown={(e) => onKeyDown(index, e)}
                  disabled={isLoading}
                  className={`
                    w-12 h-12 text-center text-xl font-medium
                    bg-transparent border-b-2 rounded-none
                    transition-all duration-300
                    ${digit 
                      ? 'border-blue-600 dark:border-blue-400' 
                      : 'border-gray-300 dark:border-gray-600'
                    }
                    focus:border-blue-600 focus:ring-0
                    disabled:opacity-50 disabled:cursor-not-allowed
                  `}
                  autoFocus={index === 0}
                />
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.3 }}
            className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400"
          >
            <Lock className="w-4 h-4" />
            <span>Enter the 6-digit verification code</span>
          </motion.div>
        </div>

        {/* Submit Button */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button
            onClick={onSubmit}
            disabled={!allFilled || isLoading}
            className="w-full h-12 text-base font-medium bg-blue-600 hover:bg-blue-700 text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin" />
                Verifying
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Verify & Proceed
              </span>
            )}
          </Button>
        </motion.div>

        {/* Resend Code */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="mt-6 text-center space-y-4"
        >
          <div className="flex items-center justify-center gap-2">
            <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
            <span className="text-xs text-gray-400 dark:text-gray-500">OR</span>
            <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
          </div>

          <button
            onClick={onResend}
            disabled={resendCountdown > 0 || isResending}
            className={`
              text-sm font-medium transition-colors
              ${resendCountdown > 0 || isResending
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300'
              }
            `}
          >
            {resendCountdown > 0
              ? `Resend in ${resendCountdown}s`
              : isResending
                ? 'Sending...'
                : 'Resend Code'}
          </button>
        </motion.div>

        {/* Back Link */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="mt-6 text-center"
        >
          <button
            onClick={onBack}
            className="text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            ← Return to Registration
          </button>
        </motion.div>
      </Card>

      {/* Security Badge */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.4 }}
        className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-500 dark:text-gray-400"
      >
        <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        <span>Secure Verification by ITFY</span>
      </motion.div>
    </motion.div>
  )
}