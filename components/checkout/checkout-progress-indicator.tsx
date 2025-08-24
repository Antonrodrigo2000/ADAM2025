interface CheckoutProgressIndicatorProps {
  currentStep: 'information' | 'payment' | 'processing' | 'complete'
  isAuthenticated: boolean
}

export function CheckoutProgressIndicator({ currentStep, isAuthenticated }: CheckoutProgressIndicatorProps) {
  const CheckIcon = () => (
    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
  )

  // For authenticated users: Payment -> Complete (2 steps)
  if (isAuthenticated) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex items-center space-x-4">
          <div className={`flex items-center space-x-2 ${
            currentStep === 'payment' ? 'text-orange-600' : 'text-green-600'
          }`}>
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
              currentStep === 'payment' 
                ? 'border-orange-600 bg-orange-100' 
                : 'border-green-600 bg-green-600'
            }`}>
              {currentStep === 'payment' ? (
                <span className="text-xs font-bold">1</span>
              ) : (
                <CheckIcon />
              )}
            </div>
            <span className="text-sm font-medium">Payment</span>
          </div>
          <div className={`flex-1 h-px ${
            ['processing', 'complete'].includes(currentStep) ? 'bg-green-300' : 'bg-neutral-300'
          }`}></div>
          <div className={`flex items-center space-x-2 ${
            ['processing', 'complete'].includes(currentStep) ? 'text-green-600' : 'text-neutral-400'
          }`}>
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
              ['processing', 'complete'].includes(currentStep)
                ? 'border-green-600 bg-green-600'
                : 'border-neutral-300'
            }`}>
              {['processing', 'complete'].includes(currentStep) ? (
                <CheckIcon />
              ) : (
                <span className="text-xs font-bold">2</span>
              )}
            </div>
            <span className="text-sm font-medium">Complete</span>
          </div>
        </div>
      </div>
    )
  }

  // For guest users: Information -> Payment -> Complete (3 steps)
  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <div className="flex items-center space-x-4">
        {/* Information Step */}
        <div className={`flex items-center space-x-2 ${
          currentStep === 'information' ? 'text-orange-600' : 'text-green-600'
        }`}>
          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
            currentStep === 'information'
              ? 'border-orange-600 bg-orange-100'
              : 'border-green-600 bg-green-600'
          }`}>
            {currentStep === 'information' ? (
              <span className="text-xs font-bold">1</span>
            ) : (
              <CheckIcon />
            )}
          </div>
          <span className="text-sm font-medium">Information</span>
        </div>

        <div className={`flex-1 h-px ${
          ['payment', 'processing', 'complete'].includes(currentStep) ? 'bg-green-300' : 'bg-neutral-300'
        }`}></div>

        {/* Payment Step */}
        <div className={`flex items-center space-x-2 ${
          currentStep === 'payment' ? 'text-orange-600' : 
          ['processing', 'complete'].includes(currentStep) ? 'text-green-600' : 'text-neutral-400'
        }`}>
          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
            currentStep === 'payment'
              ? 'border-orange-600 bg-orange-100'
              : ['processing', 'complete'].includes(currentStep)
              ? 'border-green-600 bg-green-600'
              : 'border-neutral-300'
          }`}>
            {currentStep === 'payment' ? (
              <span className="text-xs font-bold">2</span>
            ) : ['processing', 'complete'].includes(currentStep) ? (
              <CheckIcon />
            ) : (
              <span className="text-xs font-bold">2</span>
            )}
          </div>
          <span className="text-sm font-medium">Payment</span>
        </div>

        <div className={`flex-1 h-px ${
          ['processing', 'complete'].includes(currentStep) ? 'bg-green-300' : 'bg-neutral-300'
        }`}></div>

        {/* Complete Step */}
        <div className={`flex items-center space-x-2 ${
          ['processing', 'complete'].includes(currentStep) ? 'text-green-600' : 'text-neutral-400'
        }`}>
          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
            ['processing', 'complete'].includes(currentStep)
              ? 'border-green-600 bg-green-600'
              : 'border-neutral-300'
          }`}>
            {['processing', 'complete'].includes(currentStep) ? (
              <CheckIcon />
            ) : (
              <span className="text-xs font-bold">3</span>
            )}
          </div>
          <span className="text-sm font-medium">Complete</span>
        </div>
      </div>
    </div>
  )
}