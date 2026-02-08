/**
 * Forgot Password Page
 * /forgot-password
 * 
 * Allows user to request password reset via email
 */

'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { useForgotPassword } from '@/hooks/use-password' // Assuming the hooks file is named use-auth-flow or similar
import { Mail, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { forgotPassword, isLoading, error, success } = useForgotPassword()

  const [email, setEmail] = useState('')
  const [formError, setFormError] = useState('')

  const validateEmail = () => {
    if (!email) {
      setFormError('Email is required')
      return false
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFormError('Invalid email format')
      return false
    }
    setFormError('')
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateEmail()) {
      return
    }

    try {
      await forgotPassword({ email })
      toast({
        title: 'Reset link sent',
        description: `We've sent a password reset link to ${email}`,
      })
      // Optionally redirect or show success state
    } catch (err) {
      // Error is handled in hook, but can add extra handling if needed
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  }

  const childVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
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

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        <Card className="p-10 border-none shadow-xl bg-white/90 dark:bg-gray-900/90 backdrop-blur-md">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-center mb-8"
          >
            <h1 className="text-2xl font-serif font-bold text-gray-900 dark:text-white mb-2">
              Forgot Password
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Enter your email to receive a reset link
            </p>
          </motion.div>

          <form onSubmit={handleSubmit}>
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-6"
            >
              {/* Email Field */}
              <motion.div variants={childVariants}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    className={`pl-10 bg-transparent border-b-2 rounded-none transition-all duration-300 ${
                      formError 
                        ? 'border-red-500' 
                        : 'border-gray-300 dark:border-gray-600 focus:border-blue-600 dark:focus:border-blue-400'
                    } focus:ring-0`}
                  />
                </div>
                {formError && (
                  <p className="text-xs text-red-500 mt-1">{formError}</p>
                )}
              </motion.div>

              {/* Submit Button */}
              <motion.div 
                variants={childVariants}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  type="submit"
                  className="w-full h-12 text-base font-medium bg-blue-600 hover:bg-blue-700 text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isLoading}
                >
                  {isLoading ? 'Sending...' : (
                    <span className="flex items-center justify-center gap-2">
                      Send Reset Link
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  )}
                </Button>
              </motion.div>
            </motion.div>
          </form>

          {/* Back to Login */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.4 }}
            className="mt-6 text-center"
          >
            <button
              onClick={() => router.push('/login')}
              className="text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              ← Back to Login
            </button>
          </motion.div>
        </Card>
      </motion.div>
    </main>
  )
}