export function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="container mx-auto py-16 px-4 md:px-6">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <h3 className="text-2xl font-extrabold font-logo tracking-tighter uppercase text-primary mb-4">ADAM</h3>
            <p className="text-gray-600 mb-6 max-w-md leading-relaxed">
              Transforming men's health through personalized, discreet, and effective treatments. 
              Your confidence, delivered.
            </p>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Licensed • Secure • Confidential</span>
            </div>
          </div>
          <div>
            <h4 className="font-bold text-gray-900 mb-4">Treatments</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <a href="/questionnaire/hair-loss" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Hair Loss Treatment
                </a>
              </li>
              <li>
                <a href="/products" className="text-gray-600 hover:text-blue-600 transition-colors">
                  All Products
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="text-gray-600 hover:text-blue-600 transition-colors">
                  How It Works
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-gray-900 mb-4">Support</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>
        <hr className="my-8 border-gray-200" />
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-500">
            © 2025 BASKR Health (Private) Limited. All rights reserved.
          </p>
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <span className="text-xs text-gray-400">Powered by licensed physicians</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
