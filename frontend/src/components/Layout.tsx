"use client"

import type { ReactNode } from "react"
import { Navbar } from "./Navbar"
import { Sidebar } from "./Sidebar"
import { useAppKitAccount } from "@reown/appkit/react"

interface LayoutProps {
  children: ReactNode
}

export const Layout = ({ children }: LayoutProps) => {
  const { isConnected } = useAppKitAccount()

  return (
    <div className="app-container">
      <div className="stars-container">
        <div className="stars"></div>
        <div className="stars2"></div>
        <div className="stars3"></div>
      </div>

      <Navbar />

      <div className="content-wrapper">
        {isConnected && <Sidebar />}
        <main className={`main-content ${isConnected ? "with-sidebar" : ""}`}>{children}</main>
      </div>
    </div>
  )
}
