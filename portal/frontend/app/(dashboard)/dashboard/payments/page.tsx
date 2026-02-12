/**
 * Payments Page
 * /payments — full payment history with filters, retry, and detail view
 */

'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useAuth } from '@/hooks/auth-context'
import { usePayments, useRetryPayment } from '@/hooks'
import StatusBadge from '@/components/shared/status-badge'
import EmptyState from '@/components/shared/empty-state'
import { useToast } from '@/components/ui/use-toast'
import {
  CreditCard,
  RefreshCw,
  Eye,
  Receipt,
  DollarSign,
  Loader2,
  Wallet,
} from 'lucide-react'
import type { Payment } from '@/lib/types'

export default function PaymentsPage() {
  const { user } = useAuth()
  const { payments, isLoading } = usePayments()
  const { retryPayment, isLoading: retrying } = useRetryPayment()
  const { toast } = useToast()
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)

  if (!user) return null

  const filteredPayments = statusFilter === 'all'
    ? payments
    : payments.filter(p => p.status === statusFilter)

  const totalPaid = payments
    .filter(p => p.status === 'success')
    .reduce((sum, p) => sum + Number(p.amount || 0), 0)

  const pendingCount = payments.filter(p => p.status === 'pending').length

  const handleRetry = async (paymentId: string) => {
    const result = await retryPayment(paymentId)
    if (result) {
      toast({ title: 'Payment retried', description: 'Check your payment status shortly.' })
    } else {
      toast({ title: 'Retry failed', description: 'Could not retry payment. Try again later.', variant: 'destructive' })
    }
  }

  return (
    <div className="p-4 md:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground tracking-tight">Payment History</h1>
        <p className="text-muted-foreground mt-1">View and manage your payment transactions</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-green-500/10">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Paid</p>
              <p className="text-2xl font-bold">GHS {Number(totalPaid).toFixed(2)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-primary/10">
              <Receipt className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Transactions</p>
              <p className="text-2xl font-bold">{payments.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-amber-500/10">
              <Wallet className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-2xl font-bold">{pendingCount}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Tabs defaultValue="all" value={statusFilter} onValueChange={setStatusFilter}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="success">Successful</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="failed">Failed</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Payment List */}
      <Card>
        {isLoading ? (
          <CardContent className="p-8">
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Loading payments...</span>
            </div>
          </CardContent>
        ) : filteredPayments.length === 0 ? (
          <EmptyState
            icon={CreditCard}
            title="No payments found"
            description={statusFilter !== 'all'
              ? `No ${statusFilter} payments. Try a different filter.`
              : 'You haven\'t made any payments yet.'
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Course</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Reference</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Amount</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Date</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 text-sm text-foreground font-medium">
                      {payment.course?.title || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground font-mono text-xs">
                      {payment.paystackReference || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground font-semibold">
                      {payment.currency} {Number(payment.amount || 0).toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={payment.status} />
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {new Date(payment.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedPayment(payment)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        {payment.status === 'failed' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={retrying}
                            onClick={() => handleRetry(payment.id)}
                          >
                            <RefreshCw className={`w-4 h-4 ${retrying ? 'animate-spin' : ''}`} />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Payment Detail Dialog */}
      <Dialog open={!!selectedPayment} onOpenChange={() => setSelectedPayment(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Payment Details</DialogTitle>
          </DialogHeader>
          {selectedPayment && (
                <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Course</span>
                <span className="text-sm font-medium">{selectedPayment.course?.title || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Amount</span>
                <span className="text-sm font-bold">
                  {selectedPayment.currency} {Number(selectedPayment.amount || 0).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <StatusBadge status={selectedPayment.status} />
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Reference</span>
                <span className="text-sm font-mono">{selectedPayment.paystackReference || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Provider</span>
                <span className="text-sm">{selectedPayment.paymentMethod || 'Paystack'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Date</span>
                <span className="text-sm">
                  {new Date(selectedPayment.createdAt).toLocaleString()}
                </span>
              </div>
              {selectedPayment.status === 'failed' && (
                <Button
                  className="w-full mt-2"
                  disabled={retrying}
                  onClick={() => handleRetry(selectedPayment.id)}
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${retrying ? 'animate-spin' : ''}`} />
                  Retry Payment
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
