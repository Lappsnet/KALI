"use client"

import { createAppKit } from "@reown/appkit/react"
import { WagmiProvider } from "wagmi"
import { useState } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"

import { Layout } from "./components/Layout"
import { Dashboard } from "./pages/Dashboard"
import { Marketplace } from "../src/components/pages/Marketplace"
import { Launch } from "../src/components/pages/Launch"
import { MintProperties } from "../src/components/pages/MintProperties"
import { SaleProperties } from "../src/components/pages/SaleProperties"
import { Settings } from "../src/components/pages/Settings"
import { PropertyDetails } from "../src/components/pages/PropertyDetails"
import { LoanRequest } from "../src/components/pages/LoanRequest"
import { MyLoans } from "../src/components/pages/MyLoans"
import { LoanDetails } from "../src/components/pages/LoanDetails"
import { projectId, metadata, networks, wagmiAdapter } from "./config"

import "./styles/App.css"

const queryClient = new QueryClient()

const generalConfig = {
  projectId,
  networks,
  metadata,
  themeMode: "dark" as const,
  themeVariables: {
    "--w3m-accent": "#0ea5e9",
    "--w3m-background-color": "#000000",
    "--w3m-text-color": "#ffffff",
  },
}

// Create modal
createAppKit({
  adapters: [wagmiAdapter],
  ...generalConfig,
  features: {
    analytics: true,
  },
})

export function App() {
  const [transactionHash, setTransactionHash] = useState<`0x${string}` | undefined>(undefined)
  const [signedMsg, setSignedMsg] = useState("")
  const [balance, setBalance] = useState("")

  const receiveHash = (hash: `0x${string}`) => {
    setTransactionHash(hash)
  }

  const receiveSignedMsg = (signedMsg: string) => {
    setSignedMsg(signedMsg)
  }

  const receiveBalance = (balance: string) => {
    setBalance(balance)
  }

  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/marketplace" element={<Marketplace />} />
              <Route path="/launch" element={<Launch />} />
              <Route path="/dashboard/mint-properties" element={<MintProperties sendHash={receiveHash} />} />
              <Route path="/dashboard/sale-properties" element={<SaleProperties />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/property/:id" element={<PropertyDetails />} />
              <Route path="/property/:id/loan" element={<LoanRequest />} />
              <Route path="/loans" element={<MyLoans />} />
              <Route path="/loan/:id" element={<LoanDetails />} />
            </Routes>
          </Layout>
        </Router>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

export default App
