import { Shield, Truck, Clock, Award } from "lucide-react"

export function TrustBadges() {
  const badges = [
    {
      icon: Shield,
      title: "Licensed Physicians",
      description: "Prescribed by qualified doctors",
    },
    {
      icon: Truck,
      title: "Discreet Packaging",
      description: "Private and confidential delivery",
    },
    {
      icon: Clock,
      title: "2-Day Consultation",
      description: "Quick response guarantee",
    },
    {
      icon: Award,
      title: "Quality Assured",
      description: "Pharmacy-grade medications",
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {badges.map((badge, index) => (
        <div
          key={index}
          className="flex flex-col items-center text-center p-4 bg-blue-50 rounded-lg border border-blue-100"
        >
          <badge.icon className="w-8 h-8 text-blue-600 mb-2" />
          <h4 className="font-semibold text-gray-900 text-sm mb-1">{badge.title}</h4>
          <p className="text-xs text-gray-600 leading-tight">{badge.description}</p>
        </div>
      ))}
    </div>
  )
}
