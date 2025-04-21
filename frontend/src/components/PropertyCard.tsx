"use client"

interface PropertyCardProps {
  title: string
  address: string
  price: string
  image: string
  property: any
  status: "For Sale" | "Owned" | "Pending"
  onClick?: () => void
}

export const PropertyCard = ({ title, address, price, image, status, property,onClick }: PropertyCardProps) => {
  return (
    <div className="property-card" onClick={onClick}>
      <div className="property-image">
        <img src={image || "/placeholder.svg"} alt={title} />
        <div className={`property-status ${status.toLowerCase().replace(" ", "-")}`}>{status}</div>
      </div>
      <div className="property-details">
        <h3 className="property-title">{title}</h3>
        <p className="property-address">{address}</p>
        <div className="property-price">{price}</div>
      </div>
    </div>
  )
}
