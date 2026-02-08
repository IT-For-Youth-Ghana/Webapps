/**
 * Checkout Page
 * /dashboard/checkout
 * 
 * Handles course payment processing via Paystack
 */

'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/hooks/auth-context'
import { useToast } from '@/hooks/use-toast'
import { useCourse } from '@/hooks/use-courses'
import { useInitializePayment, useVerifyPayment } from '@/hooks/use-payments'

interface CheckoutState {
  step: 'review' | 'processing' | 'success' | 'error'
  error?: string
  reference?: string
}

export default function CheckoutPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const { toast } = useToast()

  // Get course ID from query params
  const courseId = searchParams.get('courseId')
  const returnRef = searchParams.get('reference')

  // State
  const [checkoutState, setCheckoutState] = useState<CheckoutState>({
    step: 'review',
  })
  const [isLoadingCourse, setIsLoadingCourse] = useState(true)
  const [courseData, setCourseData] = useState<any>(null)

  // Hooks
  const { course, isLoading: courseLoading } = useCourse(courseId || '')
  const { initializePayment, isInitializing } = useInitializePayment()
  const { verifyPayment, isVerifying } = useVerifyPayment()

  // Handle payment verification callback
  useEffect(() => {
    if (returnRef) {
      handleVerifyPayment(returnRef)
    }
  }, [returnRef])

  // Load course data
  useEffect(() => {
    if (course && !courseLoading) {
      setCourseData(course)
      setIsLoadingCourse(false)
    }
  }, [course, courseLoading])

  if (!user) {
    return null
  }

  if (!courseId) {
    return (
      <div className="p-4 md:p-8">
        <Card className="p-12 text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            No Course Selected
          </h2>
          <p className="text-muted-foreground mb-6">
            Please select a course to proceed with payment.
          </p>
          <Button onClick={() => router.push('/dashboard/browse')}>
            Browse Courses
          </Button>
        </Card>
      </div>
    )
  }

  const handleInitializePayment = async () => {
    try {
      setCheckoutState({ step: 'processing' })

      const response = await initializePayment({
        courseId: courseId!,
      })

      // Redirect to Paystack payment URL
      if (response.authorizationUrl) {
        // Store reference for verification
        sessionStorage.setItem('paymentReference', response.reference)
        window.location.href = response.authorizationUrl
        return
      }

      // Free course: verify locally to complete enrollment
      if (response.reference) {
        await handleVerifyPayment(response.reference)
      } else {
        throw new Error('Missing payment reference')
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to initialize payment'
      setCheckoutState({
        step: 'error',
        error: errorMessage,
      })
      toast({
        title: 'Payment Error',
        description: errorMessage,
        variant: 'destructive',
      })
    }
  }

  const handleVerifyPayment = async (reference: string) => {
    try {
      setCheckoutState({ step: 'processing', reference })

      const result = await verifyPayment(reference)

      if (result.status === 'success') {
        setCheckoutState({ step: 'success', reference })
        toast({
          title: 'Payment Successful',
          description: 'Your enrollment is complete. Redirecting...',
        })

        // Redirect to course after a delay
        setTimeout(() => {
          router.push('/dashboard/courses')
        }, 2000)
      } else {
        setCheckoutState({
          step: 'error',
          error: result.message || 'Payment verification failed',
        })
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Payment verification failed'
      setCheckoutState({
        step: 'error',
        error: errorMessage,
      })
    }
  }

  // Loading state
  if (isLoadingCourse || courseLoading) {
    return (
      <div className="p-4 md:p-8">
        <div className="max-w-2xl mx-auto">
          <Card className="p-8">
            <div className="animate-pulse space-y-4">
              <div className="h-10 bg-muted rounded w-3/4" />
              <div className="h-6 bg-muted rounded w-1/2" />
              <div className="h-40 bg-muted rounded" />
              <div className="h-12 bg-muted rounded" />
            </div>
          </Card>
        </div>
      </div>
    )
  }

  // Course not found
  if (!courseData) {
    return (
      <div className="p-4 md:p-8">
        <Card className="p-12 text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Course Not Found
          </h2>
          <p className="text-muted-foreground mb-6">
            The course you're trying to enroll in doesn't exist.
          </p>
          <Button onClick={() => router.push('/dashboard/browse')}>
            Browse Courses
          </Button>
        </Card>
      </div>
    )
  }

  const courseSlug = courseData?.slug || courseId

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Success State */}
        {checkoutState.step === 'success' && (
          <Card className="p-8 text-center border-green-200 bg-green-50">
            <div className="mb-4 text-6xl">✓</div>
            <h1 className="text-3xl font-bold text-green-900 mb-2">
              Payment Successful!
            </h1>
            <p className="text-green-700 mb-6">
              Your enrollment has been confirmed. Redirecting to your courses...
            </p>
            <Button
              onClick={() => router.push('/dashboard/courses')}
              className="bg-green-600 hover:bg-green-700"
            >
              Go to My Courses
            </Button>
          </Card>
        )}

        {/* Error State */}
        {checkoutState.step === 'error' && (
          <Card className="p-8 text-center border-red-200 bg-red-50">
            <div className="mb-4 text-6xl">✗</div>
            <h1 className="text-3xl font-bold text-red-900 mb-2">
              Payment Failed
            </h1>
            <p className="text-red-700 mb-6">{checkoutState.error}</p>
            <div className="flex gap-3 justify-center">
              <Button
                onClick={() => setCheckoutState({ step: 'review' })}
                className="bg-red-600 hover:bg-red-700"
              >
                Try Again
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push(`/dashboard/courses/${courseSlug}`)}
              >
                Back to Course
              </Button>
            </div>
          </Card>
        )}

        {/* Processing State */}
        {checkoutState.step === 'processing' && (
          <Card className="p-8 text-center">
            <div className="mb-4">
              <div className="inline-block">
                <div className="animate-spin">
                  <div className="text-4xl">⏳</div>
                </div>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Processing Payment
            </h1>
            <p className="text-muted-foreground">
              Please wait while we process your payment...
            </p>
          </Card>
        )}

        {/* Review State */}
        {checkoutState.step === 'review' && (
          <>
            {/* Header */}
            <div className="mb-8">
              <button
                onClick={() => router.push(`/dashboard/courses/${courseSlug}`)}
                className="flex items-center gap-2 text-primary hover:text-primary/80 mb-6 transition-colors"
              >
                ← Back to Course
              </button>
              <h1 className="text-3xl font-bold text-foreground">
                Complete Your Enrollment
              </h1>
              <p className="text-muted-foreground mt-2">
                Review your order and complete payment
              </p>
            </div>

            {/* Order Summary */}
            <Card className="p-6 mb-6">
              <h2 className="text-xl font-bold text-foreground mb-6">
                Order Summary
              </h2>

              {/* Course Card */}
              <div className="border-b pb-6 mb-6">
                <div className="flex gap-4">
                  {/* Course Image */}
                  <div className="w-24 h-24 bg-gradient-to-br from-primary to-primary/60 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-white/60 text-4xl">📚</span>
                  </div>

                  {/* Course Info */}
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-foreground mb-1">
                      {courseData.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      by {courseData.instructor}
                    </p>
                    <div className="flex gap-2">
                      <Badge variant="outline">{courseData.category}</Badge>
                      <Badge variant="secondary">{courseData.level}</Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pricing Details */}
              <div className="space-y-3 mb-6 pb-6 border-b">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Course Price</span>
                  <span className="font-semibold text-foreground">
                    {courseData.currency}{(courseData.price || 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Processing Fee</span>
                  <span className="font-semibold text-foreground">{courseData.currency}0.00</span>
                </div>
                <div className="flex justify-between pt-3 border-t">
                  <span className="font-bold text-foreground">Total Amount</span>
                  <span className="text-2xl font-bold text-primary">
                    {courseData.currency}{(courseData.price || 0).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Student Info */}
              <div className="bg-muted/50 p-4 rounded-lg mb-6">
                <h4 className="font-semibold text-foreground mb-3">
                  Enrollment Information
                </h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Name:</span>{' '}
                    <span className="font-medium text-foreground">
                      {user.firstName} {user.lastName}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Email:</span>{' '}
                    <span className="font-medium text-foreground">
                      {user.email}
                    </span>
                  </div>
                </div>
              </div>

              {/* Benefits */}
              <div className="mb-6">
                <h4 className="font-semibold text-foreground mb-3">
                  What You Get
                </h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex gap-2">
                    <span className="text-primary">✓</span>
                    <span className="text-muted-foreground">
                      Lifetime access to course materials
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary">✓</span>
                    <span className="text-muted-foreground">
                      Certificate of completion
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary">✓</span>
                    <span className="text-muted-foreground">
                      30-day money-back guarantee
                    </span>
                  </li>
                </ul>
              </div>

              {/* Payment Terms */}
              <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded mb-6">
                {courseData.price
                  ? (
                    <>
                      By clicking "Pay Now", you agree to enroll in this course and
                      authorize the payment of{' '}
                      <span className="font-semibold text-foreground">
                        {courseData.currency}{(courseData.price || 0).toLocaleString()}
                      </span>{' '}
                      using Paystack.
                    </>
                  )
                  : (
                    <>
                      By clicking "Enroll Free", you agree to enroll in this course.
                    </>
                  )}
              </div>

              {/* CTA Button */}
              <Button
                size="lg"
                className="w-full"
                onClick={handleInitializePayment}
                disabled={isInitializing}
              >
                {isInitializing ? (
                  <>
                    <span className="mr-2">⏳</span>
                    Processing...
                  </>
                ) : (
                  <>
                    <span className="mr-2">💳</span>
                    {courseData.price
                      ? (
                        <>Pay Now - {courseData.currency}{(courseData.price || 0).toLocaleString()}</>
                      )
                      : (
                        <>Enroll Free</>
                      )}
                  </>
                )}
              </Button>

              {/* Security Info */}
              <div className="mt-4 text-center text-xs text-muted-foreground">
                <p>
                  {courseData.price
                    ? '🔒 Secured by Paystack • Your payment information is encrypted'
                    : 'Enrollment is free for this course'}
                </p>
              </div>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}
