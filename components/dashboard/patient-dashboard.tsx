"use client"
import Link from "next/link"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ChevronRight, Stethoscope, Settings, Package, Info, Bell } from "lucide-react"
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
      details: "3 kits\nExtra Strength Spray 6%, Finasteride 1mg, 1 Hair Growth Support",
      link: "/products/minoxidil-5",
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simplified Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="w-8 h-8 bg-gray-900 text-white">
              <AvatarFallback className="text-sm font-medium">AS</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Welcome back, {patientName.split(" ")[0]}</h1>
              <p className="text-sm text-gray-500">Your health dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
              <Bell className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="border-0 shadow-sm bg-white">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Stethoscope className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">Book Consultation</h3>
                      <p className="text-sm text-gray-500">Chat with a clinician</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm bg-white">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <Package className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">Order Refill</h3>
                      <p className="text-sm text-gray-500">Reorder treatments</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Current Treatments */}
            <Card className="border-0 shadow-sm bg-white">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold text-gray-900">Current Treatments</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {treatments.map((treatment) => (
                  <Link href={treatment.link} key={treatment.id} className="block">
                    <div className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer border border-gray-100">
                      <div className="w-12 h-12 flex items-center justify-center bg-gray-100 rounded-lg mr-3 shrink-0">
                        <Image
                          src={treatment.image || "/placeholder.svg"}
                          alt={treatment.name}
                          width={32}
                          height={32}
                          className="object-contain"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-sm truncate">{treatment.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                              treatment.status === "Active"
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {treatment.status}
                          </span>
                        </div>
                        {treatment.details && (
                          <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                            {treatment.details.replace("\n", " • ")}
                          </p>
                        )}
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400 ml-2 shrink-0" />
                    </div>
                  </Link>
                ))}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="border-0 shadow-sm bg-white">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold text-gray-900">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg mx-auto mb-3 flex items-center justify-center">
                    <Info className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-gray-500 text-sm">No recent activity</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar - Tasks & Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Account Tasks */}
            <Card className="border-0 shadow-sm bg-white">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-sm font-semibold text-gray-900">
                  Account Setup
                  <div className="flex items-center gap-2 text-gray-500 text-xs">
                    <span>
                      {tasksCompleted}/{totalTasks}
                    </span>
                    <Progress value={progressValue} className="w-16 h-1.5 bg-gray-200" />
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full" />
                    <p className="font-medium text-gray-900 text-sm">Verify your account</p>
                  </div>
                  <p className="text-xs text-gray-600 pl-4">
                    Check your email at <span className="font-medium text-gray-900">{patientEmail}</span>
                  </p>
                </div>
                <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
                  Resend verification
                </Button>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="border-0 shadow-sm bg-white">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-gray-900">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Active treatments</span>
                  <span className="text-sm font-medium text-gray-900">2</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Next appointment</span>
                  <span className="text-sm font-medium text-gray-900">None scheduled</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Account status</span>
                  <span className="text-sm font-medium text-yellow-600">Pending verification</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
