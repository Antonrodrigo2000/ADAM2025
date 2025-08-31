'use client'

import { useState } from 'react'

interface AdhocPricingTableProps {
  hasAdhocProducts: boolean
}

export function AdhocPricingTable({ hasAdhocProducts }: AdhocPricingTableProps) {
  const [selectedMedication, setSelectedMedication] = useState<string | null>(null)

  if (!hasAdhocProducts) {
    return null
  }

  const pricingData = [
    {
      sku: 'Silagra 50mg',
      category: 'ED Medication',
      basePrice: 62.00,
      commissionPrice: 63.86,
      dosing: '50mg orally as needed, ~1 hour before sexual activity, max 1 dose/day. Typically 4-12 tablets (1-3 times/week).',
      color: 'bg-blue-50 border-blue-200'
    },
    {
      sku: 'Silagra 100mg', 
      category: 'ED Medication',
      basePrice: 103.00,
      commissionPrice: 106.09,
      dosing: '100mg orally as needed, ~1 hour before sexual activity, max 1 dose/day. Typically 4-12 tablets (1-3 times/week).',
      color: 'bg-blue-50 border-blue-200'
    },
    {
      sku: 'Megafil 10mg',
      category: 'ED Medication',
      basePrice: 234.00,
      commissionPrice: 241.02,
      dosing: '10mg orally as needed, ~30 minutes before sexual activity, max 1 dose/day. Typically 4-12 tablets (1-3 times/week).',
      color: 'bg-purple-50 border-purple-200'
    },
    {
      sku: 'Megafil 20mg',
      category: 'ED Medication',
      basePrice: 243.00,
      commissionPrice: 250.29,
      dosing: '20mg orally as needed, ~30 minutes before sexual activity, max 1 dose/day. Typically 4-12 tablets (1-3 times/week).',
      color: 'bg-purple-50 border-purple-200'
    },
    {
      sku: 'Ketomide Shampoo',
      category: 'Dermatology',
      basePrice: 1595.00,
      commissionPrice: 1642.85,
      dosing: 'Apply 5-10ml to wet scalp, lather, leave for 3-5 min, rinse; use 2x/week for 2-4 weeks, then 1-2x/week maintenance. ~8-10 uses (0.5-1 bottle, 90-100ml).',
      color: 'bg-green-50 border-green-200'
    }
  ]

  return (
    <div className="bg-gradient-to-br from-white to-neutral-50 rounded-2xl border border-neutral-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-neutral-900 to-neutral-800 px-6 py-5">
        <div>
          <h3 className="text-lg font-bold text-white">
            Medication Pricing & Dosing
          </h3>
          <p className="text-sm text-neutral-300 mt-1">
            Physician-determined quantities and pricing
          </p>
        </div>
      </div>

      {/* Desktop View */}
      <div className="hidden md:block p-6">
        <div className="grid gap-4">
          {pricingData.map((item) => (
            <div 
              key={item.sku}
              className={`${item.color} border rounded-xl p-5 transition-all duration-200`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-bold text-neutral-900 text-lg">{item.sku}</h4>
                    <span className="px-2 py-1 bg-white/80 rounded-full text-xs font-medium text-neutral-700">
                      {item.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-6">
                    <div>
                      <p className="text-xs text-neutral-600 mb-1">Base Price</p>
                      <p className="font-semibold text-neutral-800">LKR {item.basePrice.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-neutral-600 mb-1">Final Price</p>
                      <p className="font-bold text-lg text-neutral-900">LKR {item.commissionPrice.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-white/60 rounded-lg p-4">
                <p className="text-sm text-neutral-700 font-medium mb-2">Typical Dosing Regimen:</p>
                <p className="text-sm text-neutral-600 leading-relaxed">{item.dosing}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile View */}
      <div className="md:hidden">
        <div className="p-4">
          <div className="grid grid-cols-1 gap-3">
            {pricingData.map((item) => (
              <div 
                key={item.sku}
                className="bg-white border border-neutral-200 rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setSelectedMedication(selectedMedication === item.sku ? null : item.sku)}
                  className="w-full p-4 text-left focus:outline-none focus:ring-2 focus:ring-neutral-500"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-bold text-neutral-900 text-base">{item.sku}</h4>
                        <span className="px-2 py-0.5 bg-neutral-100 rounded-full text-xs font-medium text-neutral-600">
                          {item.category}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-neutral-500">Final Price</p>
                          <p className="font-bold text-neutral-900">LKR {item.commissionPrice.toFixed(2)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-neutral-500">Base Price</p>
                          <p className="font-medium text-neutral-700">LKR {item.basePrice.toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                    <div className="ml-3">
                      <svg 
                        className={`w-5 h-5 text-neutral-400 transition-transform duration-200 ${
                          selectedMedication === item.sku ? 'rotate-180' : ''
                        }`} 
                        fill="currentColor" 
                        viewBox="0 0 20 20"
                      >
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </button>
                
                {selectedMedication === item.sku && (
                  <div className="px-4 pb-4 border-t border-neutral-100 bg-neutral-50">
                    <div className="pt-3">
                      <p className="text-sm font-medium text-neutral-800 mb-2">Dosing Information:</p>
                      <p className="text-sm text-neutral-600 leading-relaxed">{item.dosing}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Notes */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-t border-amber-200 p-5">
        <div className="flex items-start">
          <div className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-bold text-amber-800 mb-2">Important Disclaimer</h4>
            <div className="space-y-1 text-xs text-amber-700">
              <p>• Final quantities and pricing will be determined by your physician during consultation</p>
              <p>• Dosing recommendations are general guidelines - your doctor will provide personalized instructions</p>
              <p>• All medications require valid prescription and medical supervision</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}