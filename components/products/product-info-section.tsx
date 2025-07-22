import Image from "next/image"
import { Button } from "@/components/ui/button"

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
    <section className="w-full py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16">
          <div className="w-full md:w-1/2 space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">{title}</h2>
            <div className="relative w-full aspect-square md:aspect-auto md:h-[400px]">
              <Image
                src={image || "/placeholder.svg"}
                alt="Minoxidil dropper application"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>

          <div className="w-full md:w-1/2 space-y-8">
            <div className="space-y-3">
              <h3 className="text-2xl font-semibold text-gray-900">{formatsTitle}</h3>
              <p className="text-gray-700 leading-relaxed">{formatsDescription}</p>
            </div>

            <div className="space-y-3">
              <h3 className="text-2xl font-semibold text-gray-900">{benefitsTitle}</h3>
              <p className="text-gray-700 leading-relaxed">{benefitsDescription}</p>
            </div>

            <div className="flex flex-wrap gap-4 pt-4">
              <Button className="bg-black hover:bg-gray-800 text-white rounded-full px-8 py-6 h-auto">
                Add to cart
              </Button>
              <Button variant="link" className="text-gray-900 hover:text-gray-700 h-auto py-6">
                Explore Rx options
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
