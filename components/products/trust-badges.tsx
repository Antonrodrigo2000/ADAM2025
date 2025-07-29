import { Shield, Package, Clock, Star } from "lucide-react"

export function TrustBadges() {
  const badges = [
    {
      icon: Shield,
      title: "Licensed Physicians",
      description: "Prescribed by qualified doctors",
    },
    {
      icon: Package,
      title: "Discreet Packaging",
      description: "Private & confidential delivery",
    },
    {
      icon: Clock,
      title: "2-Day Consultation SLA",
      description: "Quick medical review process",
    },
    {
      icon: Star,
      title: "4.8/5 Rating",
      description: "From 2,847 verified customers",
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-4">
      {badges.map((badge, index) => {
        const IconComponent = badge.icon
        return (
          <div
            key={index}
            className="bg-gray-100 rounded-2xl p-4 shadow-[6px_6px_12px_rgba(0,0,0,0.1),-6px_-6px_12px_rgba(255,255,255,0.8)] hover:shadow-[4px_4px_8px_rgba(0,0,0,0.15),-4px_-4px_8px_rgba(255,255,255,0.9)] transition-all duration-300"
          >
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center shadow-[4px_4px_8px_rgba(0,0,0,0.1),-4px_-4px_8px_rgba(255,255,255,0.8)] flex-shrink-0">
                <IconComponent className="w-5 h-5 text-blue-600" />
              </div>
              <div className="min-w-0">
                <div className="font-medium text-gray-900 text-sm mb-1">{badge.title}</div>
                <div className="text-xs text-gray-600 leading-tight">{badge.description}</div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
