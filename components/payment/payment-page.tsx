"use client"

import { useState } from "react"
import { Plus, Info, X, CreditCard, Calendar, Lock } from "lucide-react"

interface OrderItem {
  id: string
  name: string
  description: string
  price: number
  originalPrice?: number
  subscription?: string
  image?: string
  deliveryInfo?: string
}

interface OrderData {
  items: OrderItem[]
  subtotal: number
  discount: number
  discountLabel?: string
  delivery: number
  deliveryLabel?: string
  total: number
}

interface Address {
  id: string
  fullName: string
  addressLine1: string
  addressLine2: string
  city: string
  postcode: string
  isDefault?: boolean
}

interface SavedCard {
  id: string
  last4: string
  brand: string
  expiryMonth: string
  expiryYear: string
  cardholderName: string
}

interface AddressForm {
  fullName: string
  addressLine1: string
  addressLine2: string
  city: string
  postcode: string
}

interface CardDetails {
  cardNumber: string
  expiryDate: string
  cvc: string
  cardholderName: string
}

export function PaymentPage() {
  const [sameAsDelivery, setSameAsDelivery] = useState(true)
  const [showNewAddressForm, setShowNewAddressForm] = useState(false)
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [selectedAddressId, setSelectedAddressId] = useState("default")
  const [selectedCardId, setSelectedCardId] = useState("")

  const [addresses, setAddresses] = useState<Address[]>([
    {
      id: "default",
      fullName: "Ejf Traffic Ltd",
      addressLine1: "14 Temple Road",
      addressLine2: "",
      city: "Norwich",
      postcode: "NR31ED",
      isDefault: true,
    },
  ])

  const [savedCards, setSavedCards] = useState<SavedCard[]>([])

  const [newAddress, setNewAddress] = useState<AddressForm>({
    fullName: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    postcode: "",
  })

  const [cardDetails, setCardDetails] = useState<CardDetails>({
    cardNumber: "",
    expiryDate: "",
    cvc: "",
    cardholderName: "",
  })

  const [orderData] = useState<OrderData>({
    items: [
      {
        id: "hair-kit",
        name: "Hair Kit - Medicated Spray, Finasteride & Supplement",
        price: 120.0,
        deliveryInfo: "(Delivered as 3 kits every 3 months)",
        image: "/placeholder.svg?height=45&width=45&text=HK",
      },
      {
        id: "rosemary-oil",
        name: "Rosemary Oil",
        price: 21.0,
        originalPrice: 28.0,
        subscription: "Monthly",
        image: "/placeholder.svg?height=45&width=45&text=RO",
      },
    ],
    subtotal: 141.0,
    discount: 40.0,
    discountLabel: "Save 50% on your first order (max. £40)",
    delivery: 0,
    deliveryLabel: "Free",
    total: 101.0,
  })

  const removeItem = (itemId: string) => {
    console.log("Remove item:", itemId)
  }

  const handleAddressChange = (field: keyof AddressForm, value: string) => {
    setNewAddress((prev) => ({ ...prev, [field]: value }))
  }

  const handleCardDetailsChange = (field: keyof CardDetails, value: string) => {
    setCardDetails((prev) => ({ ...prev, [field]: value }))
  }

  const handleUseNewAddress = () => {
    setShowNewAddressForm(true)
  }

  const handleCancelNewAddress = () => {
    setShowNewAddressForm(false)
    setNewAddress({
      fullName: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      postcode: "",
    })
  }

  const handleSaveNewAddress = () => {
    if (newAddress.fullName && newAddress.addressLine1 && newAddress.city && newAddress.postcode) {
      const newAddressWithId: Address = {
        id: `address-${Date.now()}`,
        ...newAddress,
      }
      setAddresses((prev) => [...prev, newAddressWithId])
      setSelectedAddressId(newAddressWithId.id)
      setShowNewAddressForm(false)
      setNewAddress({
        fullName: "",
        addressLine1: "",
        addressLine2: "",
        city: "",
        postcode: "",
      })
    }
  }

  const handleAddPaymentMethod = () => {
    setShowPaymentForm(true)
  }

  const handleCancelPayment = () => {
    setShowPaymentForm(false)
    setCardDetails({
      cardNumber: "",
      expiryDate: "",
      cvc: "",
      cardholderName: "",
    })
  }

  const handleSavePaymentMethod = () => {
    if (cardDetails.cardNumber && cardDetails.expiryDate && cardDetails.cvc && cardDetails.cardholderName) {
      // Simulate card authorization
      const cardNumber = cardDetails.cardNumber.replace(/\s/g, "")
      const [month, year] = cardDetails.expiryDate.split("/")

      const newCard: SavedCard = {
        id: `card-${Date.now()}`,
        last4: cardNumber.slice(-4),
        brand: getBrandFromCardNumber(cardNumber),
        expiryMonth: month,
        expiryYear: year,
        cardholderName: cardDetails.cardholderName,
      }

      setSavedCards((prev) => [...prev, newCard])
      setSelectedCardId(newCard.id)
      setShowPaymentForm(false)
      setCardDetails({
        cardNumber: "",
        expiryDate: "",
        cvc: "",
        cardholderName: "",
      })
    }
  }

  const getBrandFromCardNumber = (cardNumber: string): string => {
    const firstDigit = cardNumber.charAt(0)
    if (firstDigit === "4") return "Visa"
    if (firstDigit === "5") return "Mastercard"
    if (firstDigit === "3") return "Amex"
    return "Card"
  }

  const handleConfirmTreatment = () => {
    console.log("Treatment confirmed!")
    // Handle treatment confirmation logic
  }

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "")
    const matches = v.match(/\d{4,16}/g)
    const match = (matches && matches[0]) || ""
    const parts = []
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }
    if (parts.length) {
      return parts.join(" ")
    } else {
      return v
    }
  }

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "")
    if (v.length >= 2) {
      return v.substring(0, 2) + "/" + v.substring(2, 4)
    }
    return v
  }

  const formatAddress = (address: Address) => {
    const parts = [address.addressLine1, address.addressLine2, address.city, address.postcode].filter(Boolean)
    return parts.join(", ")
  }

  const isPaymentComplete = savedCards.length > 0 && selectedCardId

  return (
    <div className="min-h-screen bg-neutral-100">
      <style jsx>{`
        @keyframes subtle-glow {
          0%, 100% {
            box-shadow: 0 0 5px rgba(0, 0, 0, 0.1), 0 0 10px rgba(0, 0, 0, 0.05), 0 0 15px rgba(0, 0, 0, 0.02);
          }
          50% {
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.15), 0 0 20px rgba(0, 0, 0, 0.1), 0 0 30px rgba(0, 0, 0, 0.05);
          }
        }
        
        .glow-animation {
          animation: subtle-glow 2s ease-in-out infinite;
        }
      `}</style>

      <div className="container mx-auto px-2 py-4 max-w-5xl">
        {/* Page Header */}
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-neutral-800">Order summary</h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-4">
          {/* Left side - Payment Details */}
          <div className="lg:col-span-2 space-y-4">
            {/* Delivery and Payment Details */}
            <div className="neomorphic-container p-4">
              <h2 className="text-lg font-bold text-neutral-800 mb-3">Delivery and payment details</h2>
              <p className="text-xs text-neutral-600 mb-4">
                Please make sure the delivery address and payment details below are correct before placing your order.
              </p>

              {/* Delivery Address Section */}
              <div className="mb-6">
                <div className="flex items-center mb-3">
                  <div className="w-5 h-5 bg-black text-white rounded-full flex items-center justify-center font-bold mr-2 text-xs">
                    1
                  </div>
                  <h3 className="text-base font-semibold text-neutral-800">Delivery address</h3>
                </div>

                {!showNewAddressForm ? (
                  <>
                    {/* Address List */}
                    <div className="space-y-2 mb-3">
                      {addresses.map((address) => (
                        <label
                          key={address.id}
                          className="flex items-start space-x-3 cursor-pointer p-2 rounded-lg hover:bg-neutral-50"
                        >
                          <input
                            type="radio"
                            name="selectedAddress"
                            value={address.id}
                            checked={selectedAddressId === address.id}
                            onChange={(e) => setSelectedAddressId(e.target.value)}
                            className="w-4 h-4 text-purple-600 border-2 border-neutral-300 rounded-full focus:ring-purple-500 focus:ring-2 mt-0.5"
                          />
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-medium text-neutral-800">{address.fullName}</span>
                              {address.isDefault && (
                                <span className="text-xs bg-neutral-200 text-neutral-600 px-2 py-0.5 rounded">
                                  Default
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-neutral-600 mt-0.5">{formatAddress(address)}</div>
                          </div>
                        </label>
                      ))}
                    </div>

                    <button
                      onClick={handleUseNewAddress}
                      className="w-full h-10 flex items-center justify-center text-neutral-700 text-sm font-medium hover:bg-neutral-50 transition-colors bg-white rounded-lg shadow-md hover:shadow-lg border border-neutral-200"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Use new address
                    </button>
                  </>
                ) : (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm font-medium text-neutral-700">Add new address</span>
                      <button onClick={handleCancelNewAddress} className="text-neutral-500 hover:text-neutral-700">
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                      <input
                        type="text"
                        placeholder="Full name"
                        value={newAddress.fullName}
                        onChange={(e) => handleAddressChange("fullName", e.target.value)}
                        className="neomorphic-input-wrapper h-10 px-3 text-sm"
                      />
                      <input
                        type="text"
                        placeholder="Address line 1"
                        value={newAddress.addressLine1}
                        onChange={(e) => handleAddressChange("addressLine1", e.target.value)}
                        className="neomorphic-input-wrapper h-10 px-3 text-sm"
                      />
                      <input
                        type="text"
                        placeholder="Address line 2 (optional)"
                        value={newAddress.addressLine2}
                        onChange={(e) => handleAddressChange("addressLine2", e.target.value)}
                        className="neomorphic-input-wrapper h-10 px-3 text-sm"
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="text"
                          placeholder="City"
                          value={newAddress.city}
                          onChange={(e) => handleAddressChange("city", e.target.value)}
                          className="neomorphic-input-wrapper h-10 px-3 text-sm"
                        />
                        <input
                          type="text"
                          placeholder="Postcode"
                          value={newAddress.postcode}
                          onChange={(e) => handleAddressChange("postcode", e.target.value)}
                          className="neomorphic-input-wrapper h-10 px-3 text-sm"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={handleSaveNewAddress}
                        className="flex-1 bg-black hover:bg-neutral-800 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 text-sm"
                      >
                        Save address
                      </button>
                      <button
                        onClick={handleCancelNewAddress}
                        className="flex-1 bg-white rounded-lg shadow-md hover:shadow-lg border border-neutral-200 py-2 px-4 text-neutral-700 font-medium hover:bg-neutral-50 transition-colors text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Billing Address Section */}
              <div className="mb-6">
                <div className="flex items-center mb-3">
                  <div className="w-5 h-5 bg-black text-white rounded-full flex items-center justify-center font-bold mr-2 text-xs">
                    2
                  </div>
                  <h3 className="text-base font-semibold text-neutral-800">Billing address</h3>
                </div>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sameAsDelivery}
                    onChange={(e) => setSameAsDelivery(e.target.checked)}
                    className="w-4 h-4 text-purple-600 border-2 border-neutral-300 rounded focus:ring-purple-500 focus:ring-2"
                  />
                  <span className="text-sm text-neutral-700 font-medium">Same as delivery address</span>
                </label>
              </div>

              {/* Payment Method Section */}
              <div className="mb-4">
                <h3 className="text-base font-semibold text-neutral-800 mb-3">How would you like to pay?</h3>

                {/* Saved Cards List */}
                {savedCards.length > 0 && (
                  <div className="space-y-2 mb-3">
                    {savedCards.map((card) => (
                      <label
                        key={card.id}
                        className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg hover:bg-neutral-50 border border-neutral-200"
                      >
                        <input
                          type="radio"
                          name="selectedCard"
                          value={card.id}
                          checked={selectedCardId === card.id}
                          onChange={(e) => setSelectedCardId(e.target.value)}
                          className="w-4 h-4 text-purple-600 border-2 border-neutral-300 rounded-full focus:ring-purple-500 focus:ring-2"
                        />
                        <CreditCard className="w-5 h-5 text-neutral-600" />
                        <div className="flex-1">
                          <div className="text-sm font-medium text-neutral-800">
                            {card.brand} ending in {card.last4}
                          </div>
                          <div className="text-xs text-neutral-600">
                            Expires {card.expiryMonth}/{card.expiryYear} • {card.cardholderName}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                )}

                {!showPaymentForm ? (
                  <button
                    onClick={handleAddPaymentMethod}
                    className={`w-full bg-black hover:bg-neutral-800 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center text-sm ${savedCards.length === 0 ? "glow-animation" : ""}`}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add payment method
                  </button>
                ) : (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm font-medium text-neutral-700">Add payment method</span>
                      <button onClick={handleCancelPayment} className="text-neutral-500 hover:text-neutral-700">
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Cardholder name"
                          value={cardDetails.cardholderName}
                          onChange={(e) => handleCardDetailsChange("cardholderName", e.target.value)}
                          className="neomorphic-input-wrapper h-10 px-3 text-sm w-full"
                        />
                      </div>

                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Card number"
                          value={cardDetails.cardNumber}
                          onChange={(e) => handleCardDetailsChange("cardNumber", formatCardNumber(e.target.value))}
                          maxLength={19}
                          className="neomorphic-input-wrapper h-10 px-3 pr-10 text-sm w-full"
                        />
                        <CreditCard className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="MM/YY"
                            value={cardDetails.expiryDate}
                            onChange={(e) => handleCardDetailsChange("expiryDate", formatExpiryDate(e.target.value))}
                            maxLength={5}
                            className="neomorphic-input-wrapper h-10 px-3 pr-10 text-sm w-full"
                          />
                          <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
                        </div>

                        <div className="relative">
                          <input
                            type="text"
                            placeholder="CVC"
                            value={cardDetails.cvc}
                            onChange={(e) =>
                              handleCardDetailsChange("cvc", e.target.value.replace(/\D/g, "").slice(0, 4))
                            }
                            maxLength={4}
                            className="neomorphic-input-wrapper h-10 px-3 pr-10 text-sm w-full"
                          />
                          <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={handleSavePaymentMethod}
                        className="flex-1 bg-black hover:bg-neutral-800 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 text-sm"
                      >
                        Save payment method
                      </button>
                      <button
                        onClick={handleCancelPayment}
                        className="flex-1 bg-white rounded-lg shadow-md hover:shadow-lg border border-neutral-200 py-2 px-4 text-neutral-700 font-medium hover:bg-neutral-50 transition-colors text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Payment Notice */}
              <div className="flex items-start space-x-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-blue-800">
                  You won't be charged until our clinical team have reviewed and confirmed your order.
                </p>
              </div>

              {/* Confirm Treatment Button */}
              {isPaymentComplete && (
                <div className="mt-4">
                  <button
                    onClick={handleConfirmTreatment}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-lg transition-colors duration-200 text-base glow-animation"
                  >
                    Confirm Treatment
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right side - Order Summary */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-4">
              <div className="neomorphic-container p-4">
                <h2 className="text-lg font-bold text-neutral-800 mb-4">Your order</h2>

                {/* Order Items */}
                <div className="space-y-4 mb-4">
                  {orderData.items.map((item) => (
                    <div key={item.id} className="flex items-start space-x-3">
                      <div className="w-12 h-12 bg-neutral-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <img
                          src={item.image || "/placeholder.svg"}
                          alt={item.name}
                          className="w-9 h-9 object-contain"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-neutral-800 text-xs leading-tight mb-1">{item.name}</h3>
                        {item.deliveryInfo && <p className="text-xs text-neutral-600 mb-1">{item.deliveryInfo}</p>}
                        {item.subscription && (
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-neutral-600">{item.subscription}</span>
                            <button
                              onClick={() => removeItem(item.id)}
                              className="text-xs text-neutral-500 hover:text-red-600 underline transition-colors"
                            >
                              Remove
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="text-right flex-shrink-0">
                        <div className="font-bold text-neutral-800 text-base">£{item.price.toFixed(2)}</div>
                        {item.originalPrice && (
                          <div className="text-xs text-neutral-500 line-through">£{item.originalPrice.toFixed(2)}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Totals */}
                <div className="space-y-2 border-t border-neutral-200 pt-3">
                  <div className="flex justify-between text-sm text-neutral-700">
                    <span>Subtotal</span>
                    <span>£{orderData.subtotal.toFixed(2)}</span>
                  </div>

                  {orderData.discount > 0 && (
                    <div className="flex justify-between text-sm text-neutral-700">
                      <div>
                        <div>Promo discount</div>
                        <button className="text-xs text-neutral-500 hover:text-neutral-700 underline">Remove</button>
                      </div>
                      <div className="text-right">
                        <div>-£{orderData.discount.toFixed(2)}</div>
                        <div className="text-xs text-neutral-500">{orderData.discountLabel}</div>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between text-sm text-neutral-700">
                    <span>Delivery</span>
                    <span className="text-green-600 font-semibold">{orderData.deliveryLabel}</span>
                  </div>

                  <div className="flex justify-between text-lg font-bold text-neutral-800 pt-2 border-t border-neutral-200">
                    <span>Total</span>
                    <span>£{orderData.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
