/**
 * Registration Step 1 - Email & Personal Info
 * /register
 * 
 * Redesigned with luxurious and professional aesthetics:
 * - Elegant typography and spacious layout
 * - Subtle animations for smooth transitions and sequential field reveals
 * - Minimalist design with premium feel using soft gradients and clean lines
 * - Subtle animated gradient background
 * - Sequential animations for form fields
 */

'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { useStartRegistration } from '@/hooks/use-auth-flow'
import { Mail, ArrowRight, User } from 'lucide-react'
import { motion, stagger } from 'framer-motion'

export default function RegisterStep1Page() {
  const router = useRouter()
  const { toast } = useToast()
  const { startRegistration, isLoading, error } = useStartRegistration()

  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
  })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  // Validation
  const validateForm = () => {
    const errors: Record<string, string> = {}

    if (!formData.email) {
      errors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Invalid email format'
    }

    if (!formData.firstName) {
      errors.firstName = 'First name is required'
    } else if (formData.firstName.length < 2) {
      errors.firstName = 'First name must be at least 2 characters'
    }

    if (!formData.lastName) {
      errors.lastName = 'Last name is required'
    } else if (formData.lastName.length < 2) {
      errors.lastName = 'Last name must be at least 2 characters'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    // Clear error for this field when user starts typing
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      await startRegistration(formData)

      toast({
        title: 'Verification code sent',
        description: `We've sent a verification code to ${formData.email}`,
      })

      // Store email for next step
      sessionStorage.setItem('registration_email', formData.email)
      sessionStorage.setItem('registration_firstName', formData.firstName)
      sessionStorage.setItem('registration_lastName', formData.lastName)

      // Navigate to step 2
      router.push('/register/step2')
    } catch (err) {
      const errorMessage = error?.message || (err instanceof Error ? err.message : 'Registration failed')
      toast({
        title: 'Registration failed',
        description: errorMessage,
        variant: 'destructive',
      })
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
              Create Your Account
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Step 1 of 3: Personal Information
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
                    name="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={isLoading}
                    className={`pl-10 bg-transparent border-b-2 rounded-none transition-all duration-300 ${
                      formErrors.email 
                        ? 'border-red-500' 
                        : 'border-gray-300 dark:border-gray-600 focus:border-blue-600 dark:focus:border-blue-400'
                    } focus:ring-0`}
                  />
                </div>
                {formErrors.email && (
                  <p className="text-xs text-red-500 mt-1">{formErrors.email}</p>
                )}
              </motion.div>

              {/* First Name Field */}
              <motion.div variants={childVariants}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  First Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type="text"
                    name="firstName"
                    placeholder="John"
                    value={formData.firstName}
                    onChange={handleChange}
                    disabled={isLoading}
                    className={`pl-10 bg-transparent border-b-2 rounded-none transition-all duration-300 ${
                      formErrors.firstName 
                        ? 'border-red-500' 
                        : 'border-gray-300 dark:border-gray-600 focus:border-blue-600 dark:focus:border-blue-400'
                    } focus:ring-0`}
                  />
                </div>
                {formErrors.firstName && (
                  <p className="text-xs text-red-500 mt-1">{formErrors.firstName}</p>
                )}
              </motion.div>

              {/* Last Name Field */}
              <motion.div variants={childVariants}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Last Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type="text"
                    name="lastName"
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={handleChange}
                    disabled={isLoading}
                    className={`pl-10 bg-transparent border-b-2 rounded-none transition-all duration-300 ${
                      formErrors.lastName 
                        ? 'border-red-500' 
                        : 'border-gray-300 dark:border-gray-600 focus:border-blue-600 dark:focus:border-blue-400'
                    } focus:ring-0`}
                  />
                </div>
                {formErrors.lastName && (
                  <p className="text-xs text-red-500 mt-1">{formErrors.lastName}</p>
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
                  {isLoading ? 'Sending code...' : (
                    <span className="flex items-center justify-center gap-2">
                      Continue to Verification
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  )}
                </Button>
              </motion.div>
            </motion.div>
          </form>

          {/* Sign In Link */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.4 }}
            className="mt-6 text-center"
          >
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Already have an account?{' '}
              <button
                onClick={() => router.push('/login')}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
              >
                Sign In
              </button>
            </p>
          </motion.div>
        </Card>
      </motion.div>
    </main>
  )
}
