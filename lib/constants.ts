// Configuration constants
export const QWEN_API_URL = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation'
export const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages'

// Contract addresses (will be updated after deployment)
export const FIRST_EXPENSE_NFT_ADDRESS = process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS || ''

// IPFS configuration
export const WEB3_STORAGE_TOKEN = process.env.NEXT_PUBLIC_WEB3_STORAGE_TOKEN || ''

// Expense categories
export const EXPENSE_CATEGORIES = [
  '餐饮',
  '交通', 
  '购物',
  '娱乐',
  '其他'
] as const

export type ExpenseCategory = typeof EXPENSE_CATEGORIES[number]

// Expense data structure
export interface Expense {
  id: string
  amount: number
  category: ExpenseCategory
  date: string
  description: string
  cid?: string
}
