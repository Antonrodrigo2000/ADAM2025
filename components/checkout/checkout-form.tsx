"use client"

import { useState } from "react"
import { Eye, EyeOff, Calendar, ChevronDown } from "lucide-react"
import { OrderSummary } from "./order-summary"

interface FormData {
  email: string
  password: string
  legalFirstName: string
  legalSurname: string
  dateOfBirth: string
  phoneNumber: string
  sex: string
  postcode: string
  city: string
  address: string
  agreeToTerms: boolean
  marketingOptOut: boolean
}

export function CheckoutForm() {
  const [currentStep, setCurrentStep] = useState(1)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
    legalFirstName: "",
    legalSurname: "",
    dateOfBirth: "",
    phoneNumber: "",
    sex: "",
    postcode: "",
    city: "",
    address: "",
    agreeToTerms: false,
    marketingOptOut: false,
  })

  const updateFormData = (field: keyof FormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleContinueToDelivery = () => {
    setCurrentStep(2)
  }

  const handleSubmit = () => {
    // Handle final submission
    console.log("Form submitted:", formData)
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {/* Left side - Form */}
          <div className="lg:col-span-2">
            {currentStep === 1 ? (
              <AccountCreationForm
                formData={formData}
                updateFormData={updateFormData}
                showPassword={showPassword}
                setShowPassword={setShowPassword}
                onContinue={handleContinueToDelivery}
              />
            ) : (
              <DeliveryAddressForm
                formData={formData}
                updateFormData={updateFormData}
                onSubmit={handleSubmit}
                onBack={() => setCurrentStep(1)}
              />
            )}
          </div>

          {/* Right side - Order Summary */}
          <div className="lg:col-span-1">
            <OrderSummary />
          </div>
        </div>
      </div>
    </div>
  )
}

interface AccountCreationFormProps {
  formData: FormData
  updateFormData: (field: keyof FormData, value: string | boolean) => void
  showPassword: boolean
  setShowPassword: (show: boolean) => void
  onContinue: () => void
}

function AccountCreationForm({
  formData,
  updateFormData,
  showPassword,
  setShowPassword,
  onContinue,
}: AccountCreationFormProps) {
  return (
    <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-neutral-200">
      {/* Header */}
      <div className="flex items-center mb-6">
        <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center font-bold mr-4">
          1
        </div>
        <h2 className="text-2xl font-bold text-neutral-800">Create an account</h2>
      </div>

      <div className="mb-4">
        <span className="text-neutral-600">Have an account? </span>
        <button className="text-teal-600 hover:text-teal-700 font-medium">Log in</button>
      </div>

      <form className="space-y-6">
        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">Email address</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => updateFormData("email", e.target.value)}
            className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-colors"
            required
          />
          <p className="text-sm text-neutral-500 mt-1">
            We will let you know via email once your prescription has been issued.
          </p>
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={(e) => updateFormData("password", e.target.value)}
              className="w-full px-4 py-3 pr-12 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-colors"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-700"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          <p className="text-sm text-neutral-500 mt-1">
            Password must be at least 12 characters, including a mix of letters, numbers, and special characters.
          </p>
        </div>

        {/* Identity Confirmation Notice */}
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <p className="text-sm text-orange-800">
            We are required to confirm the identity of our members. Any incorrect details will cause delays to your
            order.
          </p>
        </div>

        {/* Legal Names */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Legal first name</label>
            <input
              type="text"
              value={formData.legalFirstName}
              onChange={(e) => updateFormData("legalFirstName", e.target.value)}
              className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-colors"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Legal surname</label>
            <input
              type="text"
              value={formData.legalSurname}
              onChange={(e) => updateFormData("legalSurname", e.target.value)}
              className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-colors"
              required
            />
          </div>
        </div>
        <p className="text-sm text-neutral-500 -mt-2">
          Please write your name as it appears on your passport or ID. We need your full legal name to confirm your
          identity.
        </p>

        {/* Date of Birth */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">Date of birth</label>
          <div className="relative">
            <input
              type="text"
              placeholder="Day / Month / Year"
              value={formData.dateOfBirth}
              onChange={(e) => updateFormData("dateOfBirth", e.target.value)}
              className="w-full px-4 py-3 pr-12 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-colors"
              required
            />
            <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
          </div>
        </div>

        {/* Phone Number */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">Phone number</label>
          <input
            type="tel"
            value={formData.phoneNumber}
            onChange={(e) => updateFormData("phoneNumber", e.target.value)}
            className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-colors"
            required
          />
          <p className="text-sm text-neutral-500 mt-1">
            In very rare cases our clinicians may need to call you. They will always be discreet.
          </p>
        </div>

        {/* Sex */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">Sex</label>
          <div className="relative">
            <select
              value={formData.sex}
              onChange={(e) => updateFormData("sex", e.target.value)}
              className="w-full px-4 py-3 pr-10 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-colors appearance-none bg-white"
              required
            >
              <option value="">Choose sex</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500 pointer-events-none" />
          </div>
          <p className="text-sm text-neutral-500 mt-1">
            What sex were you assigned at birth, as shown on your original birth certificate. This is important for us
            to know because it allows us to provide you with treatments as safely as possible.
          </p>
        </div>

        {/* Continue Button */}
        <button
          type="button"
          onClick={onContinue}
          className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-4 px-6 rounded-xl transition-colors duration-200"
        >
          Continue
        </button>
      </form>
    </div>
  )
}

interface DeliveryAddressFormProps {
  formData: FormData
  updateFormData: (field: keyof FormData, value: string | boolean) => void
  onSubmit: () => void
  onBack: () => void
}

function DeliveryAddressForm({ formData, updateFormData, onSubmit, onBack }: DeliveryAddressFormProps) {
  return (
    <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-neutral-200">
      {/* Header */}
      <div className="flex items-center mb-6">
        <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center font-bold mr-4">
          2
        </div>
        <h2 className="text-2xl font-bold text-neutral-800">Delivery address</h2>
      </div>

      <div className="bg-neutral-100 border border-neutral-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-neutral-700">
          Please make sure your address is accurate. Try using our auto-complete option. This will help us confirm your
          identity.
        </p>
      </div>

      <form className="space-y-6">
        {/* Postcode */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">Postcode</label>
          <input
            type="text"
            value={formData.postcode}
            onChange={(e) => updateFormData("postcode", e.target.value)}
            className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-colors"
            required
          />
        </div>

        {/* City */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">City</label>
          <input
            type="text"
            value={formData.city}
            onChange={(e) => updateFormData("city", e.target.value)}
            className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-colors"
            required
          />
        </div>

        {/* Address */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">Address</label>
          <textarea
            value={formData.address}
            onChange={(e) => updateFormData("address", e.target.value)}
            rows={3}
            className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-colors resize-none"
            required
          />
        </div>

        {/* Terms Agreement */}
        <div className="space-y-4">
          <label className="flex items-start space-x-3">
            <input
              type="checkbox"
              checked={formData.agreeToTerms}
              onChange={(e) => updateFormData("agreeToTerms", e.target.checked)}
              className="w-5 h-5 text-teal-600 border-2 border-neutral-300 rounded focus:ring-teal-500 focus:ring-2 mt-0.5"
              required
            />
            <span className="text-sm text-neutral-700">
              Yes, I agree to Adam's{" "}
              <button type="button" className="text-teal-600 hover:text-teal-700 underline">
                Terms & Conditions
              </button>{" "}
              and{" "}
              <button type="button" className="text-teal-600 hover:text-teal-700 underline">
                Privacy Policy
              </button>
              .
            </span>
          </label>

          <label className="flex items-start space-x-3">
            <input
              type="checkbox"
              checked={formData.marketingOptOut}
              onChange={(e) => updateFormData("marketingOptOut", e.target.checked)}
              className="w-5 h-5 text-teal-600 border-2 border-neutral-300 rounded focus:ring-teal-500 focus:ring-2 mt-0.5"
            />
            <span className="text-sm text-neutral-700">
              I do not wish to receive marketing communications that include special offers, promotions, or educational
              content.
            </span>
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            type="button"
            onClick={onBack}
            className="flex-1 bg-neutral-200 hover:bg-neutral-300 text-neutral-800 font-bold py-4 px-6 rounded-xl transition-colors duration-200"
          >
            Back
          </button>
          <button
            type="button"
            onClick={onSubmit}
            className="flex-1 bg-teal-500 hover:bg-teal-600 text-white font-bold py-4 px-6 rounded-xl transition-colors duration-200"
          >
            Continue
          </button>
        </div>
      </form>
    </div>
  )
}
