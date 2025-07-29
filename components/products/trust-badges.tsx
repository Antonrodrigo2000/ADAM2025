import { Shield, Truck, Clock, Award } from "lucide-react"

export default function TrustBadges() {
  const badges = [
    {
      icon: Shield,
      title: "Licensed Physicians",
      description: "Prescribed by qualified doctors",
    },
    {
      icon: Truck,
      title: "Discreet Packaging",
      description: "Private and secure delivery",
    },
    {
      icon: Clock,
      title: "2-Day Consultation",
      description: "Quick response guarantee",
    },
    {
      icon: Award,
      title: "90-Day Guarantee",
      description: "Money back if not satisfied",
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-4">
      {badges.map((badge, index) => (
        <div key={index} className="flex items-center space-x-3 p-3 bg-blue-50 border border-blue-100 rounded-lg">
          <badge.icon className="w-6 h-6 text-blue-600 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-medium text-gray-900">{badge.title}</h4>
            <p className="text-xs text-gray-600">{badge.description}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
