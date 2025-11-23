'use client'

import { Expense } from '@/lib/constants'

interface ExpenseListProps {
  expenses: Expense[]
}

export default function ExpenseList({ expenses }: ExpenseListProps) {
  const sortedExpenses = [...expenses].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  if (expenses.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">记账记录</h2>
        <p className="text-gray-500 text-center py-8">暂无记账记录</p>
      </div>
    )
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">记账记录</h2>
      
      <div className="space-y-2">
        {sortedExpenses.map((expense) => (
          <div 
            key={expense.id}
            className="flex items-center justify-between p-3 border border-gray-200 rounded-md hover:bg-gray-50"
          >
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                {expense.date}
              </div>
              <div className="text-sm bg-gray-100 px-2 py-1 rounded">
                {expense.category}
              </div>
              <div className="text-sm text-gray-700">
                {expense.description}
              </div>
            </div>
            
            <div className="font-medium text-lg">
              ¥{expense.amount}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
