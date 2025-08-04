"use client"

import { useState } from "react"

// Mock data based on Supabase schema
const mockUser = {
  id: "1",
  email: "antonrodrigo.baskr@gmail.com",
  full_name: "Anton Shamindra",
  avatar_url: null,
  email_verified: false,
}

const mockSubscriptions = [
  {
    id: "1",
    product_name: "Hair Kit - Medicated Spray, Finasteride & Supplement",
    category: "Hair loss",
    status: "paused",
    price: 120.0,
    billing_cycle: "3 months",
    kit_count: 3,
    description: "Extra Strength Spray 6%, Finasteride 1mg, 1 Hair Growth Support",
  },
  {
    id: "2",
    product_name: "Rosemary Oil",
    category: "Hair loss",
    status: "paused",
    price: 21.0,
    original_price: 29.0,
    billing_cycle: "month",
    kit_count: null,
    description: null,
  },
]

const mockTasks = [
  {
    id: "1",
    title: "Verify your account",
    description: "Follow the link we have sent to antonrodrigo.baskr@gmail.com to verify your account.",
    completed: false,
    action: "Resend confirmation email",
  },
]

export default function DashboardPage() {
  const [user] = useState(mockUser)
  const [subscriptions] = useState(mockSubscriptions)
  const [tasks] = useState(mockTasks)

  const completedTasks = tasks.filter((task) => task.completed).length
  const totalTasks = tasks.length

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-4 sm:px-6">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-white text-sm font-medium">
              {user.full_name?.charAt(0) || "A"}
            </div>
            <h1 className="text-lg font-medium text-gray-900">Welcome back, {user.full_name}</h1>
          </div>
          <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="sr-only">Settings</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Consultations Section */}
            <section className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-4">CONSULTATIONS</h2>
              <div className="text-center py-8">
                <div className="w-12 h-12 mx-auto mb-4 text-gray-400">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                </div>
                <p className="text-gray-600 mb-6 max-w-sm mx-auto">Book a chat with one of our certified clinicians.</p>
                <button className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors">
                  Book a consultation
                </button>
              </div>
            </section>

            {/* Treatments Section */}
            <section className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-6">TREATMENTS</h2>

              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-700 mb-4">Hair loss</h3>
                <div className="space-y-4">
                  {subscriptions.map((subscription) => (
                    <div
                      key={subscription.id}
                      className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg"
                    >
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex-shrink-0"></div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 mb-1">{subscription.product_name}</h4>
                        <div className="flex items-center space-x-4 text-xs text-gray-500 mb-2">
                          <span className="flex items-center">
                            <div className="w-2 h-2 bg-orange-400 rounded-full mr-1"></div>
                            Paused
                          </span>
                          {subscription.kit_count && (
                            <span className="flex items-center">
                              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                              </svg>
                              {subscription.kit_count} kits
                            </span>
                          )}
                        </div>
                        {subscription.description && (
                          <p className="text-xs text-gray-500 mb-2">{subscription.description}</p>
                        )}
                        <div className="flex items-center justify-between">
                          <div className="text-sm">
                            {subscription.original_price && (
                              <span className="text-gray-400 line-through mr-2">
                                £{subscription.original_price.toFixed(2)}
                              </span>
                            )}
                            <span className="font-medium text-gray-900">
                              £{subscription.price.toFixed(2)} / {subscription.billing_cycle}
                            </span>
                          </div>
                          <button className="px-4 py-1 bg-teal-500 text-white text-sm rounded-md hover:bg-teal-600 transition-colors">
                            Unpause
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Test Results Section */}
            <section className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide">TEST RESULTS</h2>
                <button className="text-gray-400 hover:text-gray-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </section>
          </div>

          {/* Right Column - Tasks */}
          <div className="lg:col-span-1">
            <section className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide">MY TASKS</h2>
                <span className="text-sm text-gray-500">
                  {completedTasks} / {totalTasks}
                </span>
              </div>

              <div className="space-y-4">
                {tasks.map((task) => (
                  <div key={task.id} className="border-l-4 border-orange-400 pl-4">
                    <div className="flex items-start space-x-2 mb-2">
                      <div className="w-2 h-2 bg-orange-400 rounded-full mt-2 flex-shrink-0"></div>
                      <h3 className="text-sm font-medium text-gray-900">{task.title}</h3>
                    </div>
                    <p className="text-xs text-gray-600 mb-3 ml-4">{task.description}</p>
                    <button className="ml-4 px-4 py-2 bg-teal-500 text-white text-xs rounded-md hover:bg-teal-600 transition-colors">
                      {task.action}
                    </button>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}
