"use client"
import Link from "next/link"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import Image from "next/image"

export function PatientDashboard() {
  // Mock data for dynamic display
  const patientName = "Anton Shamindra"
  const patientEmail = "antonrodrigo.baskr@gmail.com"
  const tasksCompleted = 0
  const totalTasks = 1
  const progressValue = (tasksCompleted / totalTasks) * 100

  const treatments = [
    {
      id: "rosemary-oil",
      name: "Rosemary Oil",
      image: "/placeholder.svg?height=48&width=48",
      status: "Active",
      details: null,
      link: "/products/rosemary-oil",
    },
    {
      id: "hair-kit",
      name: "Hair Kit - Medicated Spray, Finasteride & Supplement",
      image: "/placeholder.svg?height=48&width=48",
      status: "Pending clinical review",
      details: "3 kits • Extra Strength Spray 6%, Finasteride 1mg, 1 Hair Growth Support",
      link: "/products/minoxidil-5",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Premium Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="neomorphic-avatar">
                <Avatar className="w-12 h-12 bg-gradient-to-br from-gray-800 to-gray-900 text-white shadow-lg">
                  <AvatarFallback className="text-sm font-semibold bg-transparent">AS</AvatarFallback>
                </Avatar>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-gray-900 tracking-tight">
                  Welcome back, {patientName.split(" ")[0]}
                </h1>
                <p className="text-sm text-gray-600 font-medium">Your health dashboard</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="neomorphic-icon-button">
                <div className="w-5 h-5 bg-gray-700 rounded-full relative">
                  <div className="absolute top-1 right-1 w-2 h-2 bg-orange-500 rounded-full"></div>
                </div>
              </button>
              <button className="neomorphic-icon-button">
                <div className="w-5 h-5 bg-gray-700 rounded-sm"></div>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-8 space-y-6">
            {/* Quick Actions Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="neomorphic-card group cursor-pointer hover:shadow-xl transition-all duration-300">
                <div className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="neomorphic-icon-container bg-gradient-to-br from-blue-500 to-blue-600">
                      <div className="w-6 h-6 bg-white rounded-full relative">
                        <div className="absolute inset-2 bg-blue-600 rounded-full"></div>
                        <div className="absolute top-1 left-1 w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 text-lg">Book Consultation</h3>
                      <p className="text-gray-600 text-sm font-medium">Chat with a clinician</p>
                    </div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full group-hover:bg-orange-500 transition-colors"></div>
                  </div>
                </div>
              </div>

              <div className="neomorphic-card group cursor-pointer hover:shadow-xl transition-all duration-300">
                <div className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="neomorphic-icon-container bg-gradient-to-br from-green-500 to-green-600">
                      <div className="w-6 h-6 bg-white rounded-sm relative">
                        <div className="absolute inset-1 bg-green-600 rounded-sm"></div>
                        <div className="absolute top-2 left-2 w-2 h-1 bg-white rounded-full"></div>
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 text-lg">Order Refill</h3>
                      <p className="text-gray-600 text-sm font-medium">Reorder treatments</p>
                    </div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full group-hover:bg-orange-500 transition-colors"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Current Treatments */}
            <div className="neomorphic-card">
              <div className="p-6 sm:p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Current Treatments</h2>
                  <div className="w-1 h-6 bg-gradient-to-b from-orange-500 to-orange-600 rounded-full"></div>
                </div>
                <div className="space-y-4">
                  {treatments.map((treatment) => (
                    <Link href={treatment.link} key={treatment.id} className="block">
                      <div className="neomorphic-treatment-card group cursor-pointer">
                        <div className="p-5">
                          <div className="flex items-center gap-4">
                            <div className="neomorphic-product-image">
                              <Image
                                src={treatment.image || "/placeholder.svg"}
                                alt={treatment.name}
                                width={40}
                                height={40}
                                className="object-contain"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-gray-900 text-base mb-1 truncate">{treatment.name}</h3>
                              <div className="flex items-center gap-3 mb-2">
                                <span
                                  className={`neomorphic-status-badge ${
                                    treatment.status === "Active"
                                      ? "bg-gradient-to-r from-green-500 to-green-600 text-white"
                                      : "bg-gradient-to-r from-yellow-500 to-yellow-600 text-white"
                                  }`}
                                >
                                  {treatment.status}
                                </span>
                              </div>
                              {treatment.details && (
                                <p className="text-xs text-gray-600 font-medium line-clamp-1">{treatment.details}</p>
                              )}
                            </div>
                            <div className="w-3 h-3 bg-gray-400 rounded-full group-hover:bg-orange-500 transition-colors flex-shrink-0"></div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="neomorphic-card">
              <div className="p-6 sm:p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Recent Activity</h2>
                  <div className="w-1 h-6 bg-gradient-to-b from-purple-500 to-purple-600 rounded-full"></div>
                </div>
                <div className="text-center py-12">
                  <div className="neomorphic-empty-state mx-auto mb-4">
                    <div className="w-8 h-8 bg-gray-400 rounded-lg"></div>
                  </div>
                  <p className="text-gray-600 font-medium">No recent activity</p>
                  <p className="text-gray-500 text-sm mt-1">Your activity will appear here</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            {/* Account Setup */}
            <div className="neomorphic-card">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900">Account Setup</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-600">
                      {tasksCompleted}/{totalTasks}
                    </span>
                    <div className="neomorphic-progress-container">
                      <Progress value={progressValue} className="w-16 h-2 bg-transparent" />
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="neomorphic-task-item">
                    <div className="flex items-start gap-3 p-4">
                      <div className="w-3 h-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full mt-1 flex-shrink-0"></div>
                      <div className="flex-1">
                        <p className="font-bold text-gray-900 text-sm mb-1">Verify your account</p>
                        <p className="text-xs text-gray-600 leading-relaxed">
                          Check your email at <span className="font-bold text-gray-900">{patientEmail}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                  <button className="neomorphic-primary-button w-full">
                    <span className="font-bold text-white">Resend verification</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="neomorphic-card">
              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Stats</h3>
                <div className="space-y-4">
                  <div className="neomorphic-stat-item">
                    <div className="flex justify-between items-center p-3">
                      <span className="text-sm font-medium text-gray-700">Active treatments</span>
                      <span className="text-sm font-bold text-gray-900">2</span>
                    </div>
                  </div>
                  <div className="neomorphic-stat-item">
                    <div className="flex justify-between items-center p-3">
                      <span className="text-sm font-medium text-gray-700">Next appointment</span>
                      <span className="text-sm font-bold text-gray-900">None scheduled</span>
                    </div>
                  </div>
                  <div className="neomorphic-stat-item">
                    <div className="flex justify-between items-center p-3">
                      <span className="text-sm font-medium text-gray-700">Account status</span>
                      <span className="text-sm font-bold text-yellow-600">Pending verification</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
