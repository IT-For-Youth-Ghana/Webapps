/**
 * Enhanced Checkout Page
 * Uses new payment hooks with free course detection and luxury UI
 * 
 * Features:
 * - Luxury gradient design
 * - Framer Motion animations
 * - Free course fast path
 * - Responsive layout
 * - Loading states
 * - Error handling
 * - Trust badges
 */

'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useInitializePayment } from '@/hooks/use-payments'
import { useCourse } from '@/hooks/use-courses'
import { useAuth } from '@/hooks/auth-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import {
  BookOpen,
  CreditCard,
  ShieldCheck,
  Users,
  Clock,
  CheckCircle,
  Award,
  ArrowLeft,
  Loader2,
} from 'lucide-react'

function CheckoutPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const courseId = searchParams.get('courseId')
  const { user } = useAuth()

  const { course, isLoading: isCourseLoading } = useCourse(courseId)
  const { initializePayment, isInitializing } = useInitializePayment()

  const [error, setError] = useState<string | null>(null)

  // Redirect if no course ID
  useEffect(() => {
    if (!courseId) {
      router.push('/courses')
    }
  }, [courseId, router])

  // Handle payment initialization
  const handleProceedToPayment = async () => {
    if (!courseId) return

    try {
      setError(null)
      const result = await initializePayment({ courseId })

      if (result.isFree) {
        // Free course - go directly to verification
        router.push(`/dashboard/payment/verify?reference=${result.reference}`)
      } else {
        // Paid course - redirect to Paystack
        window.location.href = result.authorizationUrl!
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize payment')
    }
  }

  // Loading state
  if (isCourseLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Loader2 className="w-12 h-12 mx-auto animate-spin text-primary" />
          <p className="mt-4 text-gray-600">Loading course details...</p>
        </motion.div>
      </div>
    )
  }

  // Course not found
  if (!course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-red-600 font-semibold">Course not found</p>
            <Button
              onClick={() => router.push('/courses')}
              className="mt-4"
              variant="outline"
            >
              Browse Courses
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const isFree = parseFloat(course.price as unknown as string) === 0 // Assuming price mimics string or number, check types later

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Course
          </Button>

          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
            Complete Your Enrollment
          </h1>
          <p className="mt-2 text-gray-600">
            You're one step away from starting your learning journey
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Course Details */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Course Card */}
            <Card className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex gap-6">
                  {/* Course Icon */}
                  <div className="flex-shrink-0">
                    <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                      <BookOpen className="w-10 h-10 text-primary" />
                    </div>
                  </div>

                  {/* Course Info */}
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      {course.title}
                    </h2>
                    <p className="text-gray-600 line-clamp-2">
                      {course.description}
                    </p>

                    {/* Badges */}
                    <div className="flex flex-wrap gap-2 mt-4">
                      {isFree && (
                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                          FREE
                        </Badge>
                      )}
                      <Badge variant="outline">{course.level}</Badge>
                      <Badge variant="outline">{course.category}</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* What's Included */}
            <Card>
              <CardHeader>
                <CardTitle>What's Included</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Lifetime Access</p>
                      <p className="text-sm text-gray-600">
                        Learn at your own pace, forever
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Award className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Certificate</p>
                      <p className="text-sm text-gray-600">
                        Earn a certificate upon completion
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Community</p>
                      <p className="text-sm text-gray-600">
                        Join our student community
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">30-Day Guarantee</p>
                      <p className="text-sm text-gray-600">
                        Full refund if you're not satisfied
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Student Info */}
            <Card>
              <CardHeader>
                <CardTitle>Student Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="font-semibold">
                      {user?.firstName} {user?.lastName}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-semibold">{user?.email}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Right Column - Order Summary (Sticky) */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-1"
          >
            <div className="sticky top-24">
              <Card className="overflow-hidden border-2">
                <CardHeader className="bg-gradient-to-br from-primary/5 to-primary/10">
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  {/* Price */}
                  <div>
                    <div className="flex justify-between items-baseline mb-2">
                      <span className="text-gray-600">Course Price</span>
                      {isFree ? (
                        <span className="text-3xl font-bold text-green-600">FREE</span>
                      ) : (
                        <span className="text-3xl font-bold text-gray-900">
                          {course.currency} {parseFloat(course.price as unknown as string).toLocaleString()}
                        </span>
                      )}
                    </div>
                    {!isFree && (
                      <p className="text-sm text-gray-500">One-time payment</p>
                    )}
                  </div>

                  <Separator />

                  {/* Total */}
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-lg">Total</span>
                    {isFree ? (
                      <span className="text-2xl font-bold text-green-600">FREE</span>
                    ) : (
                      <span className="text-2xl font-bold text-gray-900">
                        {course.currency} {parseFloat(course.price as unknown as string).toLocaleString()}
                      </span>
                    )}
                  </div>

                  {/* CTA Button */}
                  <Button
                    onClick={handleProceedToPayment}
                    disabled={isInitializing}
                    className="w-full h-12 text-base font-semibold"
                    size="lg"
                  >
                    <AnimatePresence mode="wait">
                      {isInitializing ? (
                        <motion.div
                          key="loading"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex items-center gap-2"
                        >
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Processing...
                        </motion.div>
                      ) : (
                        <motion.div
                          key="ready"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex items-center gap-2"
                        >
                          {isFree ? (
                            <>
                              <CheckCircle className="w-5 h-5" />
                              Enroll for Free
                            </>
                          ) : (
                            <>
                              <CreditCard className="w-5 h-5" />
                              Proceed to Payment
                            </>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Button>

                  {/* Error Message */}
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="p-3 bg-red-50 border border-red-200 rounded-lg"
                      >
                        <p className="text-sm text-red-600">{error}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Security Badge */}
                  {!isFree && (
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-600 pt-4">
                      <ShieldCheck className="w-4 h-4 text-green-600" />
                      <span>Secured by Paystack</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Trust Indicators */}
              <div className="mt-6 space-y-4">
                <div className="text-center text-sm text-gray-600">
                  <p className="font-semibold">Trusted by 10,000+ students</p>
                  <div className="flex items-center justify-center gap-1 mt-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                        key={star}
                        className="w-5 h-5 text-yellow-400 fill-current"
                        viewBox="0 0 20 20"
                      >
                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                      </svg>
                    ))}
                  </div>
                  <p className="mt-1">4.9/5 average rating</p>
                </div>

                {!isFree && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-900 text-center">
                      <strong>30-Day Money-Back Guarantee</strong>
                      <br />
                      Not satisfied? Get a full refund, no questions asked.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    }>
      <CheckoutPageContent />
    </Suspense>
  )
}
