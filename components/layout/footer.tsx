import Link from "next/link"

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-2xl font-bold mb-4">ADAM</h3>
            <p className="text-gray-400 mb-4 max-w-md">
              Modern telehealth platform for men in Sri Lanka. Get expert medical care from licensed physicians with
              discreet, convenient treatments.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <span className="sr-only">Facebook</span>
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <span className="sr-only">Instagram</span>
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987 6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297C3.85 14.81 3.85 12.939 4.126 11.987c.276-.952.952-1.628 1.904-1.904.952-.276 1.823-.276 2.775 0 .952.276 1.628.952 1.904 1.904.276.952.276 1.823 0 2.775-.276.952-.952 1.628-1.904 1.904-.476.138-.952.207-1.356.322zm7.518 0c-1.297 0-2.448-.49-3.323-1.297-.876-.807-.876-2.678-.6-3.63.276-.952.952-1.628 1.904-1.904.952-.276 1.823-.276 2.775 0 .952.276 1.628.952 1.904 1.904.276.952.276 1.823 0 2.775-.276.952-.952 1.628-1.904 1.904-.476.138-.952.207-1.756.248z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/products" className="text-gray-400 hover:text-white transition-colors">
                  All Treatments
                </Link>
              </li>
              <li>
                <Link href="/products/hair-loss" className="text-gray-400 hover:text-white transition-colors">
                  Hair Loss
                </Link>
              </li>
              <li>
                <Link href="/products/sexual-health" className="text-gray-400 hover:text-white transition-colors">
                  Sexual Health
                </Link>
              </li>
              <li>
                <Link href="/products/skincare" className="text-gray-400 hover:text-white transition-colors">
                  Skincare
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Support</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/help" className="text-gray-400 hover:text-white transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-400 hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-400 hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 ADAM. All rights reserved. Licensed telehealth platform in Sri Lanka.</p>
        </div>
      </div>
    </footer>
  )
}
