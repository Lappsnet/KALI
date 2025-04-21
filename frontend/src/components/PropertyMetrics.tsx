import { useEffect, useState } from "react"
import { useRealEstateContract } from "./hooks/useRealEstateContract"
import { CircularMetric } from "./common/CircularMetric"
import { Home, DollarSign, MapPin, Users } from "lucide-react"
import { LoadingSpinner } from "./common/LoadingSpinner"
import { ErrorMessage } from "./common/ErrorMessage"

export const PropertyMetrics = () => {
  const { getAllProperties, getMyProperties, isLoading, error } = useRealEstateContract()
  const [metrics, setMetrics] = useState({
    totalProperties: 0,
    myProperties: 0,
    totalValue: 0,
    averageValue: 0,
  })

  useEffect(() => {
    const fetchMetrics = async () => {
      const allProperties = await getAllProperties()
      const myProperties = await getMyProperties()

      const totalValue = allProperties.reduce((sum, prop) => sum + Number(prop.valuationRaw), 0)
      const averageValue = allProperties.length > 0 ? totalValue / allProperties.length : 0

      setMetrics({
        totalProperties: allProperties.length,
        myProperties: myProperties.length,
        totalValue: totalValue / 1e18, // Convert from wei to ETH
        averageValue: averageValue / 1e18, // Convert from wei to ETH
      })
    }

    fetchMetrics()
  }, [getAllProperties, getMyProperties])

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (error) {
    return <ErrorMessage message={error} />
  }

  return (
    <div className="property-metrics">
      <h3 className="text-xl font-bold mb-4">Property Metrics</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <CircularMetric
          value={metrics.totalProperties}
          max={Math.max(metrics.totalProperties, 10)}
          label="Total Properties"
          icon={<Home />}
          color="blue"
        />
        <CircularMetric
          value={metrics.myProperties}
          max={Math.max(metrics.myProperties, 10)}
          label="My Properties"
          icon={<Users />}
          color="green"
        />
        <CircularMetric
          value={metrics.totalValue}
          max={Math.max(metrics.totalValue, 100)}
          label="Total Value (ETH)"
          icon={<DollarSign />}
          color="purple"
        />
        <CircularMetric
          value={metrics.averageValue}
          max={Math.max(metrics.averageValue, 50)}
          label="Average Value (ETH)"
          icon={<MapPin />}
          color="yellow"
        />
      </div>
    </div>
  )
} 