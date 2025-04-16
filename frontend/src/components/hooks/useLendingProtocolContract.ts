"use client"

import { useCallback, useState } from "react"
import { useAppKitAccount, useAppKitNetwork } from "@reown/appkit/react"
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi"
import { formatEther, parseEther } from "viem"
import { LendingProtocolABI } from "../../contracts/abis"
import { CONTRACT_ADDRESSES, LENDING_PROTOCOL_PARAMS } from "/home/jhonny/kali/frontend/src/contracts/config.ts"
import { type UseReadContractReturnType } from 'wagmi'

// Loan type from the contract
interface Loan {
  propertyId: bigint
  borrower: `0x${string}`
  principal: bigint
  interestRate: bigint
  originationFee: bigint
  term: bigint
  startTime: bigint
  maturityTime: bigint
  lastInterestCalcTime: bigint
  totalRepaid: bigint
  remainingPrincipal: bigint
  status: number
  loanOfficer: `0x${string}`
  loanToValueRatio: bigint
  liquidationThreshold: bigint
}

// Payment type from the contract
export interface Payment {
  loanId: bigint
  amount: bigint
  timestamp: bigint
  principalPortion: bigint
  interestPortion: bigint
  feePortion: bigint
}

// Auction type from the contract
interface Auction {
  loanId: bigint
  propertyId: bigint
  startingPrice: bigint
  currentPrice: bigint
  startTime: bigint
  endTime: bigint
  highestBidder: `0x${string}`
  highestBid: bigint
  finalized: boolean
}

// Extended loan type with formatted values
export interface LoanWithDetails extends Omit<Loan, "startTime" | "maturityTime" | "lastInterestCalcTime"> {
  loanId: bigint
  formattedPrincipal: string
  formattedInterestRate: string
  formattedOriginationFee: string
  formattedTotalRepaid: string
  formattedRemainingPrincipal: string
  formattedLoanToValueRatio: string
  formattedLiquidationThreshold: string
  startTime: Date
  maturityTime: Date
  lastInterestCalcTime: Date
  statusText: string
  payments: PaymentWithDetails[]
  payoffAmount: string
  payoffAmountRaw: bigint
  isOverdue: boolean
  daysRemaining: number
  progressPercentage: number
}

// Extended payment type with formatted values
export interface PaymentWithDetails extends Omit<Payment, "timestamp"> {
  formattedAmount: string
  formattedPrincipalPortion: string
  formattedInterestPortion: string
  formattedFeePortion: string
  timestamp: Date
}

// Extended auction type with formatted values
export interface AuctionWithDetails extends Omit<Auction, "startTime" | "endTime"> {
  formattedStartingPrice: string
  formattedCurrentPrice: string
  formattedHighestBid: string
  startTime: Date
  endTime: Date
  isActive: boolean
  timeRemaining: string
  progressPercentage: number
}

export enum LoanStatus {
  Requested = 0,
  Approved = 1,
  Funded = 2,
  Active = 3,
  Repaid = 4,
  Defaulted = 5,
  Liquidated = 6
}

type ContractLoanData = {
  propertyId: bigint;
  borrower: `0x${string}`;
  principal: bigint;
  interestRate: bigint;
  originationFee: bigint;
  term: bigint;
  startTime: bigint;
  maturityTime: bigint;
  lastInterestCalcTime: bigint;
  totalRepaid: bigint;
  remainingPrincipal: bigint;
  status: number;
  loanToValueRatio: bigint;
  liquidationThreshold: bigint;
}

type ContractPaymentData = {
  loanId: bigint;
  amount: bigint;
  principalPortion: bigint;
  interestPortion: bigint;
  feePortion: bigint;
  timestamp: bigint;
}

export function useLendingProtocolContract() {
  const { address, isConnected } = useAppKitAccount()
  const { chainId } = useAppKitNetwork()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Get contract address based on current chain
  const contractAddress = chainId
    ? CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES]?.lendingProtocol
    : undefined

  // Write contract hook
  const { writeContract, isPending, isSuccess, data: txHash } = useWriteContract()

  // Wait for transaction receipt
  const { data: receipt, isLoading: isWaitingForReceipt } = useWaitForTransactionReceipt({
    hash: txHash,
  })

  // Helper function to get status text
  const getStatusText = (status: number): string => {
    switch (status) {
      case LoanStatus.Requested:
        return "Requested"
      case LoanStatus.Approved:
        return "Approved"
      case LoanStatus.Funded:
        return "Funded"
      case LoanStatus.Active:
        return "Active"
      case LoanStatus.Repaid:
        return "Repaid"
      case LoanStatus.Defaulted:
        return "Defaulted"
      case LoanStatus.Liquidated:
        return "Liquidated"
      default:
        return "Unknown"
    }
  }

  // Helper function to format interest rate (from basis points to percentage)
  const formatInterestRate = (rate: bigint): string => {
    return (Number(rate) / 100).toFixed(2) + "%"
  }

  // Helper function to format loan-to-value ratio (from basis points to percentage)
  const formatLoanToValueRatio = (ratio: bigint): string => {
    return (Number(ratio) / 100).toFixed(2) + "%"
  }

  // Get loan by ID
  const getLoan = useCallback(
    async (loanId: bigint): Promise<LoanWithDetails | null> => {
      if (!contractAddress || !isConnected) return null

      try {
        setIsLoading(true)
        setError(null)

        const loanResult = await useReadContract({
          address: contractAddress,
          abi: LendingProtocolABI,
          functionName: "getLoan",
          args: [loanId],
        }) as UseReadContractReturnType<typeof LendingProtocolABI, "getLoan">

        if (!loanResult || !loanResult.data) throw new Error("Failed to get loan data")
        const loanData = loanResult.data as ContractLoanData

        // Get loan payments
        const paymentsResult = await useReadContract({
          address: contractAddress,
          abi: LendingProtocolABI,
          functionName: "getLoanPayments",
          args: [loanId],
        }) as UseReadContractReturnType<typeof LendingProtocolABI, "getLoanPayments">

        if (!paymentsResult || !paymentsResult.data) throw new Error("Failed to get payments data")
        const paymentsData = paymentsResult.data as unknown as { amount: bigint; principalPortion: bigint; interestPortion: bigint; feePortion: bigint; timestamp: bigint; }[]

        // Get payoff amount
        const payoffResult = await useReadContract({
          address: contractAddress,
          abi: LendingProtocolABI,
          functionName: "calculatePayoffAmount",
          args: [loanId],
        }) as UseReadContractReturnType<typeof LendingProtocolABI, "calculatePayoffAmount">

        if (!payoffResult || !payoffResult.data) throw new Error("Failed to get payoff amount")
        const payoffAmountData = payoffResult.data as bigint

        // Format payments
        const formattedPayments = paymentsData.map((payment) => ({
          loanId,
          amount: payment.amount,
          principalPortion: payment.principalPortion,
          interestPortion: payment.interestPortion,
          feePortion: payment.feePortion,
          formattedAmount: formatEther(payment.amount),
          formattedPrincipalPortion: formatEther(payment.principalPortion),
          formattedInterestPortion: formatEther(payment.interestPortion),
          formattedFeePortion: formatEther(payment.feePortion),
          timestamp: new Date(Number(payment.timestamp) * 1000),
        })) as PaymentWithDetails[]

        // Calculate days remaining and progress
        const now = new Date()
        const maturityDate = new Date(Number(loanData.maturityTime) * 1000)
        const startDate = new Date(Number(loanData.startTime) * 1000)
        const totalDays = Math.floor((maturityDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
        const daysRemaining = Math.max(0, Math.floor((maturityDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
        const progressPercentage =
          totalDays > 0 ? Math.min(100, Math.max(0, ((totalDays - daysRemaining) / totalDays) * 100)) : 0
        const isOverdue = now > maturityDate && Number(loanData.status) === LoanStatus.Active

        return {
          loanId,
          borrower: loanData.borrower,
          term: loanData.term,
          loanOfficer: loanData.loanOfficer,
          propertyId: loanData.propertyId,
          principal: loanData.principal,
          interestRate: loanData.interestRate,
          originationFee: loanData.originationFee,
          loanToValueRatio: loanData.loanToValueRatio,
          liquidationThreshold: loanData.liquidationThreshold,
          startTime: new Date(Number(loanData.startTime) * 1000),
          maturityTime: new Date(Number(loanData.maturityTime) * 1000),
          lastInterestCalcTime: new Date(Number(loanData.lastInterestCalcTime) * 1000),
          totalRepaid: loanData.totalRepaid,
          remainingPrincipal: loanData.remainingPrincipal,
          status: loanData.status,
          formattedPrincipal: formatEther(loanData.principal),
          formattedInterestRate: formatInterestRate(loanData.interestRate),
          formattedOriginationFee: formatInterestRate(loanData.originationFee),
          formattedTotalRepaid: formatEther(loanData.totalRepaid),
          formattedRemainingPrincipal: formatEther(loanData.remainingPrincipal),
          formattedLoanToValueRatio: formatLoanToValueRatio(loanData.loanToValueRatio),
          formattedLiquidationThreshold: formatLoanToValueRatio(loanData.liquidationThreshold),
          statusText: getStatusText(loanData.status),
          payments: formattedPayments,
          payoffAmount: formatEther(payoffAmountData),
          payoffAmountRaw: payoffAmountData,
          isOverdue,
          daysRemaining,
          progressPercentage,
        } as LoanWithDetails
      } catch (err) {
        console.error("Error getting loan details:", err)
        setError("Failed to get loan details")
        return null
      } finally {
        setIsLoading(false)
      }
    },
    [contractAddress, isConnected],
  )

  // Get active loan for a property
  const getActiveLoanForProperty = useCallback(
    async (propertyId: bigint): Promise<bigint | null> => {
      if (!contractAddress || !isConnected) return null

      try {
        setIsLoading(true)
        setError(null)

        const loanId = await useReadContract({
          address: contractAddress,
          abi: LendingProtocolABI,
          functionName: "getActiveLoanForProperty",
          args: [propertyId],
        })

        return loanId
      } catch (err) {
        console.error("Error getting active loan:", err)
        setError("Failed to get active loan")
        return null
      } finally {
        setIsLoading(false)
      }
    },
    [contractAddress, isConnected],
  )

  // Get borrower loans
  const getBorrowerLoans = useCallback(
    async (borrower: `0x${string}`): Promise<bigint[]> => {
      if (!contractAddress || !isConnected) return []

      try {
        setIsLoading(true)
        setError(null)

        const loanIds = await useReadContract({
          address: contractAddress,
          abi: LendingProtocolABI,
          functionName: "getBorrowerLoans",
          args: [borrower],
        })

        return loanIds
      } catch (err) {
        console.error("Error getting borrower loans:", err)
        setError("Failed to get borrower loans")
        return []
      } finally {
        setIsLoading(false)
      }
    },
    [contractAddress, isConnected],
  )

  // Get all borrower loans with details
  const getBorrowerLoansWithDetails = useCallback(
    async (borrower: `0x${string}`): Promise<LoanWithDetails[]> => {
      if (!contractAddress || !isConnected) return []

      try {
        setIsLoading(true)
        setError(null)

        const loanIds = await getBorrowerLoans(borrower)

        const loansWithDetails = await Promise.all(
          loanIds.map(async (loanId) => {
            return await getLoan(loanId)
          }),
        )

        return loansWithDetails.filter((loan): loan is LoanWithDetails => loan !== null)
      } catch (err) {
        console.error("Error getting borrower loans with details:", err)
        setError("Failed to get borrower loans")
        return []
      } finally {
        setIsLoading(false)
      }
    },
    [contractAddress, isConnected, getBorrowerLoans, getLoan],
  )

  // Get auction by loan ID
  const getAuction = useCallback(
    async (loanId: bigint): Promise<AuctionWithDetails | null> => {
      if (!contractAddress || !isConnected) return null

      try {
        setIsLoading(true)
        setError(null)

        const auction = await useReadContract({
          address: contractAddress,
          abi: LendingProtocolABI,
          functionName: "getAuction",
          args: [loanId],
        })

        const now = new Date()
        const startTime = new Date(Number(auction.startTime) * 1000)
        const endTime = new Date(Number(auction.endTime) * 1000)
        const isActive = !auction.finalized && now < endTime

        // Calculate time remaining
        let timeRemaining = ""
        if (now > endTime) {
          timeRemaining = "Ended"
        } else {
          const remainingMs = endTime.getTime() - now.getTime()
          const days = Math.floor(remainingMs / (1000 * 60 * 60 * 24))
          const hours = Math.floor((remainingMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
          const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60))

          if (days > 0) {
            timeRemaining = `${days}d ${hours}h`
          } else if (hours > 0) {
            timeRemaining = `${hours}h ${minutes}m`
          } else {
            timeRemaining = `${minutes}m`
          }
        }

        // Calculate progress percentage
        const totalDuration = endTime.getTime() - startTime.getTime()
        const elapsed = now.getTime() - startTime.getTime()
        const progressPercentage = totalDuration > 0 ? Math.min(100, Math.max(0, (elapsed / totalDuration) * 100)) : 0

        return {
          ...auction,
          formattedStartingPrice: formatEther(auction.startingPrice),
          formattedCurrentPrice: formatEther(auction.currentPrice),
          formattedHighestBid: formatEther(auction.highestBid),
          startTime,
          endTime,
          isActive,
          timeRemaining,
          progressPercentage,
        }
      } catch (err) {
        console.error("Error getting auction details:", err)
        setError("Failed to get auction details")
        return null
      } finally {
        setIsLoading(false)
      }
    },
    [contractAddress, isConnected],
  )

  // Request a loan
  const requestLoan = useCallback(
    async (
      propertyId: bigint,
      loanAmount: string,
      interestRate: number,
      term: number,
      onSuccess?: (loanId: bigint) => void,
    ) => {
      if (!contractAddress || !isConnected || !address) {
        setError("Wallet not connected")
        return null
      }

      try {
        setIsLoading(true)
        setError(null)

        writeContract({
          address: contractAddress,
          abi: LendingProtocolABI,
          functionName: "requestLoan",
          args: [propertyId, parseEther(loanAmount), BigInt(interestRate), BigInt(term * 24 * 60 * 60)], // Convert term from days to seconds
          onSuccess(data) {
            console.log("Loan requested successfully:", data)
            // In a real app, you would get the loan ID from the event logs
            // For this example, we'll use a placeholder loan ID
            if (onSuccess) onSuccess(BigInt(Date.now()))
          },
          onError(error) {
            console.error("Error requesting loan:", error)
            setError("Failed to request loan")
          },
        })

        return true
      } catch (err) {
        console.error("Error requesting loan:", err)
        setError("Failed to request loan")
        return null
      } finally {
        setIsLoading(false)
      }
    },
    [contractAddress, isConnected, address, writeContract],
  )

  // Approve a loan (as loan officer)
  const approveLoan = useCallback(
    async (loanId: bigint) => {
      if (!contractAddress || !isConnected) {
        setError("Wallet not connected")
        return false
      }

      try {
        setIsLoading(true)
        setError(null)

        writeContract({
          address: contractAddress,
          abi: LendingProtocolABI,
          functionName: "approveLoan",
          args: [loanId],
          onSuccess(data) {
            console.log("Loan approved successfully:", data)
          },
          onError(error) {
            console.error("Error approving loan:", error)
            setError("Failed to approve loan")
          },
        })

        return true
      } catch (err) {
        console.error("Error approving loan:", err)
        setError("Failed to approve loan")
        return false
      } finally {
        setIsLoading(false)
      }
    },
    [contractAddress, isConnected, writeContract],
  )

  // Fund a loan
  const fundLoan = useCallback(
    async (loanId: bigint, amount: string) => {
      if (!contractAddress || !isConnected) {
        setError("Wallet not connected")
        return false
      }

      try {
        setIsLoading(true)
        setError(null)

        writeContract({
          address: contractAddress,
          abi: LendingProtocolABI,
          functionName: "fundLoan",
          args: [loanId],
          value: parseEther(amount),
          onSuccess(data) {
            console.log("Loan funded successfully:", data)
          },
          onError(error) {
            console.error("Error funding loan:", error)
            setError("Failed to fund loan")
          },
        })

        return true
      } catch (err) {
        console.error("Error funding loan:", err)
        setError("Failed to fund loan")
        return false
      } finally {
        setIsLoading(false)
      }
    },
    [contractAddress, isConnected, writeContract],
  )

  // Make a loan repayment
  const makeRepayment = useCallback(
    async (loanId: bigint, amount: string) => {
      if (!contractAddress || !isConnected) {
        setError("Wallet not connected")
        return false
      }

      try {
        setIsLoading(true)
        setError(null)

        writeContract({
          address: contractAddress,
          abi: LendingProtocolABI,
          functionName: "makeRepayment",
          args: [loanId],
          value: parseEther(amount),
          onSuccess(data) {
            console.log("Repayment made successfully:", data)
          },
          onError(error) {
            console.error("Error making repayment:", error)
            setError("Failed to make repayment")
          },
        })

        return true
      } catch (err) {
        console.error("Error making repayment:", err)
        setError("Failed to make repayment")
        return false
      } finally {
        setIsLoading(false)
      }
    },
    [contractAddress, isConnected, writeContract],
  )

  // Mark a loan as defaulted (admin or loan officer only)
  const markAsDefaulted = useCallback(
    async (loanId: bigint) => {
      if (!contractAddress || !isConnected) {
        setError("Wallet not connected")
        return false
      }

      try {
        setIsLoading(true)
        setError(null)

        writeContract({
          address: contractAddress,
          abi: LendingProtocolABI,
          functionName: "markAsDefaulted",
          args: [loanId],
          onSuccess(data) {
            console.log("Loan marked as defaulted successfully:", data)
          },
          onError(error) {
            console.error("Error marking loan as defaulted:", error)
            setError("Failed to mark loan as defaulted")
          },
        })

        return true
      } catch (err) {
        console.error("Error marking loan as defaulted:", err)
        setError("Failed to mark loan as defaulted")
        return false
      } finally {
        setIsLoading(false)
      }
    },
    [contractAddress, isConnected, writeContract],
  )

  // Start liquidation auction
  const startLiquidationAuction = useCallback(
    async (loanId: bigint, auctionDuration = LENDING_PROTOCOL_PARAMS.defaultAuctionDuration) => {
      if (!contractAddress || !isConnected) {
        setError("Wallet not connected")
        return false
      }

      try {
        setIsLoading(true)
        setError(null)

        writeContract({
          address: contractAddress,
          abi: LendingProtocolABI,
          functionName: "startLiquidationAuction",
          args: [loanId, BigInt(auctionDuration * 24 * 60 * 60)], // Convert days to seconds
          onSuccess(data) {
            console.log("Liquidation auction started successfully:", data)
          },
          onError(error) {
            console.error("Error starting liquidation auction:", error)
            setError("Failed to start liquidation auction")
          },
        })

        return true
      } catch (err) {
        console.error("Error starting liquidation auction:", err)
        setError("Failed to start liquidation auction")
        return false
      } finally {
        setIsLoading(false)
      }
    },
    [contractAddress, isConnected, writeContract],
  )

  // Place a bid in an auction
  const placeBid = useCallback(
    async (loanId: bigint, bidAmount: string) => {
      if (!contractAddress || !isConnected) {
        setError("Wallet not connected")
        return false
      }

      try {
        setIsLoading(true)
        setError(null)

        writeContract({
          address: contractAddress,
          abi: LendingProtocolABI,
          functionName: "placeBid",
          args: [loanId],
          value: parseEther(bidAmount),
          onSuccess(data) {
            console.log("Bid placed successfully:", data)
          },
          onError(error) {
            console.error("Error placing bid:", error)
            setError("Failed to place bid")
          },
        })

        return true
      } catch (err) {
        console.error("Error placing bid:", err)
        setError("Failed to place bid")
        return false
      } finally {
        setIsLoading(false)
      }
    },
    [contractAddress, isConnected, writeContract],
  )

  // Finalize an auction
  const finalizeAuction = useCallback(
    async (loanId: bigint) => {
      if (!contractAddress || !isConnected) {
        setError("Wallet not connected")
        return false
      }

      try {
        setIsLoading(true)
        setError(null)

        writeContract({
          address: contractAddress,
          abi: LendingProtocolABI,
          functionName: "finalizeAuction",
          args: [loanId],
          onSuccess(data) {
            console.log("Auction finalized successfully:", data)
          },
          onError(error) {
            console.error("Error finalizing auction:", error)
            setError("Failed to finalize auction")
          },
        })

        return true
      } catch (err) {
        console.error("Error finalizing auction:", err)
        setError("Failed to finalize auction")
        return false
      } finally {
        setIsLoading(false)
      }
    },
    [contractAddress, isConnected, writeContract],
  )

  // Helper function for read contract calls
  const readContract = useReadContract

  return {
    contractAddress,
    isLoading: isLoading || isPending || isWaitingForReceipt,
    isSuccess,
    error,
    txHash,
    receipt,
    getLoan,
    getActiveLoanForProperty,
    getBorrowerLoans,
    getBorrowerLoansWithDetails,
    getAuction,
    requestLoan,
    approveLoan,
    fundLoan,
    makeRepayment,
    markAsDefaulted,
    startLiquidationAuction,
    placeBid,
    finalizeAuction,
  }
}
