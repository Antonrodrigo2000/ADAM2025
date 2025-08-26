"use client"

interface TransactionReferenceProps {
  orderId?: string
  transactionId?: string
}

export function TransactionReference({ orderId, transactionId }: TransactionReferenceProps) {
  if (!orderId && !transactionId) return null

  return (
    <div className="mt-8 pt-6 border-t border-neutral-200">
      <div className="text-center">
        <p className="text-xs text-neutral-500 mb-2">Reference</p>
        <div className="space-y-1">
          {orderId && (
            <p className="text-sm font-medium text-neutral-700">Order #{orderId.slice(-8)}</p>
          )}
          {transactionId && (
            <p className="text-xs text-neutral-500">{transactionId}</p>
          )}
        </div>
      </div>
    </div>
  )
}