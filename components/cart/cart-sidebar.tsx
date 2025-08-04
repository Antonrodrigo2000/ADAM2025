"use client"

import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { X, Plus, Minus, ShoppingCart } from 'lucide-react'
import { useCart } from '@/lib/contexts/cart-context'
import { Button } from '@/components/ui/button'
import Image from 'next/image'

interface CartSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function CartSidebar({ isOpen, onClose }: CartSidebarProps) {
  const { state, actions } = useCart()

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      actions.removeItem(itemId)
    } else {
      actions.updateQuantity(itemId, newQuantity)
    }
  }

  const handleCheckout = () => {
    // Navigate to checkout page
    window.location.href = '/checkout'
  }

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-in-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in-out duration-300"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-300"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-300"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                  <div className="flex h-full flex-col overflow-y-scroll bg-white shadow-xl">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-6 border-b border-gray-200">
                      <Dialog.Title className="text-lg font-semibold text-gray-900">
                        Shopping Cart ({state.items.length})
                      </Dialog.Title>
                      <button
                        type="button"
                        className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onClick={onClose}
                      >
                        <span className="sr-only">Close panel</span>
                        <X className="h-6 w-6" aria-hidden="true" />
                      </button>
                    </div>

                    {/* Cart Items */}
                    <div className="flex-1 px-4 py-6">
                      {state.items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                          <ShoppingCart className="h-16 w-16 mb-4" />
                          <h3 className="text-lg font-medium">Your cart is empty</h3>
                          <p className="text-sm">Add some products to get started</p>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          {state.items.map((item) => (
                            <div key={item.id} className="flex space-x-4">
                              {/* Product Image */}
                              <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                                {item.image ? (
                                  <Image
                                    src={item.image}
                                    alt={item.productName}
                                    width={64}
                                    height={64}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                    <ShoppingCart className="h-6 w-6 text-gray-400" />
                                  </div>
                                )}
                              </div>

                              {/* Product Details */}
                              <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-medium text-gray-900 truncate">
                                  {item.productName}
                                </h4>
                                <p className="text-sm text-gray-500">{item.variantName}</p>
                                <div className="mt-1 flex items-center space-x-2">
                                  <span className="text-sm font-medium text-gray-900">
                                    LKR {item.totalPrice.toLocaleString()}
                                  </span>
                                  {item.months > 1 && (
                                    <span className="text-xs text-gray-500">
                                      (LKR {item.monthlyPrice.toLocaleString()}/month)
                                    </span>
                                  )}
                                </div>
                                {item.prescriptionRequired && (
                                  <p className="text-xs text-blue-600 mt-1">
                                    + LKR {item.consultationFee.toLocaleString()} consultation fee
                                  </p>
                                )}

                                {/* Quantity Controls */}
                                <div className="mt-3 flex items-center justify-between">
                                  <div className="flex items-center space-x-3">
                                    <button
                                      onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                      className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-colors"
                                    >
                                      <Minus className="h-4 w-4 text-gray-600" />
                                    </button>
                                    <span className="text-base font-semibold w-8 text-center text-gray-900">
                                      {item.quantity}
                                    </span>
                                    <button
                                      onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                      className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-colors"
                                    >
                                      <Plus className="h-4 w-4 text-gray-600" />
                                    </button>
                                  </div>
                                  <button
                                    onClick={() => actions.removeItem(item.id)}
                                    className="px-3 py-1 text-sm font-medium text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
                                  >
                                    Remove
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Cart Summary & Checkout */}
                    {state.items.length > 0 && (
                      <div className="border-t border-gray-200 px-4 py-6">
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Subtotal</span>
                            <span>LKR {(state.subtotal - state.shipping - state.tax).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Tax</span>
                            <span>LKR {state.tax.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Shipping</span>
                            <span>{state.shipping === 0 ? 'Free' : `LKR ${state.shipping.toLocaleString()}`}</span>
                          </div>
                          {state.discount > 0 && (
                            <div className="flex justify-between text-sm text-green-600">
                              <span>Discount ({state.discountCode})</span>
                              <span>-LKR {state.discount.toLocaleString()}</span>
                            </div>
                          )}
                          <div className="border-t border-gray-200 pt-2">
                            <div className="flex justify-between text-base font-medium">
                              <span>Total</span>
                              <span>LKR {state.total.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>

                        <div className="mt-6">
                          <Button
                            onClick={handleCheckout}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                            disabled={state.isLoading}
                          >
                            {state.isLoading ? 'Processing...' : 'Proceed to Checkout'}
                          </Button>
                        </div>

                        <div className="mt-4 text-center">
                          <button
                            onClick={onClose}
                            className="text-sm text-blue-600 hover:text-blue-800"
                          >
                            Continue Shopping
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}
