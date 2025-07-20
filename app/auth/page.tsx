import Link from "next/link"
import { AuthForm } from "@/components/auth/auth-form"

export default function AuthPage() {
  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center p-4 overflow-hidden">
      <div className="auth-background">
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />
      </div>

      <header className="absolute top-0 left-0 w-full p-4 md:p-6 z-20">
        <Link href="/" className="text-2xl font-extrabold font-logo tracking-tighter uppercase">
          ADAM
        </Link>
      </header>

      <main className="relative z-10 w-full">
        <AuthForm />
      </main>
    </div>
  )
}
