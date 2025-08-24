"use client"

import { useState } from "react"
import { Check, AlertTriangle, Info, ChevronDown } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Separator } from "@/components/ui/separator"
import type { Product } from "@/data/types/product"

interface ProductTabsProps {
  product: Product
}

export function ProductTabs({ product }: ProductTabsProps) {
  return (
    <div className="max-w-4xl mx-auto">
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-8 bg-white border border-gray-200 p-1">
          <TabsTrigger value="overview" className="data-[state=active]:bg-black data-[state=active]:text-white text-gray-600 hover:text-gray-900">Overview</TabsTrigger>
          <TabsTrigger value="ingredients" className="data-[state=active]:bg-black data-[state=active]:text-white text-gray-600 hover:text-gray-900">Ingredients</TabsTrigger>
          <TabsTrigger value="safety" className="data-[state=active]:bg-black data-[state=active]:text-white text-gray-600 hover:text-gray-900">Safety</TabsTrigger>
          <TabsTrigger value="faqs" className="data-[state=active]:bg-black data-[state=active]:text-white text-gray-600 hover:text-gray-900">FAQs</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Benefits */}
          <Card className="bg-white border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-gray-900">
                <Check className="w-5 h-5 text-green-600" />
                <span>Key Benefits</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {product.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* How it Works */}
          <Card className="bg-white border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-gray-900">
                <Info className="w-5 h-5 text-blue-600" />
                <span>How it Works</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">{product.how_it_works}</p>
            </CardContent>
          </Card>

          {/* Expected Timeline */}
          <Card className="bg-white border-gray-200">
            <CardHeader>
              <CardTitle className="text-gray-900">Expected Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">{product.expected_timeline}</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ingredients" className="space-y-6">
          {/* Active Ingredients */}
          <Card className="bg-white border-gray-200">
            <CardHeader>
              <CardTitle className="text-gray-900">Active Ingredients</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {product.ingredients.map((ingredient, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 bg-white">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3 space-y-2 sm:space-y-0">
                    <h4 className="font-semibold text-gray-900">{ingredient.name}</h4>
                    <Badge variant="secondary" className="w-fit">
                      {ingredient.dosage}
                    </Badge>
                  </div>
                  <p className="text-gray-600 text-sm">{ingredient.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Clinical Studies */}
          <Card className="bg-white border-gray-200">
            <CardHeader>
              <CardTitle className="text-gray-900">Clinical Studies</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {product.clinical_studies.map((study, index) => (
                <Card key={index} className="bg-blue-50/50 border-blue-200">
                  <CardContent className="p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">{study.title}</h4>
                    <p className="text-gray-700 text-sm mb-4">{study.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Efficacy Rate:</span>
                      <Badge variant="secondary" className="bg-green-100 text-green-700">
                        {study.efficacy_rate}%
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="safety" className="space-y-6">
          {/* Side Effects */}
          <Card className="border-yellow-200 bg-yellow-50/50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-yellow-800">
                <AlertTriangle className="w-5 h-5" />
                <span>Possible Side Effects</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {product.side_effects.map((effect, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700">{effect}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Contraindications */}
          <Card className="border-red-200 bg-red-50/50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-red-800">
                <AlertTriangle className="w-5 h-5" />
                <span>Contraindications</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {product.contraindications.map((contraindication, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700">{contraindication}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Warnings */}
          <Card className="border-orange-200 bg-orange-50/50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-orange-800">
                <AlertTriangle className="w-5 h-5" />
                <span>Important Warnings</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {product.warnings.map((warning, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700">{warning}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="faqs" className="space-y-6">
          <Card className="bg-white border-gray-200">
            <CardHeader>
              <CardTitle className="text-gray-900">Frequently Asked Questions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {product.faqs.map((faq, index) => (
                <Collapsible key={index}>
                  <CollapsibleTrigger className="flex w-full items-center justify-between p-4 text-left hover:bg-gray-50 rounded-lg transition-colors [&[data-state=open]>svg]:rotate-180">
                    <span className="font-medium text-gray-900 pr-4">{faq.question}</span>
                    <ChevronDown className="h-4 w-4 shrink-0 text-gray-500 transition-transform duration-200" />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="px-4 pb-4 pt-0">
                    <div className="text-gray-700 leading-relaxed bg-gray-50/50 rounded-lg p-4">
                      {faq.answer}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
