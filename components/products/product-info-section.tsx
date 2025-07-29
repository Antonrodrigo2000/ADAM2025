import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"

interface ProductInfoSectionProps {
  title: string
  image: string
  formatsTitle: string
  formatsDescription: string
  benefitsTitle: string
  benefitsDescription: string
}

export default function ProductInfoSection({
  title,
  image,
  formatsTitle,
  formatsDescription,
  benefitsTitle,
  benefitsDescription,
}: ProductInfoSectionProps) {
  return (
    <section className="py-12 md:py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-center mb-8 md:mb-12 text-gray-900">
            {title}
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center mb-12 md:mb-16">
            <div className="order-2 lg:order-1">
              <h3 className="text-xl md:text-2xl font-bold mb-4 text-gray-900">{formatsTitle}</h3>
              <p className="text-gray-600 leading-relaxed mb-6">{formatsDescription}</p>

              <h3 className="text-xl md:text-2xl font-bold mb-4 text-gray-900">{benefitsTitle}</h3>
              <p className="text-gray-600 leading-relaxed">{benefitsDescription}</p>
            </div>

            <div className="order-1 lg:order-2">
              <div className="aspect-square relative overflow-hidden rounded-lg bg-white shadow-lg">
                <Image src={image || "/placeholder.svg"} alt="Product information" fill className="object-cover" />
              </div>
            </div>
          </div>

          {/* Additional Information Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardContent className="p-6">
                <h4 className="font-semibold mb-3 text-gray-900">Clinically Proven</h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Backed by extensive clinical research and FDA approval, our treatments are proven to be safe and
                  effective for men's hair loss.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h4 className="font-semibold mb-3 text-gray-900">Expert Guidance</h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Our licensed healthcare providers review your case and provide personalized treatment recommendations
                  based on your specific needs.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}
