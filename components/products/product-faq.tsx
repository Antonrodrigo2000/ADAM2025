"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import type { ProductFAQ as FAQ } from "@/types/product"

interface ProductFAQProps {
  faqs: FAQ[]
}

export default function ProductFAQ({ faqs }: ProductFAQProps) {
  const [openItems, setOpenItems] = useState<string[]>([])

  const toggleItem = (id: string) => {
    setOpenItems((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]))
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg mb-16">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900">Frequently Asked Questions</h2>
      </div>
      <div className="divide-y divide-gray-200">
        {faqs.map((faq) => (
          <div key={faq.id} className="p-6">
            <button onClick={() => toggleItem(faq.id)} className="flex items-center justify-between w-full text-left">
              <h3 className="text-lg font-medium text-gray-900 pr-4">{faq.question}</h3>
              {openItems.includes(faq.id) ? (
                <ChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
              )}
            </button>
            {openItems.includes(faq.id) && (
              <div className="mt-4">
                <p className="text-gray-700">{faq.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
