import { getServerAuth } from '@/contexts/auth-server'
import DashboardClient from './DashboardClient'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const { user, isAuthenticated } = await getServerAuth()

  if (!isAuthenticated || !user) {
    redirect('/auth')
  }

  return <DashboardClient user={user} />
}