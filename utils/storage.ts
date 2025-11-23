import { Expense } from '@/lib/constants'

const EXPENSES_KEY = 'expenses'
const CID_LIST_KEY = 'cidList'

export interface StoredExpense extends Expense {
  cid?: string
  encrypted?: boolean
}

// Save expenses to localStorage
export function saveExpenses(expenses: StoredExpense[]): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem(EXPENSES_KEY, JSON.stringify(expenses))
    
    // Also maintain a separate CID list for IPFS references
    const cids = expenses.filter(e => e.cid).map(e => e.cid!)
    localStorage.setItem(CID_LIST_KEY, JSON.stringify(cids))
  } catch (error) {
    console.error('Failed to save expenses:', error)
  }
}

// Load expenses from localStorage
export function loadExpenses(): StoredExpense[] {
  if (typeof window === 'undefined') return []
  
  try {
    const saved = localStorage.getItem(EXPENSES_KEY)
    if (saved) {
      return JSON.parse(saved)
    }
  } catch (error) {
    console.error('Failed to load expenses:', error)
  }
  return []
}

// Add a single expense
export function addExpense(expense: StoredExpense): StoredExpense[] {
  const expenses = loadExpenses()
  const updated = [...expenses, expense]
  saveExpenses(updated)
  return updated
}

// Delete an expense by ID
export function deleteExpense(id: string): StoredExpense[] {
  const expenses = loadExpenses()
  const updated = expenses.filter(e => e.id !== id)
  saveExpenses(updated)
  return updated
}

// Get CID list
export function getCIDList(): string[] {
  if (typeof window === 'undefined') return []
  
  try {
    const saved = localStorage.getItem(CID_LIST_KEY)
    if (saved) {
      return JSON.parse(saved)
    }
  } catch (error) {
    console.error('Failed to load CID list:', error)
  }
  return []
}

// Clear all data
export function clearAllData(): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.removeItem(EXPENSES_KEY)
    localStorage.removeItem(CID_LIST_KEY)
  } catch (error) {
    console.error('Failed to clear data:', error)
  }
}

// Get statistics
export function getMonthlyStats(expenses: StoredExpense[], yearMonth: string) {
  const monthlyExpenses = expenses.filter(e => e.date.startsWith(yearMonth))
  
  const total = monthlyExpenses.reduce((sum, e) => sum + e.amount, 0)
  
  const byCategory: Record<string, number> = {}
  monthlyExpenses.forEach(e => {
    byCategory[e.category] = (byCategory[e.category] || 0) + e.amount
  })
  
  return {
    total,
    count: monthlyExpenses.length,
    byCategory,
    expenses: monthlyExpenses
  }
}
