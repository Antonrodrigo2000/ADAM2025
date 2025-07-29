import { Shield, Truck, Clock, Award } from "lucide-react"

export function TrustBadges() {
  const badges = [
    {
      icon: Shield,
      title: "Licensed Physicians",
      description: "Qualified medical professionals",
    },
    {
      icon: Truck,
      title: "Discreet Packaging",
      description: "Private & secure delivery",
    },
    {
      icon: Clock,
      title: "2-Day Consultation",
      description: "Quick response guarantee",
    },
    {
      icon: Award,
      title: "Quality Assured",
      description: "Authentic medications only",
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-4">
      {badges.map((badge, index) => (
        <div key={index} className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-lg">
          <div className="flex-shrink-0 w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
            <badge.icon className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h4 className="font-medium text-gray-900 text-sm">{badge.title}</h4>
            <p className="text-xs text-gray-600">{badge.description}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
