'use client'

import { useState, useEffect } from 'react'
import { useAccount, useSignMessage } from 'wagmi'
import { WalletConnectButton } from '@/components/WalletConnect'
import TransactionForm from '@/components/ExpenseForm'
import ImageUpload from '@/components/ImageUpload'
import TodayTransactions from '@/components/TodayTransactions'
import MonthlyStats from '@/components/MonthlyStats'
import InsightsPanel from '@/components/InsightsPanel'
import ExpenseList from '@/components/ExpenseList'
import ExportMenu from '@/components/ExportMenu'
import { Transaction } from '@/lib/constants'
import { ParseResult } from '@/utils/ai'
import { encryptData, generateEncryptionKey } from '@/utils/crypto'
import { loadTransactions, addTransaction, StoredTransaction, saveTransactions } from '@/utils/storage'

export default function HomePage() {
  const { address, isConnected } = useAccount()
  const { signMessage } = useSignMessage()
  const [transactions, setTransactions] = useState<StoredTransaction[]>([])
  const [encryptionKey, setEncryptionKey] = useState<string>('')
  const [isUploading, setIsUploading] = useState(false)
  const [showAllRecords, setShowAllRecords] = useState(false)

  // Load transactions from localStorage on component mount
  useEffect(() => {
    const saved = loadTransactions()
    setTransactions(saved)
  }, [])

  // Generate encryption key when wallet is connected
  useEffect(() => {
    if (isConnected && address && !encryptionKey) {
      handleGenerateKey()
    }
  }, [isConnected, address, encryptionKey])

  const handleGenerateKey = async () => {
    try {
      const result = await signMessage({ message: 'ExpenseTracker' })
      if (result) {
        const key = generateEncryptionKey(result)
        setEncryptionKey(key)
      }
    } catch (error) {
      console.error('Failed to generate encryption key:', error)
    }
  }

  const handleAddTransaction = async (parsedResult: ParseResult) => {
    const newTransaction: StoredTransaction = {
      id: Date.now().toString(),
      type: parsedResult.type,
      amount: parsedResult.amount,
      category: parsedResult.category as any,
      date: parsedResult.date,
      description: parsedResult.description,
    }

    // Encrypt and upload to IPFS if wallet is connected
    if (isConnected && encryptionKey) {
      setIsUploading(true)
      try {
        const encryptedData = encryptData(newTransaction, encryptionKey)

        const response = await fetch('/api/ipfs-upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: encryptedData }),
        })

        if (response.ok) {
          const result = await response.json()
          newTransaction.cid = result.cid
          newTransaction.encrypted = true
          console.log('Uploaded to IPFS:', result.cid)
        } else {
          console.error('IPFS upload failed')
        }
      } catch (error) {
        console.error('Failed to upload to IPFS:', error)
      } finally {
        setIsUploading(false)
      }
    }

    // Add to storage and update state
    const updated = addTransaction(newTransaction)
    setTransactions(updated)
  }

  const handleImportBackup = (importedTransactions: Transaction[]) => {
    // Replace all transactions with imported data
    const storedTransactions = importedTransactions as StoredTransaction[]
    saveTransactions(storedTransactions)
    setTransactions(storedTransactions)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">AI Web3 记账</h1>
          <div className="flex items-center space-x-4">
            {isConnected && (
              <div className="text-sm text-gray-600">
                余额: {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : ''}
              </div>
            )}
            <ExportMenu
              transactions={transactions}
              onImportBackup={handleImportBackup}
            />
            <WalletConnectButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Input Methods */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Text Input Form */}
          <TransactionForm onTransactionAdded={handleAddTransaction} />
          
          {/* Image Upload */}
          <ImageUpload onImageParsed={handleAddTransaction} />
        </div>

        {/* Today's Transactions */}
        <TodayTransactions transactions={transactions} />

        {/* Monthly Stats */}
        <MonthlyStats transactions={transactions} />

        {/* Insights Panel */}
        <InsightsPanel transactions={transactions} />

        {/* All Records Section */}
        <div className="space-y-4">
          {/* Toggle Button */}
          <div className="flex justify-center">
            <button
              onClick={() => setShowAllRecords(!showAllRecords)}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
            >
              <svg
                className={`w-5 h-5 transition-transform ${showAllRecords ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              <span>{showAllRecords ? '收起' : '查看'}所有记账记录</span>
              {transactions.length > 0 && (
                <span className="bg-white text-blue-600 px-2 py-0.5 rounded-full text-sm font-semibold">
                  {transactions.length}
                </span>
              )}
            </button>
          </div>

          {/* Records List */}
          {showAllRecords && (
            <div className="animate-fadeIn">
              <ExpenseList transactions={transactions} />
            </div>
          )}
        </div>

        {/* Connection Status */}
        {!isConnected && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800">
              连接钱包以启用数据加密和IPFS存储功能
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
