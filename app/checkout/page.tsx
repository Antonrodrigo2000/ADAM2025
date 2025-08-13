import { getServerAuth } from '@/contexts/auth-server'
import { EnhancedCheckout } from "@/components/checkout/enhanced-checkout"

export default async function CheckoutPage() {
  const { user, isAuthenticated } = await getServerAuth()

  return <EnhancedCheckout user={user} isAuthenticated={isAuthenticated} />
}
