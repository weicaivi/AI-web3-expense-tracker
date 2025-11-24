'use client'

import { useState, useEffect } from 'react'
import { useAccount, useSignMessage, useWriteContract, useReadContract } from 'wagmi'
import { WalletConnectButton } from '@/components/WalletConnect'
import TransactionForm from '@/components/ExpenseForm'
import ImageUpload from '@/components/ImageUpload'
import TodayTransactions from '@/components/TodayTransactions'
import MonthlyStats from '@/components/MonthlyStats'
import InsightsPanel from '@/components/InsightsPanel'
import ExpenseList from '@/components/ExpenseList'
import ExportMenu from '@/components/ExportMenu'
import MyNFT from '@/components/MyNFT'
import { Transaction } from '@/lib/constants'
import { ParseResult } from '@/utils/ai'
import { encryptData, generateEncryptionKey } from '@/utils/crypto'
import { loadTransactions, addTransaction, StoredTransaction, saveTransactions } from '@/utils/storage'
import { FIRST_EXPENSE_NFT_ADDRESS, FIRST_EXPENSE_NFT_ABI, EXPENSE_TRACKER_ADDRESS, EXPENSE_TRACKER_ABI } from '@/lib/contracts'

export default function HomePage() {
  const { address, isConnected } = useAccount()
  const { signMessageAsync } = useSignMessage()
  const [transactions, setTransactions] = useState<StoredTransaction[]>([])
  const [encryptionKey, setEncryptionKey] = useState<string>('')
  const [isUploading, setIsUploading] = useState(false)
  const [showAllRecords, setShowAllRecords] = useState(false)
  const [showNFTModal, setShowNFTModal] = useState(false)

  // NFT Contract Interactions
  const { writeContractAsync: mintNFT } = useWriteContract()
  const { writeContractAsync: addRecordToChain } = useWriteContract()

  const { data: hasMintedNFT } = useReadContract({
    address: FIRST_EXPENSE_NFT_ADDRESS as `0x${string}`,
    abi: FIRST_EXPENSE_NFT_ABI,
    functionName: 'hasMinted',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && !!FIRST_EXPENSE_NFT_ADDRESS,
    }
  })

  useEffect(() => {
    const saved = loadTransactions()
    setTransactions(saved)
  }, [])

  useEffect(() => {
    if (isConnected && address && !encryptionKey) {
      handleGenerateKey()
    }
  }, [isConnected, address, encryptionKey])

  const handleGenerateKey = async () => {
    try {
      const result = await signMessageAsync({ message: 'ExpenseTracker' })
      const key = generateEncryptionKey(result)
      setEncryptionKey(key)
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

    let cid: string | undefined

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
          cid = result.cid
          newTransaction.cid = cid
          newTransaction.encrypted = true
        }
      } catch (error) {
        console.error('IPFS Upload Failed:', error)
      } finally {
        setIsUploading(false)
      }
    }

    const updated = addTransaction(newTransaction)
    setTransactions(updated)
    const isFirstTransaction = updated.length === 1

    if (isConnected && address && cid) {
      try {
        if (EXPENSE_TRACKER_ADDRESS) {
          await addRecordToChain({
            address: EXPENSE_TRACKER_ADDRESS as `0x${string}`,
            abi: EXPENSE_TRACKER_ABI,
            functionName: 'addRecord',
            args: [cid]
          })
        }

        if (isFirstTransaction && !hasMintedNFT && FIRST_EXPENSE_NFT_ADDRESS) {
          await mintNFT({
            address: FIRST_EXPENSE_NFT_ADDRESS as `0x${string}`,
            abi: FIRST_EXPENSE_NFT_ABI,
            functionName: 'mintFirstExpense'
          })
          setShowNFTModal(true)
        }
      } catch (error: any) {
        console.error('Chain operation failed:', error)
      }
    }
  }

  const handleImportBackup = (importedTransactions: Transaction[]) => {
    const storedTransactions = importedTransactions as StoredTransaction[]
    saveTransactions(storedTransactions)
    setTransactions(storedTransactions)
  }

  return (
    <div className="min-h-screen pb-20 overflow-x-hidden">
      {/* NFT Modal */}
      <MyNFT
        isOpen={showNFTModal}
        onClose={() => setShowNFTModal(false)}
        userName={address ? `${address.slice(0, 6)}...${address.slice(-4)}` : undefined}
        nftImage="/nft-images/first-expense-nft.jpg"
      />

      {/* Brutalist Header */}
      <header className="sticky top-0 z-50 bg-white border-b-4 border-black py-4 px-4 md:px-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-500 border-2 border-black rounded-none shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center text-white font-bold text-xl">
              AI
            </div>
            <h1 className="text-3xl font-black tracking-tighter text-black uppercase italic">
              Web3 Ledger
            </h1>
          </div>
          
          <div className="flex flex-wrap items-center gap-4 justify-center">
            {isConnected && (
              <div className="bg-green-100 border-2 border-black px-3 py-1 font-mono text-sm font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : ''}
              </div>
            )}
            <div className="flex gap-2">
              <ExportMenu
                transactions={transactions}
                onImportBackup={handleImportBackup}
              />
              <div className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all">
                 <WalletConnectButton />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-10 space-y-10">
        
        {/* Section 1: Input Methods */}
        {/* Added items-stretch to grid and flex-col/h-full to children for equal height */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Text Form */}
          <div className="lg:col-span-7 flex flex-col animate-slideUp delay-100">
             <div className="flex items-center gap-2 mb-2">
                <div className="bg-blue-400 w-4 h-4 border border-black"></div>
                <h2 className="font-bold text-xl">Manual Entry</h2>
             </div>
             {/* Added h-full and flex flex-col to fill space */}
             <div className="neo-card p-6 relative overflow-hidden group h-full flex flex-col justify-center">
               <div className="absolute top-0 right-0 bg-blue-400 text-white text-xs font-bold px-2 py-1 border-l-2 border-b-2 border-black z-10">
                  TYPE IT
               </div>
               <TransactionForm onTransactionAdded={handleAddTransaction} />
             </div>
          </div>
          
          {/* Image Upload */}
          <div className="lg:col-span-5 flex flex-col animate-slideUp delay-200">
            <div className="flex items-center gap-2 mb-2">
                <div className="bg-yellow-400 w-4 h-4 border border-black"></div>
                <h2 className="font-bold text-xl">AI Scan</h2>
             </div>
            {/* Added h-full to fill space */}
            <div className="neo-card p-6 bg-yellow-50 relative h-full">
              <div className="absolute top-0 right-0 bg-yellow-400 text-black text-xs font-bold px-2 py-1 border-l-2 border-b-2 border-black z-10">
                  DROP IT
               </div>
               {/* Decoration */}
               <div className="absolute -bottom-4 -right-4 text-6xl opacity-20 rotate-12 select-none pointer-events-none">📸</div>
              <ImageUpload onImageParsed={handleAddTransaction} />
            </div>
          </div>
        </div>

        {/* Section 2: Stats & Today */}
        {/* Added items-stretch for equal height */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          <div className="flex flex-col animate-slideUp delay-300">
             <div className="neo-card p-0 overflow-hidden h-full">
               <div className="bg-pink-400 border-b-2 border-black p-3">
                 <h3 className="font-black text-white text-lg uppercase tracking-widest">Today's Activity</h3>
               </div>
               <div className="p-4 h-full">
                 <TodayTransactions transactions={transactions} />
               </div>
             </div>
          </div>

          <div className="flex flex-col animate-slideUp delay-300">
            <div className="neo-card p-0 overflow-hidden h-full">
               <div className="bg-purple-400 border-b-2 border-black p-3">
                 <h3 className="font-black text-white text-lg uppercase tracking-widest">Monthly Overview</h3>
               </div>
               <div className="p-4 h-full">
                 <MonthlyStats transactions={transactions} />
               </div>
             </div>
          </div>
        </div>

        {/* Insights Panel */}
        <div className="animate-slideUp delay-400">
          <div className="neo-card border-4 border-black bg-white">
            <div className="p-6">
              <h2 className="text-2xl font-black mb-4 flex items-center gap-2">
                <span>🧠</span> AI Insights
              </h2>
              <InsightsPanel transactions={transactions} />
            </div>
          </div>
        </div>

        {/* All Records Section */}
        <div className="space-y-6 pt-8 border-t-4 border-dashed border-black/20">
          {/* Toggle Button */}
          <div className="flex justify-center">
            <button
              onClick={() => setShowAllRecords(!showAllRecords)}
              className="neo-btn bg-black text-white hover:bg-gray-800 flex items-center gap-3 text-lg"
            >
              <span className={`transition-transform duration-300 ${showAllRecords ? 'rotate-180' : ''}`}>
                ▼
              </span>
              <span>{showAllRecords ? 'COLLAPSE' : 'REVEAL'} ARCHIVE</span>
              {transactions.length > 0 && (
                <span className="bg-white text-black border border-black px-2 py-0.5 text-xs font-bold shadow-[2px_2px_0px_0px_rgba(255,255,255,0.5)]">
                  {transactions.length}
                </span>
              )}
            </button>
          </div>

          {/* Records List */}
          {showAllRecords && (
            <div className="animate-slideUp">
              <div className="neo-card p-2 md:p-6">
                <ExpenseList transactions={transactions} />
              </div>
            </div>
          )}
        </div>

        {/* Dev Tools / Test Area */}
        <div className="flex justify-center py-8 opacity-50 hover:opacity-100 transition-opacity">
          <button
            onClick={() => setShowNFTModal(true)}
            className="text-xs font-mono border border-black px-2 py-1 bg-gray-200 hover:bg-purple-200"
          >
            [DEV: TEST NFT POPUP]
          </button>
        </div>

        {/* Connection Warning */}
        {!isConnected && (
          <div className="fixed bottom-4 right-4 animate-bounce-slow z-40 max-w-xs">
            <div className="bg-red-100 border-4 border-black p-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
              <p className="font-bold text-red-900 mb-1">⚠️ WALLET DISCONNECTED</p>
              <p className="text-sm font-medium">Connect wallet to enable military-grade encryption & IPFS storage.</p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}