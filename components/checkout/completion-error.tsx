"use client"

import { AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface CompletionErrorProps {
  error: string
  onRetry: () => void
}

export function CompletionError({ error, onRetry }: CompletionErrorProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 sm:p-8">
      <div className="text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-8 h-8 text-red-600" />
        </div>
        
        <h2 className="text-xl font-semibold text-neutral-800 mb-2">
          Session Error
        </h2>
        <p className="text-neutral-600 mb-8">
          {error || 'Session not found'}
        </p>
        
        <Button 
          onClick={onRetry}
          className="bg-orange-500 hover:bg-orange-600 text-white"
        >
          Go to Dashboard
        </Button>
      </div>
    </div>
  )
}