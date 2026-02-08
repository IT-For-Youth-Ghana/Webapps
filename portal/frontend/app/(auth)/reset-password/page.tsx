/**
 * Reset Password Page
 * /reset-password
 * 
 * Allows user to reset password using token from email
 */

'use client'

import React, { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { useResetPassword } from '@/hooks/use-password' // Assuming the hooks file is named use-auth-flow or similar
import { Lock, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const { resetPassword, isLoading, error } = useResetPassword()

  const token = searchParams.get('token')

  const [formData, setFormData] = useState({
    password: '',
    passwordConfirm: '',
  })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  useState(() => {
    if (!token) {
      toast({
        title: 'Invalid link',
        description: 'Please use the link from your email',
        variant: 'destructive',
      })
      router.push('/forgot-password')
    }
  })

  const validateForm = () => {
    const errors: Record<string, string> = {}

    if (!formData.password) {
      errors.password = 'Password is required'
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters'
    }

    if (!formData.passwordConfirm) {
      errors.passwordConfirm = 'Confirm password is required'
    } else if (formData.password !== formData.passwordConfirm) {
      errors.passwordConfirm = 'Passwords do not match'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm() || !token) {
      return
    }

    try {
      await resetPassword({
        token,
        password: formData.password,
        passwordConfirm: formData.passwordConfirm,
      })
      toast({
        title: 'Password reset',
        description: 'Your password has been updated successfully',
      })
      router.push('/login')
    } catch (err) {
      // Error is handled in hook
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
              Reset Password
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Enter your new password
            </p>
          </motion.div>

          <form onSubmit={handleSubmit}>
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-6"
            >
              {/* Password Field */}
              <motion.div variants={childVariants}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type="password"
                    name="password"
                    placeholder="********"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={isLoading}
                    className={`pl-10 bg-transparent border-b-2 rounded-none transition-all duration-300 ${
                      formErrors.password 
                        ? 'border-red-500' 
                        : 'border-gray-300 dark:border-gray-600 focus:border-blue-600 dark:focus:border-blue-400'
                    } focus:ring-0`}
                  />
                </div>
                {formErrors.password && (
                  <p className="text-xs text-red-500 mt-1">{formErrors.password}</p>
                )}
              </motion.div>

              {/* Confirm Password Field */}
              <motion.div variants={childVariants}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type="password"
                    name="passwordConfirm"
                    placeholder="********"
                    value={formData.passwordConfirm}
                    onChange={handleChange}
                    disabled={isLoading}
                    className={`pl-10 bg-transparent border-b-2 rounded-none transition-all duration-300 ${
                      formErrors.passwordConfirm 
                        ? 'border-red-500' 
                        : 'border-gray-300 dark:border-gray-600 focus:border-blue-600 dark:focus:border-blue-400'
                    } focus:ring-0`}
                  />
                </div>
                {formErrors.passwordConfirm && (
                  <p className="text-xs text-red-500 mt-1">{formErrors.passwordConfirm}</p>
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
                  {isLoading ? 'Resetting...' : (
                    <span className="flex items-center justify-center gap-2">
                      Reset Password
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
            transition={{ delay: 0.6, duration: 0.4 }}
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