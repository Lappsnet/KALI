"use client"

import type { ReactNode } from "react"

interface ActionButtonProps {
  children: ReactNode
  onClick?: () => void
  variant?: "primary" | "secondary" | "outline"
  size?: "small" | "medium" | "large"
  disabled?: boolean
  fullWidth?: boolean
  className?: string
}

export const ActionButton = ({
  children,
  onClick,
  variant = "primary",
  size = "medium",
  disabled = false,
  fullWidth = false,
  className = "",
}: ActionButtonProps) => {
  return (
    <button
      className={`action-button ${variant} ${size} ${fullWidth ? "full-width" : ""} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  )
}
