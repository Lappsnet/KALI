"use client"

import { useState, useEffect } from "react"
import { useAppKitAccount } from "@reown/appkit/react"
import { Building, DollarSign, Calendar, User, Receipt, Loader } from "lucide-react"
import { useRealEstateSaleContract } from "../hooks/useRealEstateSaleContract"
import { formatEther } from "viem"
import { Sale, mockSales } from "../../types/sale"
import "../../styles/SaleHistory.css"

export const SaleHistory = () => {
  const { isConnected, address } = useAppKitAccount()
  const contract = useRealEstateSaleContract()
  const [sales, setSales] = useState<Sale[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<"all" | "bought" | "sold">("all")

  useEffect(() => {
    const fetchSales = async () => {
      try {
        setLoading(true)
        // TODO: Replace with actual contract call when ready
        // const realSales = await contract.getSaleHistory()
        // const formattedSales = realSales.map(formatSaleData)
        // setSales(formattedSales)
        
        // Using mock data for now
        setSales(mockSales)
      } catch (err) {
        console.error("Error fetching sales:", err)
        setError("Failed to fetch sale history")
      } finally {
        setLoading(false)
      }
    }

    if (isConnected) {
      fetchSales()
    }
  }, [isConnected, contract])

  // Helper function to format sale data from contract
  const formatSaleData = (contractSale: any): Sale => {
    return {
      id: contractSale.id.toString(),
      propertyId: contractSale.propertyId.toString(),
      title: contractSale.title,
      price: contractSale.price,
      buyer: contractSale.buyer,
      seller: contractSale.seller,
      saleDate: new Date(Number(contractSale.timestamp) * 1000).toISOString(),
      transactionHash: contractSale.transactionHash,
      status: contractSale.status || "completed",
      propertyImage: contractSale.propertyImage,
      propertyLocation: contractSale.propertyLocation
    }
  }

  const filteredSales = sales.filter((sale) => {
    if (filter === "all") return true
    if (filter === "bought" && address) return sale.buyer.toLowerCase() === address.toLowerCase()
    if (filter === "sold" && address) return sale.seller.toLowerCase() === address.toLowerCase()
    return true
  })

  if (!isConnected) {
    return (
      <div className="page-container">
        <div className="connect-prompt">
          <h2>Connect Your Wallet</h2>
          <p>Please connect your wallet to view sale history</p>
          <appkit-button />
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading">
          <Loader className="animate-spin mr-2" size={24} />
          <span>Loading sale history...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="error">{error}</div>
      </div>
    )
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Sale History</h1>
        <p>Track your property sales and purchases</p>
      </div>

      <div className="sales-filters">
        <div className="filter-buttons">
          <button
            className={`filter-button ${filter === "all" ? "active" : ""}`}
            onClick={() => setFilter("all")}
          >
            All Transactions
          </button>
          <button
            className={`filter-button ${filter === "bought" ? "active" : ""}`}
            onClick={() => setFilter("bought")}
          >
            Properties Bought
          </button>
          <button
            className={`filter-button ${filter === "sold" ? "active" : ""}`}
            onClick={() => setFilter("sold")}
          >
            Properties Sold
          </button>
        </div>
      </div>

      <div className="sales-table">
        <table>
          <thead>
            <tr>
              <th>Property</th>
              <th>Price</th>
              <th>Buyer</th>
              <th>Seller</th>
              <th>Date</th>
              <th>Transaction</th>
            </tr>
          </thead>
          <tbody>
            {filteredSales.map((sale) => (
              <tr key={sale.id}>
                <td>
                  <div className="property-info">
                    <Building size={16} />
                    <span>{sale.title}</span>
                    <span className="property-id">ID: {sale.propertyId}</span>
                    {sale.propertyLocation && (
                      <span className="property-location">{sale.propertyLocation}</span>
                    )}
                  </div>
                </td>
                <td>
                  <div className="price-info">
                    <DollarSign size={16} />
                    <span>{formatEther(sale.price)} ETH</span>
                  </div>
                </td>
                <td>
                  <div className="user-info">
                    <User size={16} />
                    <span>{sale.buyer.slice(0, 6)}...{sale.buyer.slice(-4)}</span>
                  </div>
                </td>
                <td>
                  <div className="user-info">
                    <User size={16} />
                    <span>{sale.seller.slice(0, 6)}...{sale.seller.slice(-4)}</span>
                  </div>
                </td>
                <td>
                  <div className="date-info">
                    <Calendar size={16} />
                    <span>{new Date(sale.saleDate).toLocaleDateString()}</span>
                  </div>
                </td>
                <td>
                  <div className="transaction-info">
                    <Receipt size={16} />
                    <a
                      href={`https://etherscan.io/tx/${sale.transactionHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View
                    </a>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
} 