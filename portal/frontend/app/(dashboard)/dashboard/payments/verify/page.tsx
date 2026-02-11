/**
 * Enhanced Payment Verification Page
 * Uses usePaymentStatus hook for real-time socket updates
 *
 * Features:
 * - Real-time payment status via WebSocket
 * - Animated progress indicators
 * - Success celebration UI
 * - Failure recovery UI
 * - Auto-redirect on success
 * - Manual refresh on error
 * - Collapsible payment details
 */

'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { usePaymentStatus } from '@/hooks/use-payments'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  ArrowRight,
} from 'lucide-react'

function VerifyPaymentContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const reference = searchParams.get('reference')

  const [countdown, setCountdown] = useState(3)
  const [showDetails, setShowDetails] = useState(false)

  const {
    status,
    isLoading,
    error,
    refresh,
  } = usePaymentStatus(reference, {
    enabled: !!reference,
    onSuccess: (data) => {
      // Start countdown timer
      let count = 3
      setCountdown(count)

      const timer = setInterval(() => {
        count -= 1
        setCountdown(count)

        if (count <= 0) {
          clearInterval(timer)
          router.push('/dashboard/courses')
        }
      }, 1000)
    },
  })

  // Computed values for backward compatibility
  const isSuccess = status?.status === 'success'
  const isFailed = status?.status === 'failed'

  // Redirect if no reference
  useEffect(() => {
    if (!reference) {
      router.push('/courses')
    }
  }, [reference, router])

  // For socket-based updates, we use indeterminate progress
  const progressPercentage = isLoading ? undefined : 100

  // ============================================
  // PROCESSING STATE
  // ============================================
  if (isLoading && !status) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <Card className="border-2">
            <CardContent className="pt-12 pb-8 px-6">
              {/* Animated Loader */}
              <motion.div
                animate={{
                  rotate: 360,
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  rotate: { duration: 2, repeat: Infinity, ease: 'linear' },
                  scale: { duration: 1.5, repeat: Infinity },
                }}
                className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-6"
              >
                <Loader2 className="w-10 h-10 text-primary" />
              </motion.div>

              {/* Title */}
              <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">
                Verifying Your Payment
              </h2>
              <p className="text-center text-gray-600 mb-8">
                Please wait while we confirm your transaction...
              </p>

              {/* Progress Bar */}
              <div className="space-y-3 mb-6">
                <Progress value={progressPercentage} className="h-2" />
                <div className="flex justify-center text-sm text-gray-600">
                  <span>Waiting for payment confirmation...</span>
                </div>
              </div>

              {/* Payment Reference */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <p className="text-xs text-gray-500 mb-1">Reference</p>
                <p className="text-sm font-mono text-gray-900 break-all">
                  {reference}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Help Text */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 5 }}
            className="text-center text-sm text-gray-500 mt-4"
          >
            This usually takes 5-10 seconds...
          </motion.p>
        </motion.div>
      </div>
    )
  }

  // ============================================
  // SUCCESS STATE
  // ============================================
  if (isSuccess && status) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-2xl"
        >
          <Card className="border-2 border-green-200 overflow-hidden">
            <div className="bg-gradient-to-br from-green-500 to-green-600 p-8 text-white text-center">
              {/* Success Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 10 }}
                className="mx-auto w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4"
              >
                <CheckCircle className="w-16 h-16 text-white" />
              </motion.div>

              {/* Title */}
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-3xl sm:text-4xl font-bold mb-2"
              >
                Payment Successful! 🎉
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-green-100 text-lg"
              >
                Your enrollment has been confirmed. Welcome aboard!
              </motion.p>
            </div>

            <CardContent className="p-8 space-y-6">
              {/* Payment Details */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Amount Paid</p>
                    <p className="text-xl font-bold text-gray-900">
                      {status.currency} {status.amount?.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Reference</p>
                    <p className="text-sm font-mono text-gray-900 break-all">
                      {reference}
                    </p>
                  </div>
                </div>
              </div>

              {/* Collapsible Details */}
              <div>
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <span className="text-sm font-semibold text-gray-900">
                    Payment Details
                  </span>
                  {showDetails ? (
                    <ChevronUp className="w-5 h-5 text-gray-600" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-600" />
                  )}
                </button>

                <AnimatePresence>
                  {showDetails && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-3 p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-2"
                    >
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Status</span>
                        <Badge className="bg-green-100 text-green-700">
                          {status.status}
                        </Badge>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Payment ID</span>
                        <span className="font-mono text-gray-900">
                          {status.paymentId || 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Enrollment ID</span>
                        <span className="font-mono text-gray-900">
                          {status.enrollmentId || 'N/A'}
                        </span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={() => router.push('/dashboard/courses')}
                  className="flex-1"
                  size="lg"
                >
                  <ArrowRight className="w-5 h-5 mr-2" />
                  Go to My Courses
                </Button>
                <Button
                  onClick={() => router.push('/courses')}
                  variant="outline"
                  className="flex-1"
                  size="lg"
                >
                  Browse More Courses
                </Button>
              </div>

              {/* Auto-redirect countdown */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-center text-sm text-gray-500"
              >
                Redirecting to your courses in {countdown} seconds...
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  // ============================================
  // FAILED STATE
  // ============================================
  if (isFailed && status) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-2xl"
        >
          <Card className="border-2 border-red-200">
            <CardContent className="pt-12 pb-8 px-6">
              {/* Error Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 10 }}
                className="mx-auto w-24 h-24 rounded-full bg-red-100 flex items-center justify-center mb-6"
              >
                <XCircle className="w-16 h-16 text-red-600" />
              </motion.div>

              {/* Title */}
              <h2 className="text-3xl font-bold text-center text-red-600 mb-2">
                Payment Failed
              </h2>
              <p className="text-center text-gray-600 mb-8">
                {status.message || 'Your payment could not be processed'}
              </p>

              {/* Payment Details */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Reference</span>
                    <span className="font-mono text-gray-900">{reference}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Status</span>
                    <Badge variant="destructive">{status.status}</Badge>
                  </div>
                </div>
              </div>

              {/* Common Reasons */}
              <div className="mb-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm font-semibold text-gray-900 mb-2">
                  Common Reasons:
                </p>
                <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                  <li>Insufficient funds</li>
                  <li>Card declined by bank</li>
                  <li>Incorrect card details</li>
                  <li>Payment timeout</li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={() => router.push(`/dashboard/checkout?courseId=${status.enrollmentId}`)}
                  className="flex-1"
                  size="lg"
                >
                  Try Again
                </Button>
                <Button
                  onClick={refresh}
                  variant="outline"
                  className="flex-1"
                  size="lg"
                >
                  <RefreshCw className="w-5 h-5 mr-2" />
                  Check Status Again
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  // ============================================
  // ERROR STATE (Network/Socket)
  // ============================================
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-amber-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-2xl"
        >
          <Card className="border-2 border-amber-200">
            <CardContent className="pt-12 pb-8 px-6">
              {/* Warning Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 10 }}
                className="mx-auto w-24 h-24 rounded-full bg-amber-100 flex items-center justify-center mb-6"
              >
                <AlertCircle className="w-16 h-16 text-amber-600" />
              </motion.div>

              {/* Title */}
              <h2 className="text-3xl font-bold text-center text-amber-600 mb-2">
                Connection Error
              </h2>
              <p className="text-center text-gray-600 mb-8">
                {error?.message || 'Unable to connect to the server for real-time updates'}
              </p>

              {/* Info Box */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-8">
                <p className="text-sm text-amber-900">
                  <strong>What does this mean?</strong>
                  <br />
                  We lost connection to the server. Your payment may still be processing.
                  Please try refreshing or check your payment status manually.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={refresh}
                  className="flex-1"
                  size="lg"
                >
                  <RefreshCw className="w-5 h-5 mr-2" />
                  Check Status Now
                </Button>
                <Button
                  onClick={() => router.push('/dashboard/payments')}
                  variant="outline"
                  className="flex-1"
                  size="lg"
                >
                  View Payment History
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  return null
}

export default function VerifyPaymentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    }>
      <VerifyPaymentContent />
    </Suspense>
  )
}