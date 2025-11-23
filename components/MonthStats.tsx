'use client'

import { Expense, ExpenseCategory } from '@/lib/constants'

interface MonthStatsProps {
  expenses: Expense[]
}

export default function MonthStats({ expenses }: MonthStatsProps) {
  const currentDate = new Date()
  const currentMonth = currentDate.toISOString().slice(0, 7) // YYYY-MM format
  
  // Filter expenses for current month
  const monthlyExpenses = expenses.filter(expense => 
    expense.date.startsWith(currentMonth)
  )

  const totalAmount = monthlyExpenses.reduce((sum, expense) => sum + expense.amount, 0)
  
  // Calculate category totals
  const categoryTotals: Record<string, number> = {}
  monthlyExpenses.forEach(expense => {
    categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount
  })

  const categoryEntries = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">本月统计</h2>
      
      <div className="mb-4">
        <div className="text-2xl font-bold text-primary-600">
          总支出: ¥{totalAmount.toFixed(2)}
        </div>
        <div className="text-sm text-gray-500">
          {currentDate.getFullYear()}年{currentDate.getMonth() + 1}月
        </div>
      </div>

      {categoryEntries.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-medium text-gray-700">分类支出:</h3>
          <div className="grid grid-cols-2 gap-2">
            {categoryEntries.map(([category, amount]) => (
              <div key={category} className="flex justify-between text-sm">
                <span className="text-gray-600">{category}:</span>
                <span className="font-medium">¥{amount.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {monthlyExpenses.length === 0 && (
        <p className="text-gray-500 text-center py-4">本月暂无支出记录</p>
      )}
    </div>
  )
}
