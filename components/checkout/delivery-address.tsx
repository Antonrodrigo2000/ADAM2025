"use client"

import type React from "react"
import { useState } from "react"
import { Edit2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

interface Address {
    street: string
    city: string
    postcode: string
    country: string
}

interface DeliveryAddressProps {
    userAddress: Address | null
    onAddressUpdate: (address: Address) => void
}

export function DeliveryAddress({ userAddress, onAddressUpdate }: DeliveryAddressProps) {
    const [isEditingAddress, setIsEditingAddress] = useState(false)
    const [addressForm, setAddressForm] = useState<Address>({
        street: userAddress?.street || '',
        city: userAddress?.city || '',
        postcode: userAddress?.postcode || '',
        country: userAddress?.country || 'Sri Lanka'
    })

    const handleAddressUpdate = () => {
        onAddressUpdate(addressForm)
        setIsEditingAddress(false)
    }

    return (
        <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                    <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-semibold mr-3">
                        1
                    </div>
                    <h2 className="text-xl font-semibold text-neutral-800">Delivery address</h2>
                </div>
                <Dialog open={isEditingAddress} onOpenChange={setIsEditingAddress}>
                    <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="text-sm border-gray-300 bg-white text-gray-700 hover:bg-gray-50">
                            <Edit2 className="w-4 h-4 mr-2" />
                            Edit
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md bg-white text-neutral-900">
                        <DialogHeader>
                            <DialogTitle className="text-neutral-900">Edit Delivery Address</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            {/* Address - Text Area for full address */}
                            <div className="space-y-2">
                                <Label htmlFor="street" className="text-sm font-medium" theme="light">Address</Label>
                                <Textarea
                                    id="street"
                                    value={addressForm.street}
                                    onChange={(e) => setAddressForm(prev => ({ ...prev, street: e.target.value }))}
                                    rows={3}
                                    className="resize-none"
                                    placeholder="Enter your complete address"
                                    theme="light"
                                />
                            </div>
                            
                            {/* City - Individual Input Field */}
                            <div className="space-y-2">
                                <Label htmlFor="city" className="text-sm font-medium" theme="light">City</Label>
                                <Input
                                    id="city"
                                    value={addressForm.city}
                                    onChange={(e) => setAddressForm(prev => ({ ...prev, city: e.target.value }))}
                                    className="h-10"
                                    placeholder="Enter your city"
                                    theme="light"
                                />
                            </div>
                            
                            {/* Postcode - Individual Input Field */}
                            <div className="space-y-2">
                                <Label htmlFor="postcode" className="text-sm font-medium" theme="light">Postcode</Label>
                                <Input
                                    id="postcode"
                                    value={addressForm.postcode}
                                    onChange={(e) => setAddressForm(prev => ({ ...prev, postcode: e.target.value }))}
                                    className="h-10"
                                    placeholder="Enter your postcode"
                                    theme="light"
                                />
                            </div>
                            
                            <div className="flex gap-3 justify-end pt-4">
                                <Button variant="outline" size="sm" onClick={() => setIsEditingAddress(false)} className="border-gray-300 bg-white text-gray-700 hover:bg-gray-50">
                                    Cancel
                                </Button>
                                <Button size="sm" onClick={handleAddressUpdate} className="bg-orange-500 hover:bg-orange-600 text-white">
                                    Save Address
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-800">
                    Please make sure your address is accurate. This will help us confirm your identity and ensure successful delivery of any orders.
                </p>
            </div>

            {userAddress ? (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="space-y-2">
                        <p className="text-sm font-medium text-neutral-800">{userAddress.street}</p>
                        <p className="text-sm text-neutral-600">
                            {userAddress.city}, {userAddress.postcode}
                        </p>
                        <p className="text-sm text-neutral-600">{userAddress.country}</p>
                    </div>
                </div>
            ) : (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <p className="text-sm text-orange-800 mb-3">No delivery address found. Please add your address.</p>
                    <Button size="sm" onClick={() => setIsEditingAddress(true)} className="bg-orange-500 hover:bg-orange-600 text-white">
                        Add Address
                    </Button>
                </div>
            )}
        </div>
    )
}