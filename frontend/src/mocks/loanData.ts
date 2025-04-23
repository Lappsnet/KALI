import type { LoanOption, LoanApplication, ActiveLoan } from '../types/loan'
import type { LoanWithDetails } from "../hooks/useLendingProtocolContract"
import { LoanStatus } from "../hooks/useLendingProtocolContract"

// Helper function to convert days to timestamp
const daysToTimestamp = (days: number) => {
  return BigInt(Math.floor(Date.now() / 1000) + (days * 24 * 60 * 60))
}

export const mockLoanOptions: LoanOption[] = [
  {
    id: 1,
    name: "Real Estate Development Loan",
    maxAmount: 500000,
    interestRate: 8.5,
    term: 12,
    collateralRequired: true,
    minCollateralRatio: 150,
    description: "Ideal for property development and renovation projects",
    requirements: ["Property deed", "Business plan", "Financial statements"]
  },
  {
    id: 2,
    name: "Property Purchase Loan",
    maxAmount: 1000000,
    interestRate: 6.75,
    term: 24,
    collateralRequired: true,
    minCollateralRatio: 125,
    description: "For purchasing new real estate properties",
    requirements: ["Proof of income", "Credit score", "Property valuation"]
  },
  {
    id: 3,
    name: "Bridge Loan",
    maxAmount: 250000,
    interestRate: 12,
    term: 6,
    collateralRequired: true,
    minCollateralRatio: 175,
    description: "Short-term financing while awaiting long-term funding",
    requirements: ["Existing property details", "Exit strategy", "Current mortgage status"]
  }
];

export const mockLoanApplications: LoanApplication[] = [
  {
    id: "LA001",
    userId: "user123",
    propertyId: "prop456",
    loanOptionId: 1,
    requestedAmount: 400000,
    status: "approved",
    createdAt: "2024-03-01T10:00:00Z",
    updatedAt: "2024-03-02T15:30:00Z",
    collateral: {
      type: "Property",
      value: 600000,
      description: "Commercial Building at 123 Business Ave"
    }
  },
  {
    id: "LA002",
    userId: "user123",
    propertyId: "prop789",
    loanOptionId: 2,
    requestedAmount: 750000,
    status: "pending",
    createdAt: "2024-03-10T09:15:00Z",
    updatedAt: "2024-03-10T09:15:00Z",
    collateral: {
      type: "Property",
      value: 1000000,
      description: "Residential Complex at 456 Housing St"
    }
  }
];

export const mockActiveLoans: ActiveLoan[] = [
  {
    id: "L001",
    applicationId: "LA001",
    userId: "user123",
    propertyId: "prop456",
    amount: 400000,
    interestRate: 8.5,
    term: 12,
    startDate: "2024-03-03T00:00:00Z",
    endDate: "2025-03-03T00:00:00Z",
    remainingBalance: 380000,
    nextPaymentDue: "2024-04-03T00:00:00Z",
    nextPaymentAmount: 35833.33,
    status: "active",
    paymentHistory: [
      {
        date: "2024-03-03T00:00:00Z",
        amount: 20000,
        type: "principal"
      },
      {
        date: "2024-03-03T00:00:00Z",
        amount: 2833.33,
        type: "interest"
      }
    ]
  }
];

export const mockLoans: LoanWithDetails[] = [
  {
    loanId: 1n,
    borrower: "0x1234567890123456789012345678901234567890",
    propertyId: 1n,
    amount: "100",
    term: "365",
    interestRate: "5.5",
    startTime: daysToTimestamp(-7), // 7 days ago
    endTime: daysToTimestamp(358), // 358 days from now
    status: LoanStatus.Active,
    statusText: "Active",
    nextPaymentDue: daysToTimestamp(23), // 23 days from now
    nextPaymentAmount: "0.5",
    remainingBalance: "95.5",
    payoffAmount: "97",
    formattedPrincipal: "100",
    formattedRemainingPrincipal: "95.5",
    paymentHistory: [
      {
        date: daysToTimestamp(-7),
        amount: "4.5",
        type: "Principal + Interest"
      }
    ]
  },
  {
    loanId: 2n,
    borrower: "0x2345678901234567890123456789012345678901",
    propertyId: 2n,
    amount: "150",
    term: "180",
    interestRate: "6.0",
    startTime: daysToTimestamp(-30), // 30 days ago
    endTime: daysToTimestamp(150), // 150 days from now
    status: LoanStatus.Active,
    statusText: "Active",
    nextPaymentDue: daysToTimestamp(15), // 15 days from now
    nextPaymentAmount: "0.75",
    remainingBalance: "142.5",
    payoffAmount: "145",
    formattedPrincipal: "150",
    formattedRemainingPrincipal: "142.5",
    paymentHistory: [
      {
        date: daysToTimestamp(-30),
        amount: "7.5",
        type: "Principal + Interest"
      }
    ]
  }
] 