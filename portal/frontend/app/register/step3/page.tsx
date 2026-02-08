/**
 * Registration Step 3 - Complete Registration
 * /register/step3
 * 
 * Redesigned with luxurious and professional aesthetics:
 * - Elegant typography and spacious layout
 * - Subtle animations for smooth transitions and sequential field reveals
 * - Minimalist design with premium feel using soft gradients and clean lines
 * - Subtle animated gradient background
 * - Sequential animations for form fields
 */

'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { useCompleteRegistration } from '@/hooks/use-auth-flow'
import { useCourses } from '@/hooks/use-courses'
import { useAuth } from '@/hooks/auth-context'
import { Phone, Calendar, BookOpen, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'

export default function RegisterStep3Page() {
  const router = useRouter()
  const { toast } = useToast()
  const { login } = useAuth()
  const { completeRegistration, isLoading } = useCompleteRegistration()

  const [tempToken, setTempToken] = useState('')
  const [email, setEmail] = useState('')
  const { courses, isLoading: isLoadingCourses, error: coursesError } = useCourses({
    page: 1,
    limit: 100,
    status: 'active',
  })

  const [formData, setFormData] = useState({
    phone: '',
    dateOfBirth: '',
    courseId: '',
  })


  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [agreedToTerms, setAgreedToTerms] = useState(false)

  // Load session data on mount
  useEffect(() => {
    const storedTempToken = sessionStorage.getItem('registration_tempToken')
    const storedEmail = sessionStorage.getItem('registration_email')

    if (!storedTempToken || !storedEmail) {
      toast({
        title: 'Session expired',
        description: 'Please start registration again',
        variant: 'destructive',
      })
      router.push('/register')
      return
    }

    setTempToken(storedTempToken)
    setEmail(storedEmail)

  }, [router, toast])
  
  useEffect(() => {
    if (!coursesError) return
    toast({
      title: 'Failed to load courses',
      description: coursesError.message || 'Please try again',
      variant: 'destructive',
    })
  }, [coursesError, toast])

  const validateForm = () => {
    const errors: Record<string, string> = {}

    if (!formData.phone) {
      errors.phone = 'Phone number is required'
    } else if (!/^\+?[1-9]\d{1,14}$/.test(formData.phone.replace(/\D/g, ''))) {
      errors.phone = 'Invalid phone number format'
    }

    if (!formData.dateOfBirth) {
      errors.dateOfBirth = 'Date of birth is required'
    } else {
      const dob = new Date(formData.dateOfBirth)
      const today = new Date()
      const age = today.getFullYear() - dob.getFullYear()

      if (age < 13) {
        errors.dateOfBirth = 'You must be at least 13 years old'
      }
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm() || !agreedToTerms) {
      if (!agreedToTerms) {
        toast({
          title: 'Terms agreement required',
          description: 'Please agree to the Terms of Service and Privacy Policy',
          variant: 'destructive',
        })
      }
      return
    }

    try {
      const response = await completeRegistration({
        tempToken,
        phone: formData.phone,
        dateOfBirth: formData.dateOfBirth,
        courseId: formData.courseId,
      })

      toast({
        title: 'Registration successful',
        description: 'Welcome to ITFY Portal!',
      })

      // Log in user with their new account
      try {
        await login({ email, password: response.temporaryPassword })
      } catch {
        // Registration successful even if auto-login fails
        // User can manually log in
      }

      // Clear session storage
      sessionStorage.removeItem('registration_email')
      sessionStorage.removeItem('registration_firstName')
      sessionStorage.removeItem('registration_lastName')
      sessionStorage.removeItem('registration_tempToken')

      // Redirect to dashboard
      router.push('/dashboard')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Registration failed'
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
              Complete Your Profile
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Step 3 of 3: Additional Information
            </p>
          </motion.div>

          <form onSubmit={handleSubmit}>
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-6"
            >
              {/* Phone Number Field */}
              <motion.div variants={childVariants}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type="tel"
                    name="phone"
                    placeholder="+233241234567"
                    value={formData.phone}
                    onChange={handleChange}
                    disabled={isLoading}
                    className={`pl-10 bg-transparent border-b-2 rounded-none transition-all duration-300 ${
                      formErrors.phone 
                        ? 'border-red-500' 
                        : 'border-gray-300 dark:border-gray-600 focus:border-blue-600 dark:focus:border-blue-400'
                    } focus:ring-0`}
                  />
                </div>
                {formErrors.phone && (
                  <p className="text-xs text-red-500 mt-1">{formErrors.phone}</p>
                )}
              </motion.div>

              {/* Date of Birth Field */}
              <motion.div variants={childVariants}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Date of Birth
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    disabled={isLoading}
                    className={`pl-10 bg-transparent border-b-2 rounded-none transition-all duration-300 ${
                      formErrors.dateOfBirth 
                        ? 'border-red-500' 
                        : 'border-gray-300 dark:border-gray-600 focus:border-blue-600 dark:focus:border-blue-400'
                    } focus:ring-0`}
                  />
                </div>
                {formErrors.dateOfBirth && (
                  <p className="text-xs text-red-500 mt-1">{formErrors.dateOfBirth}</p>
                )}
              </motion.div>

              {/* Course Selection Field */}
              <motion.div variants={childVariants}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select a Course
                </label>
                <div className="relative">
                  <BookOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <select
                    name="courseId"
                    value={formData.courseId}
                    onChange={handleChange}
                    disabled={isLoading || isLoadingCourses}
                    className={`pl-10 w-full bg-transparent border-b-2 rounded-none transition-all duration-300 appearance-none py-2 focus:outline-none focus:ring-0 ${
                      formErrors.courseId 
                        ? 'border-red-500' 
                        : 'border-gray-300 dark:border-gray-600 focus:border-blue-600 dark:focus:border-blue-400'
                    } text-gray-900 dark:text-white`}
                  >
                    <option value="">
                      {isLoadingCourses ? 'Loading courses...' : 'Choose a course...'}
                    </option>
                    {courses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.title}
                      </option>
                    ))}
                  </select>
                </div>
                {formErrors.courseId && (
                  <p className="text-xs text-red-500 mt-1">{formErrors.courseId}</p>
                )}
              </motion.div>

              {/* Terms and Conditions */}
              <motion.div variants={childVariants}>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="terms" 
                    checked={agreedToTerms}
                    onCheckedChange={(checked) => setAgreedToTerms(!!checked)}
                    disabled={isLoading}
                  />
                  <Label
                    htmlFor="terms"
                    className="text-sm text-gray-600 dark:text-gray-300"
                  >
                    I agree to the{' '}
                    <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline">
                      Terms of Service
                    </a>{' '}
                    and{' '}
                    <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline">
                      Privacy Policy
                    </a>
                  </Label>
                </div>
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
                  disabled={isLoading || isLoadingCourses || !agreedToTerms}
                >
                  {isLoading ? 'Creating Account...' : (
                    <span className="flex items-center justify-center gap-2">
                      Complete Registration
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
            transition={{ delay: 1.0, duration: 0.4 }}
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
