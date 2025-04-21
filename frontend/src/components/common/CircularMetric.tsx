import { ReactNode } from "react"

interface CircularMetricProps {
  value: number
  max: number
  label: string
  icon?: ReactNode
  color?: string
  size?: "sm" | "md" | "lg"
}

export const CircularMetric = ({
  value,
  max,
  label,
  icon,
  color = "blue",
  size = "md",
}: CircularMetricProps) => {
  const sizeClasses = {
    sm: "w-24 h-24",
    md: "w-32 h-32",
    lg: "w-40 h-40",
  }

  const colorClasses = {
    blue: "text-blue-600",
    green: "text-green-600",
    red: "text-red-600",
    yellow: "text-yellow-600",
    purple: "text-purple-600",
  }

  const percentage = (value / max) * 100
  const strokeDasharray = `${percentage} 100`

  return (
    <div className="flex flex-col items-center">
      <div className={`relative ${sizeClasses[size]}`}>
        <svg className="w-full h-full" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle
            className="text-gray-200"
            strokeWidth="8"
            stroke="currentColor"
            fill="transparent"
            r="40"
            cx="50"
            cy="50"
          />
          {/* Progress circle */}
          <circle
            className={`${colorClasses[color as keyof typeof colorClasses]} transform -rotate-90 origin-center`}
            strokeWidth="8"
            strokeDasharray={strokeDasharray}
            strokeLinecap="round"
            stroke="currentColor"
            fill="transparent"
            r="40"
            cx="50"
            cy="50"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          {icon && <div className="text-2xl">{icon}</div>}
          <div className="text-center">
            <div className="text-2xl font-bold">{value}</div>
            <div className="text-xs text-gray-500">of {max}</div>
          </div>
        </div>
      </div>
      <div className="mt-2 text-sm font-medium text-gray-700">{label}</div>
    </div>
  )
} 