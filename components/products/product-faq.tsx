"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import type { ProductFAQ as FAQ } from "@/types/product"

interface ProductFAQProps {
  faqs: FAQ[]
}

export default function ProductFAQ({ faqs }: ProductFAQProps) {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set())

  const toggleItem = (id: string) => {
    const newOpenItems = new Set(openItems)
    if (newOpenItems.has(id)) {
      newOpenItems.delete(id)
    } else {
      newOpenItems.add(id)
    }
    setOpenItems(newOpenItems)
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg mb-16">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">Frequently Asked Questions</h2>
      </div>

      <div className="divide-y divide-gray-200">
        {faqs.map((faq) => (
          <div key={faq.id} className="p-6">
            <button onClick={() => toggleItem(faq.id)} className="flex items-center justify-between w-full text-left">
              <h3 className="text-lg font-medium text-gray-900 pr-4">{faq.question}</h3>
              {openItems.has(faq.id) ? (
                <ChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
              )}
            </button>

            {openItems.has(faq.id) && (
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
