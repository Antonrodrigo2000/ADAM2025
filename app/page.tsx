import { HeroSection } from "@/components/home/hero-section"
import { HealthVerticalsSection } from "@/components/home/health-verticals-section"
import { DoctorReviewSection } from "@/components/home/doctor-review-section"
import { Footer } from "@/components/layout/footer"

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <main className="flex-1">
        <HeroSection />
        <HealthVerticalsSection />
        <DoctorReviewSection />
      </main>
      <Footer />
    </div>
  )
}
