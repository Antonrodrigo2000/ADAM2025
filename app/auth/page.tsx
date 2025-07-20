import Link from "next/link"
import { AuthForm } from "@/components/auth/auth-form"

export default function AuthPage() {
  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center p-4 overflow-hidden bg-neutral-100">
      {/* Subtle texture overlay */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50/50 via-transparent to-orange-100/30" />
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, rgba(251, 146, 60, 0.1) 0%, transparent 50%),
                             radial-gradient(circle at 75% 75%, rgba(234, 88, 12, 0.08) 0%, transparent 50%)`,
          }}
        />
      </div>

      <header className="absolute top-0 left-0 w-full p-4 md:p-6 z-20">
        <Link href="/" className="text-2xl font-extrabold font-logo tracking-tighter uppercase text-black">
          ADAM
        </Link>
      </header>

      <main className="relative z-10 w-full">
        <AuthForm />
      </main>
    </div>
  )
}
