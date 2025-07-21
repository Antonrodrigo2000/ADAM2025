import { Separator } from "@/components/ui/separator"
import { Mail, Phone, MapPin, Shield, Truck, CreditCard, Clock } from "lucide-react"
import Link from "next/link"

export default function ProductFooter() {
  return (
    <footer className="bg-gray-900 text-white py-8 lg:py-12">
      <div className="container mx-auto px-3">
        {/* Trust Badges */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 lg:mb-12">
          <div className="flex items-center gap-2 text-center lg:text-left">
            <Shield className="w-5 h-5 text-blue-400 flex-shrink-0" />
            <div>
              <p className="text-xs lg:text-sm font-semibold">Secure Checkout</p>
              <p className="text-xs text-gray-400">256-bit SSL encryption</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-center lg:text-left">
            <Truck className="w-5 h-5 text-green-400 flex-shrink-0" />
            <div>
              <p className="text-xs lg:text-sm font-semibold">Free Shipping</p>
              <p className="text-xs text-gray-400">On all orders over £25</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-center lg:text-left">
            <CreditCard className="w-5 h-5 text-purple-400 flex-shrink-0" />
            <div>
              <p className="text-xs lg:text-sm font-semibold">Easy Returns</p>
              <p className="text-xs text-gray-400">180-day guarantee</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-center lg:text-left">
            <Clock className="w-5 h-5 text-orange-400 flex-shrink-0" />
            <div>
              <p className="text-xs lg:text-sm font-semibold">24/7 Support</p>
              <p className="text-xs text-gray-400">Expert help available</p>
            </div>
          </div>
        </div>

        <Separator className="bg-gray-700 mb-8" />

        {/* Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-base lg:text-lg font-bold mb-3">Adam Health</h3>
            <p className="text-xs lg:text-sm text-gray-400 mb-4">
              Leading provider of clinically proven hair loss treatments. Trusted by thousands worldwide.
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Mail className="w-3 h-3 text-gray-400" />
                <span className="text-xs text-gray-400">support@adamhealth.com</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3 h-3 text-gray-400" />
                <span className="text-xs text-gray-400">+44 20 7946 0958</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3 h-3 text-gray-400" />
                <span className="text-xs text-gray-400">London, UK</span>
              </div>
            </div>
          </div>

          {/* Products */}
          <div>
            <h4 className="text-sm lg:text-base font-semibold mb-3">Products</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/products/minoxidil"
                  className="text-xs lg:text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Adam Minoxidil 5%
                </Link>
              </li>
              <li>
                <Link
                  href="/products/combination-spray"
                  className="text-xs lg:text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Combination Spray
                </Link>
              </li>
              <li>
                <Link
                  href="/products/supplements"
                  className="text-xs lg:text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Hair Supplements
                </Link>
              </li>
              <li>
                <Link
                  href="/products/shampoo"
                  className="text-xs lg:text-sm text-gray-400 hover:text-white transition-colors"
                >
                  DHT Blocking Shampoo
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-sm lg:text-base font-semibold mb-3">Support</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/help" className="text-xs lg:text-sm text-gray-400 hover:text-white transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link
                  href="/consultation"
                  className="text-xs lg:text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Book Consultation
                </Link>
              </li>
              <li>
                <Link
                  href="/track-order"
                  className="text-xs lg:text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Track Your Order
                </Link>
              </li>
              <li>
                <Link href="/returns" className="text-xs lg:text-sm text-gray-400 hover:text-white transition-colors">
                  Returns & Refunds
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-sm lg:text-base font-semibold mb-3">Legal</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/privacy" className="text-xs lg:text-sm text-gray-400 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-xs lg:text-sm text-gray-400 hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="/medical-disclaimer"
                  className="text-xs lg:text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Medical Disclaimer
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="text-xs lg:text-sm text-gray-400 hover:text-white transition-colors">
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="bg-gray-700 my-6 lg:my-8" />

        {/* Bottom Bar */}
        <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-400 text-center lg:text-left">
            © 2024 Adam Health. All rights reserved. | Regulated by MHRA
          </p>
          <div className="flex items-center gap-4">
            <span className="text-xs text-gray-400">We accept:</span>
            <div className="flex items-center gap-2">
              <div className="w-6 h-4 bg-blue-600 rounded text-xs flex items-center justify-center text-white font-bold">
                V
              </div>
              <div className="w-6 h-4 bg-red-600 rounded text-xs flex items-center justify-center text-white font-bold">
                M
              </div>
              <div className="w-6 h-4 bg-blue-800 rounded text-xs flex items-center justify-center text-white font-bold">
                A
              </div>
            </div>
          </div>
        </div>

        {/* Medical Disclaimer */}
        <div className="mt-6 lg:mt-8 p-3 lg:p-4 bg-gray-800 rounded-lg">
          <p className="text-xs text-gray-400 leading-relaxed">
            <strong className="text-gray-300">Medical Disclaimer:</strong> This product is not intended to diagnose,
            treat, cure, or prevent any disease. Individual results may vary. Consult with a healthcare professional
            before starting any treatment. Side effects may occur. Not suitable for women or individuals under 18 years
            of age.
          </p>
        </div>
      </div>
    </footer>
  )
}
