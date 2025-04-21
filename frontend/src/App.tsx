"use client"

import { createAppKit } from "@reown/appkit"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { Suspense, useEffect } from "react"
import { Layout } from "./components/Layout"
import { Dashboard } from "./components/pages/Dashboard"
import { Marketplace } from "./components/pages/Marketplace"
import { Launch } from "./components/pages/Launch"
import { MintProperties } from "./components/pages/MintProperties"
import { SaleProperties } from "./components/pages/SaleProperties"
import { Settings } from "./components/pages/Settings"
import { PropertyDetails } from "./components/pages/PropertyDetails"
import { LoanRequest } from "./components/pages/LoanRequest"
import { MyLoans } from "./components/pages/MyLoans"
import { LoanDetails } from "./components/pages/LoanDetails"
import RentableToken from "./components/pages/RentableToken"
import MyTokens from "./components/pages/MyTokens"
import { TokenMarket } from "./components/pages/TokenMarket"
import { Yield } from "./components/pages/Yield"
import { MyProperties } from "./components/pages/MyProperties"
import { PropertyDocuments } from "./components/pages/PropertyDocuments"
import { ActiveListings } from "./components/pages/ActiveListings"
import { SaleHistory } from "./components/pages/SaleHistory"
import { NotaryPanel } from "./components/pages/NotaryPanel"
import { AccessControl } from "./components/pages/AccessControl"
import { UserRegistry } from "./components/pages/UserRegistry"
import { Security } from "./components/pages/Security"
import { Profile } from "./components/pages/Profile"
import { projectId, metadata, networks, wagmiAdapter } from "./config"

import "./styles/App.css"

const queryClient = new QueryClient()

// Initialize AppKit
createAppKit({
  projectId,
  metadata,
  networks,
  adapters: [wagmiAdapter]
})

function AppContent() {
  useEffect(() => {
    console.log('App mounted')
  }, [])

  return (
    <Layout>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/launch" element={<Launch />} />
          <Route path="/dashboard/mint-properties" element={<MintProperties />} />
          <Route path="/dashboard/sale-properties" element={<SaleProperties />} />
          <Route path="/dashboard/properties" element={<MyProperties />} />
          <Route path="/dashboard/documents" element={<PropertyDocuments />} />
          <Route path="/dashboard/listings" element={<ActiveListings />} />
          <Route path="/dashboard/sales-history" element={<SaleHistory />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/property/:id" element={<PropertyDetails />} />
          <Route path="/property/:id/loan" element={<LoanRequest />} />
          <Route path="/dashboard/request-loan" element={<LoanRequest />} />
          <Route path="/loans" element={<MyLoans />} />
          <Route path="/loan/:id" element={<LoanDetails />} />
          <Route path="/tokens/:id" element={<RentableToken />} />
          <Route path="/my-tokens" element={<MyTokens />} />
          <Route path="/token-market" element={<TokenMarket />} />
          <Route path="/yield" element={<Yield />} />
          <Route path="/dashboard/notary" element={<NotaryPanel />} />
          <Route path="/dashboard/access" element={<AccessControl />} />
          <Route path="/dashboard/users" element={<UserRegistry />} />
          <Route path="/dashboard/security" element={<Security />} />
          <Route path="/dashboard/profile" element={<Profile />} />
        </Routes>
      </Suspense>
    </Layout>
  )
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Suspense fallback={<div>Loading app...</div>}>
          <AppContent />
        </Suspense>
      </Router>
    </QueryClientProvider>
  )
}

export default App
