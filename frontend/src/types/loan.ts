export type LoanOption = {
  id: number;
  name: string;
  maxAmount: number;
  interestRate: number;
  term: number; // months
  collateralRequired: boolean;
  minCollateralRatio: number;
  description: string;
  requirements: string[];
};

export type LoanCollateral = {
  type: string;
  value: number;
  description: string;
};

export type LoanApplication = {
  id: string;
  userId: string;
  propertyId: string;
  loanOptionId: number;
  requestedAmount: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  collateral?: LoanCollateral;
};

export type LoanPayment = {
  date: string;
  amount: number;
  type: string;
};

export type ActiveLoan = {
  id: string;
  applicationId: string;
  userId: string;
  propertyId: string;
  amount: number;
  interestRate: number;
  term: number;
  startDate: string;
  endDate: string;
  remainingBalance: number;
  nextPaymentDue: string;
  nextPaymentAmount: number;
  status: string;
  paymentHistory: LoanPayment[];
}; 