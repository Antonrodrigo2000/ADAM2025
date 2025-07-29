import Link from "next/link"

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-16">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="text-3xl font-extrabold font-logo tracking-tighter uppercase mb-4 block">
              ADAM
            </Link>
            <p className="text-gray-400 mb-6 max-w-md">
              Modern healthcare solutions for men in Sri Lanka. Discreet, effective, and delivered to your door.
            </p>
            <div className="flex space-x-4">
              <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors cursor-pointer">
                <span className="text-sm">f</span>
              </div>
              <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors cursor-pointer">
                <span className="text-sm">t</span>
              </div>
              <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors cursor-pointer">
                <span className="text-sm">in</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Treatments</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link href="/products/hair-loss" className="hover:text-white transition-colors">
                  Hair Loss
                </Link>
              </li>
              <li>
                <Link href="/products/sexual-health" className="hover:text-white transition-colors">
                  Sexual Health
                </Link>
              </li>
              <li>
                <Link href="/products/skincare" className="hover:text-white transition-colors">
                  Skincare
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link href="/help" className="hover:text-white transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © 2024 ADAM. All rights reserved. Licensed healthcare provider in Sri Lanka.
          </p>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <span className="text-sm text-gray-400">🇱🇰 Sri Lanka</span>
            <span className="text-sm text-gray-400">•</span>
            <span className="text-sm text-gray-400">Licensed by NMRA</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
