"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Home, DollarSign, Calendar, Search, Filter, User } from "lucide-react"
import "../../styles/TokenMarket.css"

interface Token {
  id: string
  propertyId: string
  propertyTitle: string
  price: number
  rentPrice: number
  duration: number
  owner: string
  status: "available" | "rented" | "expired"
  image: string
  location: string
}

export const TokenMarket = () => {
  const [tokens, setTokens] = useState<Token[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState({
    minPrice: 0,
    maxPrice: 10000,
    duration: "all",
  })

  useEffect(() => {
    const fetchTokens = async () => {
      try {
        // Mock data for tokens
        const mockTokens: Token[] = [
          {
            id: "1",
            propertyId: "1",
            propertyTitle: "Modern Downtown Apartment",
            price: 1000,
            rentPrice: 100,
            duration: 30,
            owner: "0x123...abc",
            status: "available",
            image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267",
            location: "New York, NY",
          },
          {
            id: "2",
            propertyId: "2",
            propertyTitle: "Luxury Villa",
            price: 2000,
            rentPrice: 200,
            duration: 60,
            owner: "0x456...def",
            status: "available",
            image: "https://images.unsplash.com/photo-1613977257365-aaae5a9817ff",
            location: "Miami, FL",
          },
          {
            id: "3",
            propertyId: "3",
            propertyTitle: "Beachfront Condo",
            price: 1500,
            rentPrice: 150,
            duration: 45,
            owner: "0x789...ghi",
            status: "rented",
            image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750",
            location: "Los Angeles, CA",
          },
          {
            id: "4",
            propertyId: "4",
            propertyTitle: "Mountain View Cabin",
            price: 800,
            rentPrice: 80,
            duration: 30,
            owner: "0x012...jkl",
            status: "available",
            image: "https://images.unsplash.com/photo-1518780664697-55e3ad937233",
            location: "Denver, CO",
          },
          {
            id: "5",
            propertyId: "5",
            propertyTitle: "Urban Loft",
            price: 1200,
            rentPrice: 120,
            duration: 30,
            owner: "0x345...mno",
            status: "available",
            image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688",
            location: "Chicago, IL",
          },
          {
            id: "6",
            propertyId: "6",
            propertyTitle: "Historic Townhouse",
            price: 1800,
            rentPrice: 180,
            duration: 60,
            owner: "0x678...pqr",
            status: "available",
            image: "https://images.unsplash.com/photo-1568605114967-8130f3a36994",
            location: "Boston, MA",
          },
        ]

        setTokens(mockTokens)
        setLoading(false)
      } catch (err) {
        setError("Failed to fetch tokens")
        setLoading(false)
      }
    }

    fetchTokens()
  }, [])

  const filteredTokens = tokens.filter((token) => {
    const matchesSearch =
      token.propertyTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      token.location.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesPrice = token.price >= filters.minPrice && token.price <= filters.maxPrice
    const matchesDuration = filters.duration === "all" || token.duration === Number(filters.duration)
    return matchesSearch && matchesPrice && matchesDuration
  })

  if (loading) return <div className="loading">Loading market tokens...</div>
  if (error) return <div className="error">{error}</div>

  return (
    <div className="token-market-container">
      <div className="market-header">
        <h1>DEFI Market</h1>
        <div className="search-filter">
          <div className="search-box">
            <Search size={20} />
            <input
              type="text"
              placeholder="Search tokens..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="filter-box">
            <Filter size={20} />
            <select value={filters.duration} onChange={(e) => setFilters({ ...filters, duration: e.target.value })}>
              <option value="all">All Durations</option>
              <option value="30">30 days</option>
              <option value="45">45 days</option>
              <option value="60">60 days</option>
            </select>
          </div>
        </div>
      </div>

      <div className="tokens-grid">
        {filteredTokens.map((token) => (
          <div key={token.id} className="token-card">
            <div className="token-image">
              <img src={token.image} alt={token.propertyTitle} />
            </div>
            <div className="token-header">
              <h2>{token.propertyTitle}</h2>
              <span className={`status-badge ${token.status}`}>{token.status}</span>
            </div>

            <div className="token-details">
              <div className="detail-item">
                <Home size={20} />
                <span>{token.location}</span>
              </div>
              <div className="detail-item">
                <DollarSign size={20} />
                <span>Price: ${token.price}</span>
              </div>
              <div className="detail-item">
                <DollarSign size={20} />
                <span>Rent: ${token.rentPrice}/day</span>
              </div>
              <div className="detail-item">
                <Calendar size={20} />
                <span>Duration: {token.duration} days</span>
              </div>
              <div className="detail-item">
                <User size={20} />
                <span>Owner: {token.owner}</span>
              </div>
            </div>

            <div className="token-actions">
              <Link to={`/tokens/${token.id}`} className="view-button">
                View Details
              </Link>
              {token.status === "available" && <button className="rent-button">Rent Now</button>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 