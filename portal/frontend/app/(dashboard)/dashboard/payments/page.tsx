/**
 * Payments Page
 * /payments
 */

'use client'

import { Card } from '@/components/ui/card'
import { useAuth } from '@/hooks/auth-context'
import { usePayments } from '@/hooks/hooks'

export default function PaymentsPage() {
  const { user } = useAuth()
  const { payments } = usePayments()

  if (!user) {
    return null
  }

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-3xl font-bold text-foreground mb-6">My Payments</h1>
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted border-b border-border">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                  Course
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                    No payment history
                  </td>
                </tr>
              ) : (
                payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-muted/50">
                    <td className="px-6 py-4 text-sm text-foreground">
                      {payment.course?.title || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground font-semibold">
                      {payment.currency} {payment.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${payment.status === 'success'
                          ? 'bg-accent/20 text-accent'
                          : payment.status === 'pending'
                            ? 'bg-secondary/20 text-secondary'
                            : 'bg-destructive/20 text-destructive'
                          }`}
                      >
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {new Date(payment.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
