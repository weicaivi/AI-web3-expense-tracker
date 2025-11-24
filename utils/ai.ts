import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, TransactionType } from '@/lib/constants'

export interface ParseResult {
  type: TransactionType
  amount: number
  category: string
  date: string
  description: string
}

export async function parseTransactionText(text: string): Promise<ParseResult | null> {
  const today = new Date().toISOString().split('T')[0]
  
  // Improved prompt with better structure and examples for both expenses and income
  const prompt = `你是一个专业的记账助手。请从用户输入中提取记账信息，并严格按照JSON格式返回。

判断类型：
- 如果是支出(花钱、消费、买等)：type = "expense"
- 如果是收入(收到、工资、转入等)：type = "income"

规则：
1. type：必须是 "expense" 或 "income"
2. 金额(amount)：提取数字，必须是正数
3. 分类(category)：
   - 如果是支出，必须是：${EXPENSE_CATEGORIES.join('、')}
   - 如果是收入，必须是：${INCOME_CATEGORIES.join('、')}
4. 日期(date)：如果用户提到"今天"或没有指定日期，使用 ${today}；如果提到"昨天"，使用昨天的日期；如果指定了具体日期，解析该日期
5. 描述(description)：简短概括内容，不超过10个字

支出示例：
输入："今天吃饭花了30块"
输出：{"type": "expense", "amount": 30, "category": "餐饮", "date": "${today}", "description": "吃饭"}

输入："昨天打车12元"
输出：{"type": "expense", "amount": 12, "category": "交通", "date": "${getPreviousDay(today)}", "description": "打车"}

收入示例：
输入："今天收到工资5000元"
输出：{"type": "income", "amount": 5000, "category": "工资", "date": "${today}", "description": "工资"}

输入："朋友转账500"
输出：{"type": "income", "amount": 500, "category": "转账", "date": "${today}", "description": "朋友转账"}

现在处理：
输入："${text}"

只返回JSON格式的结果，不要包含任何其他文字或解释。如果无法解析，返回 {"error": "无法解析"}。`

  try {
    const response = await fetch('/api/parse', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text, prompt }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to parse expense text')
    }

    const result = await response.json()
    
    if (result.data?.error) {
      throw new Error(result.data.error)
    }
    
    return result.data
  } catch (error) {
    console.error('AI parsing failed:', error)
    throw error
  }
}

function getPreviousDay(dateString: string): string {
  const date = new Date(dateString)
  date.setDate(date.getDate() - 1)
  return date.toISOString().split('T')[0]
}
