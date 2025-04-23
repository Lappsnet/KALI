declare module "../mocks/propertyData" {
  import type { PropertyWithMetadata } from "../hooks/useRealEstateContract"
  export const mockProperties: PropertyWithMetadata[]
}

declare module "../mocks/loanData" {
  import type { LoanOption, LoanApplication, ActiveLoan } from '../types/loan'
  import type { LoanWithDetails } from "../hooks/useLendingProtocolContract"
  export const mockLoanOptions: LoanOption[]
  export const mockLoanApplications: LoanApplication[]
  export const mockActiveLoans: ActiveLoan[]
  export const mockLoans: LoanWithDetails[]
} 