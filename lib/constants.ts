// Configuration constants
export const QWEN_API_URL = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation'
export const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages'

// Contract addresses (will be updated after deployment)
export const FIRST_EXPENSE_NFT_ADDRESS = process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS || ''

// IPFS configuration (Pinata)
export const PINARA_JWT = process.env.PINATA_JWT || ''
export const PINARA_GATEWAY = 'https://gateway.pinata.cloud/ipfs/'

// Transaction types
export const TRANSACTION_TYPES = ['expense', 'income'] as const
export type TransactionType = typeof TRANSACTION_TYPES[number]

// Expense categories
export const EXPENSE_CATEGORIES = [
  '餐饮',
  '交通', 
  '购物',
  '娱乐',
  '其他'
] as const

export type ExpenseCategory = typeof EXPENSE_CATEGORIES[number]

// Income categories
export const INCOME_CATEGORIES = [
  'Salary',
  'Transfer In',
  'Others'
] as const

export type IncomeCategory = typeof INCOME_CATEGORIES[number]

// All categories combined
export type Category = ExpenseCategory | IncomeCategory

// Base transaction interface
export interface Transaction {
  id: string
  type: TransactionType
  amount: number
  category: Category
  date: string
  description: string
  cid?: string
  encrypted?: boolean
}

// Expense data structure (for backward compatibility)
export interface Expense extends Transaction {
  type: 'expense'
  category: ExpenseCategory
}

// Income data structure
export interface Income extends Transaction {
  type: 'income'
  category: IncomeCategory
}
