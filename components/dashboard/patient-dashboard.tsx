"use client"
import Link from "next/link"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ChevronRight, Stethoscope, Settings, Package, Box, Info } from "lucide-react"
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
      image: "/placeholder.svg?height=64&width=64",
      status: null,
      details: null,
      link: "#",
    },
    {
      id: "hair-kit",
      name: "Hair Kit - Medicated Spray, Finasteride & Supplement",
      image: "/placeholder.svg?height=64&width=64",
      status: "Pending clinical review",
      details: "3 kits\nExtra Strength Spray 6%, Finasteride 1mg, 1 Hair Growth Support",
      link: "#",
    },
  ]

  return (
    <div className="min-h-screen bg-neutral-50 p-4 md:p-8">
      {/* Header */}
      <header className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Avatar className="w-10 h-10 bg-neutral-800 text-white font-semibold">
            <AvatarFallback>A</AvatarFallback>
          </Avatar>
          <h1 className="text-2xl font-semibold text-neutral-900">Welcome back, {patientName}</h1>
        </div>
        <Button variant="ghost" size="icon" className="rounded-full text-neutral-600 hover:text-neutral-900">
          <Settings className="w-6 h-6" />
          <span className="sr-only">Settings</span>
        </Button>
      </header>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Consultations Card */}
          <Card className="rounded-xl shadow-sm border border-neutral-200 bg-white">
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-semibold uppercase text-neutral-500">Consultations</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-8 text-center">
              <Stethoscope className="w-16 h-16 text-neutral-400 mb-4" />
              <p className="text-neutral-600 mb-6 max-w-xs">Book a chat with one of our certified clinicians.</p>
              <Button
                variant="outline"
                className="rounded-full border-neutral-300 text-neutral-800 hover:bg-neutral-100 bg-transparent"
              >
                Book a consultation
              </Button>
            </CardContent>
          </Card>

          {/* Treatments Section */}
          <Card className="rounded-xl shadow-sm border border-neutral-200 bg-white">
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-semibold uppercase text-neutral-500">Treatments</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <h3 className="text-lg font-semibold text-neutral-800">Hair loss</h3>
              <div className="space-y-3">
                {treatments.map((treatment) => (
                  <Link href={treatment.link} key={treatment.id} className="block">
                    <div className="flex items-center p-3 rounded-lg hover:bg-neutral-50 transition-colors cursor-pointer">
                      <div className="w-16 h-16 flex items-center justify-center bg-neutral-100 rounded-md mr-4 shrink-0">
                        <Image
                          src={treatment.image || "/placeholder.svg"}
                          alt={treatment.name}
                          width={48}
                          height={48}
                          className="object-contain"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-neutral-800 truncate">{treatment.name}</p>
                        {treatment.details && (
                          <div className="text-sm text-neutral-500 mt-1 space-y-0.5">
                            {treatment.details.split("\n").map((line, index) => (
                              <p key={index} className="flex items-center gap-1">
                                {line.includes("kits") && <Package className="w-3 h-3" />}
                                {line.includes("Extra Strength") && <Box className="w-3 h-3" />}
                                {line}
                              </p>
                            ))}
                          </div>
                        )}
                        {treatment.status && (
                          <p className="text-sm text-neutral-500 mt-1 flex items-center gap-1">
                            <Info className="w-3 h-3" />
                            {treatment.status}
                          </p>
                        )}
                      </div>
                      <ChevronRight className="w-5 h-5 text-neutral-400 ml-4 shrink-0" />
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Test Results Section */}
          <Card className="rounded-xl shadow-sm border border-neutral-200 bg-white">
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-semibold uppercase text-neutral-500">Test Results</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between py-4">
              <p className="text-neutral-600">No test results available yet.</p>
              <Button variant="ghost" size="icon" className="rounded-full text-neutral-600 hover:text-neutral-900">
                <ChevronRight className="w-5 h-5" />
                <span className="sr-only">View Test Results</span>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - My Tasks */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="rounded-xl shadow-sm border border-neutral-200 bg-white">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center justify-between text-sm font-semibold uppercase text-neutral-500">
                MY TASKS
                <div className="flex items-center gap-2 text-neutral-500 text-xs">
                  <span>
                    {tasksCompleted}/{totalTasks}
                  </span>
                  <Progress value={progressValue} className="w-20 h-2 bg-neutral-200" />
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-orange-500 rounded-full" />
                  <p className="font-medium text-neutral-800">Verify your account</p>
                </div>
                <p className="text-sm text-neutral-600">
                  Follow the link we have sent to <span className="font-semibold text-neutral-800">{patientEmail}</span>{" "}
                  to verify your account.
                </p>
              </div>
              <Button className="w-full bg-teal-500 text-white rounded-full hover:bg-teal-600">
                Resend confirmation email
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
