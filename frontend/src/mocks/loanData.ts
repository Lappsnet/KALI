import type { LoanOption, LoanApplication, ActiveLoan } from '../types/loan'
import type { LoanWithDetails } from "/home/jhonny/kali/frontend/src/components/hooks/useLendingProtocolContract"
import { LoanStatus } from "/home/jhonny/kali/frontend/src/components/hooks/useLendingProtocolContract"
import { parseEther } from 'viem';

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
    propertyId: 1n,
    principal: 100n,
    term: BigInt(30),
    interestRate: BigInt(55),
    startTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    maturityTime: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000),
    status: LoanStatus.Active,
    statusText: "Active",
    formattedPrincipal: "100",
    formattedRemainingPrincipal: "95.5",
    formattedInterestRate: "5.5%",
    formattedOriginationFee: "1%",
    formattedTotalRepaid: "4.5",
    formattedLoanToValueRatio: "75%",
    formattedTotalInterest: "5.5",
    formattedTotalFees: "1",
    formattedTotalRepayment: "106.5",
    formattedRemainingTerm: "23 days",
    formattedRemainingInterest: "5.0",
    formattedRemainingFees: "0.5",
    formattedRemainingRepayment: "101.0",
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
    propertyId: 2n,
    principal: 150n,
    term: BigInt(60),
    interestRate: BigInt(60),
    startTime: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    maturityTime: new Date(Date.now() + 150 * 24 * 60 * 60 * 1000),
    status: LoanStatus.Active,
    statusText: "Active",
    formattedPrincipal: "150",
    formattedRemainingPrincipal: "142.5",
    formattedInterestRate: "6.0%",
    formattedOriginationFee: "1%",
    formattedTotalRepaid: "7.5",
    formattedLoanToValueRatio: "80%",
    formattedTotalInterest: "9.0",
    formattedTotalFees: "1.5",
    formattedTotalRepayment: "160.5",
    formattedRemainingTerm: "15 days",
    formattedRemainingInterest: "7.5",
    formattedRemainingFees: "1.0",
    formattedRemainingRepayment: "151.0",
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

export interface MockProperty {
  tokenId: string;
  metadata: {
    name: string;
    image: string;
  };
  cadastralNumber: string;
  location: string;
  valuation: string;
}

export const mockProperties: MockProperty[] = [
  {
    tokenId: "1",
    metadata: {
      name: "Luxury Apartment in Downtown",
      image: "https://example.com/property1.jpg"
    },
    cadastralNumber: "123456789",
    location: "123 Main St, New York, NY",
    valuation: parseEther("100").toString() // 100 ETH
  },
  {
    tokenId: "2",
    metadata: {
      name: "Beachfront Villa",
      image: "https://example.com/property2.jpg"
    },
    cadastralNumber: "987654321",
    location: "456 Ocean Dr, Miami, FL",
    valuation: parseEther("200").toString() // 200 ETH
  }
];

export interface MockLoan {
  loanId: string;
  propertyId: string;
  borrower: string;
  lender: string;
  amount: string;
  interestRate: number;
  durationMonths: number;
  status: 'PENDING' | 'ACTIVE' | 'REPAID' | 'DEFAULTED';
  startDate: number;
  endDate: number;
  documentUri: string;
}

export const mockLoans: MockLoan[] = [
  {
    loanId: "1",
    propertyId: "1",
    borrower: "0x1234...5678",
    lender: "0x8765...4321",
    amount: parseEther("50").toString(),
    interestRate: 500, // 5%
    durationMonths: 12,
    status: 'ACTIVE',
    startDate: Date.now(),
    endDate: Date.now() + 31536000000, // 1 year from now
    documentUri: "ipfs://QmExample1"
  }
];

export const getMockPropertyDetails = (propertyId: string): MockProperty | undefined => {
  return mockProperties.find(p => p.tokenId === propertyId);
};

export const getMockLoansByBorrower = (address: string): MockLoan[] => {
  return mockLoans.filter(loan => loan.borrower === address);
};

export const getMockLoansByLender = (address: string): MockLoan[] => {
  return mockLoans.filter(loan => loan.lender === address);
};

export const getMockLoanDetails = (loanId: string): MockLoan | undefined => {
  return mockLoans.find(loan => loan.loanId === loanId);
}; 