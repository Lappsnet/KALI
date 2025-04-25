import type { LoanOption, LoanApplication, ActiveLoan } from '../types/loan'
import type { LoanWithDetails } from "/home/jhonny/kali/frontend/src/components/hooks/useLendingProtocolContract"
import { parseEther, formatEther } from "viem"

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

export const mockLoanDetails: LoanWithDetails[] = [
  {
    loanId: 1n,
    borrower: "0x1234567890123456789012345678901234567890",
    loanOfficer: "0x9876543210987654321098765432109876543210",
    propertyId: 1n,
    principal: 100n,
    term: BigInt(30),
    interestRate: BigInt(55),
    originationFee: BigInt(10),
    totalRepaid: BigInt(45),
    remainingPrincipal: BigInt(955),
    loanToValueRatio: BigInt(750),
    liquidationThreshold: BigInt(800),
    startTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    maturityTime: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000),
    lastInterestCalcTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    status: 1,
    statusText: "Active",
    formattedPrincipal: "100",
    formattedRemainingPrincipal: "95.5",
    formattedInterestRate: "5.5%",
    formattedOriginationFee: "1%",
    formattedTotalRepaid: "4.5",
    formattedLoanToValueRatio: "75%",
    formattedLiquidationThreshold: "80%",
    payoffAmount: "106.5",
    payoffAmountRaw: BigInt(1065),
    isOverdue: false,
    daysRemaining: 23,
    progressPercentage: 20,
    payments: [
      {
        loanId: 1n,
        timestamp: new Date(Number(daysToTimestamp(-7)) * 1000),
        amount: BigInt(45),
        formattedAmount: "0.45",
        formattedPrincipalPortion: "0.40",
        formattedInterestPortion: "0.05",
        formattedFeePortion: "0",
        principalPortion: BigInt(40),
        interestPortion: BigInt(5),
        feePortion: BigInt(0)
      }
    ]
  },
  {
    loanId: 2n,
    borrower: "0x2345678901234567890123456789012345678901",
    loanOfficer: "0x9876543210987654321098765432109876543210",
    propertyId: 2n,
    principal: 150n,
    term: BigInt(60),
    interestRate: BigInt(60),
    originationFee: BigInt(15),
    totalRepaid: BigInt(75),
    remainingPrincipal: BigInt(1425),
    loanToValueRatio: BigInt(800),
    liquidationThreshold: BigInt(850),
    startTime: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    maturityTime: new Date(Date.now() + 150 * 24 * 60 * 60 * 1000),
    lastInterestCalcTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    status: 1,
    statusText: "Active",
    formattedPrincipal: "150",
    formattedRemainingPrincipal: "142.5",
    formattedInterestRate: "6.0%",
    formattedOriginationFee: "1%",
    formattedTotalRepaid: "7.5",
    formattedLoanToValueRatio: "80%",
    formattedLiquidationThreshold: "85%",
    payoffAmount: "160.5",
    payoffAmountRaw: BigInt(1605),
    isOverdue: false,
    daysRemaining: 15,
    progressPercentage: 25,
    payments: [
      {
        loanId: 2n,
        timestamp: new Date(Number(daysToTimestamp(-30)) * 1000),
        amount: BigInt(75),
        formattedAmount: "0.75",
        formattedPrincipalPortion: "0.65",
        formattedInterestPortion: "0.10",
        formattedFeePortion: "0",
        principalPortion: BigInt(65),
        interestPortion: BigInt(10),
        feePortion: BigInt(0)
      }
    ]
  }
]

interface MockProperty {
  tokenId: bigint
  metadata: {
    name: string
    description: string
    image: string
  }
  cadastralNumber: string
  location: string
  valuation: bigint
  investmentDetails?: {
    annualYield: string
    minInvestment: bigint
    totalShares: number
    availableShares: number
    monthlyRent: bigint
    usdtValue: string
    roi: string
    lockupPeriod: string
    propertyType: string
    amenities: string[]
    projectedIncome?: {
      monthly: string
      annual: string
      fiveYear: string
    }
    investmentOptions?: {
      purchase?: {
        price: string
        downPayment: string
        mortgageRate: string
        monthlyPayment: string
      }
      rent?: {
        monthly: string
        securityDeposit: string
        leaseTerm: string
        maintenanceFee: string
      }
      fractional?: {
        sharePrice: string
        minShares: number
        projectedAnnualReturn: string
        managementFee: string
      }
    }
  }
}

interface MockLoan extends LoanWithDetails {
  loanId: bigint
  propertyId: bigint
  borrower: `0x${string}`
  lender: `0x${string}` | null
  principal: bigint
  interestRate: bigint
  originationFee: bigint
  term: bigint
  totalRepaid: bigint
  remainingPrincipal: bigint
  loanOfficer: `0x${string}`
  loanToValueRatio: bigint
  liquidationThreshold: bigint
  documentUri: string
  statusText: string
}

export const mockProperties: MockProperty[] = [
  {
    tokenId: BigInt(1),
    metadata: {
      name: "Luxury Apartment in El Salvador",
      description: "A stunning 5-bedroom Apartment with private pool and beach access",
      image: "/properties/modern-villa.jpg"
    },
    cadastralNumber: "DXB-12345",
    location: "El Salvador, El Salvador",
    valuation: parseEther("18"),
    investmentDetails: {
      annualYield: "8.5%",
      minInvestment: parseEther("0.01"),
      totalShares: 1000,
      availableShares: 400,
      monthlyRent: parseEther("0.01"),
      usdtValue: "200,000",
      roi: "9.5%",
      lockupPeriod: "12 months",
      propertyType: "Luxury Residential",
      amenities: ["Private Pool", "Beach Access", "Smart Home", "Gym", "Security"],
      projectedIncome: {
        monthly: "100 USDT",
        annual: "1,200 USDT",
        fiveYear: "6,000 USDT"
      },
      investmentOptions: {
        purchase: {
          price: "200,000 USDT",
          downPayment: "40,000 USDT",
          mortgageRate: "4.5%",
          monthlyPayment: "11,250 USDT"
        },
        rent: {
          monthly: "100 USDT",
          securityDeposit: "20 USDT",
          leaseTerm: "12 months",
          maintenanceFee: "1 USDT/month"
        },
        fractional: {
          sharePrice: "200 USDT",
          minShares: 5,
          projectedAnnualReturn: "8.5%",
          managementFee: "1%"
        }
      }
    }
  },
  {
    tokenId: BigInt(2),
    metadata: {
      name: "Modern Apartment in Guatemala",
      description: "2-bedroom apartment in Guatemala City with city views",
      image: "/properties/deluxe-Apartment.jpg"
    },
    cadastralNumber: "GUA-67890",
    location: "Guatemala, Guatemala",
    valuation: parseEther("15"),
    investmentDetails: {
      annualYield: "6.2%",
      minInvestment: parseEther("0.05"),
      totalShares: 1500,
      availableShares: 750,
      monthlyRent: parseEther("0.02"),
      usdtValue: "250,000",
      roi: "9.8%",
      lockupPeriod: "6 months",
      propertyType: "Urban Residential",
      amenities: ["Doorman", "Gym", "Rooftop", "Concierge", "Parking"],
      projectedIncome: {
        monthly: "200 USDT",
        annual: "2,400 USDT",
        fiveYear: "12,000 USDT"
      },
      investmentOptions: {
        purchase: {
          price: "250,000 USDT",
          downPayment: "50,000 USDT",
          mortgageRate: "4.8%",
          monthlyPayment: "11,250 USDT"
        },
        rent: {
          monthly: "200 USDT",
          securityDeposit: "40 USDT",
          leaseTerm: "12 months",
          maintenanceFee: "1 USDT/month"
        },
        fractional: {
          sharePrice: "250 USDT",
          minShares: 5,
          projectedAnnualReturn: "6.2%",
          managementFee: "1%"
        }
      }
    }
  },
  {
    tokenId: BigInt(3),
    metadata: {
      name: "Commercial Complex in Mexico",
      description: "Mixed-use development with retail and office spaces",
      image: "/properties/apartment-complex.jpg"
    },
    cadastralNumber: "MEX-54321",
    location: "Mexico, Mexico",
    valuation: parseEther("500"),
    investmentDetails: {
      annualYield: "10.2%",
      minInvestment: parseEther("10"),
      totalShares: 200000,
      availableShares: 30000,
      monthlyRent: parseEther("2"),
      usdtValue: "5,000,000",
      roi: "15.3%",
      lockupPeriod: "24 months",
      propertyType: "Investment",
      amenities: ["Retail Spaces", "Office Suites", "Conference Rooms", "Parking", "Security"],
      projectedIncome: {
        monthly: "5000 USDT",
        annual: "60,000 USDT",
        fiveYear: "300,000 USDT"
      },
      investmentOptions: {
        purchase: {
          price: "5,000,000 USDT",
          downPayment: "1,000,000 USDT",
          mortgageRate: "4.2%",
          monthlyPayment: "18,333 USDT"
        },
        rent: {
          monthly: "5000 USDT",
          securityDeposit: "20 USDT",
          leaseTerm: "24 months",
          maintenanceFee: "1000 USDT/month"
        },
        fractional: {
          sharePrice: "500 USDT",
          minShares: 10,
          projectedAnnualReturn: "10.2%",
          managementFee: "3%"
        }
      }
    }
  },
  {
    tokenId: BigInt(4),
    metadata: {
      name: "Luxury Resort in Panama",
      description: "5-star resort with private villas and beachfront access",
      image: "/properties/houses-complex.jpg"
    },
    cadastralNumber: "PAN-98765",
    location: "Panama, Panama",
    valuation: parseEther("8"),
    investmentDetails: {
      annualYield: "12.5%",
      minInvestment: parseEther("0.04"),
      totalShares: 1600,
      availableShares: 800,
      monthlyRent: parseEther("0.03"),
      usdtValue: "8,000,000",
      roi: "7.2%",
      lockupPeriod: "12 months",
      propertyType: "Village",
      amenities: ["Private Beach", "Spa", "Restaurants", "Pools", "Golf Course"],
      projectedIncome: {
        monthly: "3000 USDT",
        annual: "36,000 USDT",
        fiveYear: "180,000 USDT"
      },
      investmentOptions: {
        purchase: {
          price: "450,000 USDT",
          downPayment: "90,000 USDT",
          mortgageRate: "4.0%",
          monthlyPayment: "29,333 USDT"
        },
        rent: {
          monthly: "3000 USDT",
          securityDeposit: "20 USDT",
          leaseTerm: "12 months",
          maintenanceFee: "500 USDT/month"
        },
        fractional: {
          sharePrice: "500 USDT",
          minShares: 10,
          projectedAnnualReturn: "12.5%",
          managementFee: "5%"
        }
      }
    }
  },
  {
    tokenId: BigInt(5),
    metadata: {
      name: "Tech Hub in El Salvador",
      description: "Modern office building in El Salvador's tech district",
      image: "/properties/urban-apartments.jpg"
    },
    cadastralNumber: "SAL-24680",
    location: "El Salvador, El Salvador",
    valuation: parseEther("10"),
    investmentDetails: {
      annualYield: "7.8%",
      minInvestment: parseEther("1"),
      totalShares: 2000,
      availableShares: 1000,
      monthlyRent: parseEther("1"),
      usdtValue: "300,000",
      roi: "11.2%",
      lockupPeriod: "18 months",
      propertyType: "Tech Office",
      amenities: ["High-Speed Internet", "Meeting Rooms", "Cafeteria", "Bike Storage", "EV Charging"],
      projectedIncome: {
        monthly: "1000 USDT",
        annual: "12,000 USDT",
        fiveYear: "60,000 USDT"
      },
      investmentOptions: {
        purchase: {
          price: "300,000 USDT",
          downPayment: "60,000 USDT",
          mortgageRate: "4.6%",
          monthlyPayment: "11,000 USDT"
        },
        rent: {
          monthly: "1000 USDT",
          securityDeposit: "20 USDT",
          leaseTerm: "18 months",
          maintenanceFee: "100 USDT/month"
        },
        fractional: {
          sharePrice: "150 USDT",
          minShares: 10,
          projectedAnnualReturn: "7.8%",
          managementFee: "2.5%"
        }
      }
    }
  }
]

const mockLoans: MockLoan[] = [
  {
    loanId: BigInt(1),
    propertyId: BigInt(1),
    borrower: "0x1234567890123456789012345678901234567890" as `0x${string}`,
    lender: "0x0987654321098765432109876543210987654321" as `0x${string}`,
    principal: parseEther("1000000"),
    interestRate: BigInt(500), // 5% in basis points
    originationFee: parseEther("10000"),
    term: BigInt(360), // 30 years in days
    totalRepaid: parseEther("50000"),
    remainingPrincipal: parseEther("950000"),
    loanOfficer: "0x1111111111111111111111111111111111111111" as `0x${string}`,
    loanToValueRatio: BigInt(4000), // 40% in basis points
    liquidationThreshold: BigInt(8000), // 80% in basis points
    documentUri: "https://example.com/loan1.pdf",
    formattedPrincipal: formatEther(parseEther("1000000")),
    formattedInterestRate: "5.00%",
    formattedOriginationFee: formatEther(parseEther("10000")),
    formattedTotalRepaid: formatEther(parseEther("50000")),
    formattedRemainingPrincipal: formatEther(parseEther("950000")),
    formattedLoanToValueRatio: "40.00%",
    formattedLiquidationThreshold: "80.00%",
    startTime: new Date(),
    maturityTime: new Date(Date.now() + 360 * 24 * 60 * 60 * 1000),
    lastInterestCalcTime: new Date(),
    status: 1, // Active
    statusText: "Active",
    payments: [],
    payoffAmount: formatEther(parseEther("950000")),
    payoffAmountRaw: parseEther("950000"),
    isOverdue: false,
    daysRemaining: 360,
    progressPercentage: 0
  }
]

export function getMockPropertyDetails(tokenId: bigint): MockProperty | null {
  return mockProperties.find(p => p.tokenId === tokenId) || null
}

export function getMockLoanDetails(loanId: bigint): MockLoan | null {
  return mockLoans.find(l => l.loanId === loanId) || null
}

export function getMockLoansByBorrower(borrower: `0x${string}`): MockLoan[] {
  return mockLoans.filter(l => l.borrower === borrower)
}

export function getMockLoansByLender(lender: `0x${string}`): MockLoan[] {
  return mockLoans.filter(l => l.lender === lender)
} 