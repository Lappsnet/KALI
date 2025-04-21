import { useState, useEffect } from "react"
import { useRealEstateContract } from "./hooks/useRealEstateContract"
import { PropertyCard } from "./PropertyCard"
import { Button } from "./common/Button"
import { LoadingSpinner } from "./common/LoadingSpinner"
import { ErrorMessage } from "./common/ErrorMessage"
import { CreatePropertyForm } from "./CreatePropertyForm"

export const PropertyList = () => {
  const { getAllProperties, getMyProperties, isLoading, error } = useRealEstateContract()
  const [properties, setProperties] = useState<any[]>([])
  const [viewMode, setViewMode] = useState<"all" | "my">("all")
  const [showCreateForm, setShowCreateForm] = useState(false)

  useEffect(() => {
    const fetchProperties = async () => {
      const data = viewMode === "all" ? await getAllProperties() : await getMyProperties()
      setProperties(data)
    }
    fetchProperties()
  }, [viewMode])

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (error) {
    return <ErrorMessage message={error} />
  }

  return (
    <div className="property-list">
      <div className="property-list-header">
        <h2>{viewMode === "all" ? "All Properties" : "My Properties"}</h2>
        <div className="property-list-actions">
          <Button
            onClick={() => setViewMode(viewMode === "all" ? "my" : "all")}
            variant="secondary"
          >
            {viewMode === "all" ? "View My Properties" : "View All Properties"}
          </Button>
          <Button onClick={() => setShowCreateForm(true)}>Create Property</Button>
        </div>
      </div>

      {showCreateForm && (
        <CreatePropertyForm
          onClose={() => setShowCreateForm(false)}
          onSuccess={() => {
            setShowCreateForm(false)
            // Refresh properties list
            const fetchProperties = async () => {
              const data = viewMode === "all" ? await getAllProperties() : await getMyProperties()
              setProperties(data)
            }
            fetchProperties()
          }}
        />
      )}

      <div className="property-grid">
        {properties.map((property) => (
          <PropertyCard address={property.address} title={property.title} price={property.price} image={property.image} status={property.status} key={property.tokenId.toString()} property={property} />
        ))}
      </div>

      {properties.length === 0 && (
        <div className="empty-state">
          <p>No properties found</p>
        </div>
      )}
    </div>
  )
} 