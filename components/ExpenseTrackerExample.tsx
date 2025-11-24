'use client'

import { useAccount } from 'wagmi'
import { useAddExpenseRecord, useFetchExpenseRecords, useExpenseRecordCount } from '@/hooks/useExpenseTracker'
import { useState } from 'react'

/**
 * 链上索引功能使用示例组件
 * 展示如何添加和读取记账记录
 */
export default function ExpenseTrackerExample() {
  const { address } = useAccount()
  const [testCid, setTestCid] = useState('')

  // Hook 1: 添加记录
  const { addRecord, isLoading: isAdding, isSuccess, error, txHash } = useAddExpenseRecord()

  // Hook 2: 读取记录
  const { records, isLoading: isFetching, refetch } = useFetchExpenseRecords(address)

  // Hook 3: 获取记录数量
  const { count } = useExpenseRecordCount(address)

  // 处理添加记录
  const handleAddRecord = async () => {
    if (!testCid) {
      alert('请输入 CID')
      return
    }

    try {
      const hash = await addRecord(testCid)
      console.log('交易已提交:', hash)
      // 交易确认后会自动触发 isSuccess
    } catch (err) {
      console.error('添加失败:', err)
    }
  }

  // 监听成功状态，自动刷新列表
  if (isSuccess) {
    setTimeout(() => {
      refetch()
    }, 2000) // 等待 2 秒后刷新（确保链上数据已更新）
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h2 className="text-2xl font-bold">链上索引功能测试</h2>

      {/* 钱包连接状态 */}
      {!address ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
          <p className="text-yellow-800">请先连接钱包</p>
        </div>
      ) : (
        <>
          {/* 记录数量 */}
          <div className="bg-blue-50 border border-blue-200 rounded p-4">
            <p className="text-sm text-gray-600">当前地址</p>
            <p className="font-mono text-xs break-all">{address}</p>
            <p className="mt-2 text-lg font-semibold">
              链上记录数量: {count}
            </p>
          </div>

          {/* 添加记录区域 */}
          <div className="border rounded-lg p-4 space-y-3">
            <h3 className="font-semibold">添加新记录</h3>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="输入 IPFS CID (例如: QmXxx...)"
                value={testCid}
                onChange={(e) => setTestCid(e.target.value)}
                className="flex-1 px-3 py-2 border rounded"
                disabled={isAdding}
              />
              <button
                onClick={handleAddRecord}
                disabled={isAdding || !testCid}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
              >
                {isAdding ? '上链中...' : '添加到链上'}
              </button>
            </div>

            {/* 交易状态 */}
            {isAdding && (
              <div className="text-sm text-blue-600">
                ⏳ 正在等待交易确认...
              </div>
            )}
            {isSuccess && txHash && (
              <div className="text-sm text-green-600">
                ✅ 交易成功！
                <a
                  href={`https://sepolia.etherscan.io/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-2 underline"
                >
                  查看交易
                </a>
              </div>
            )}
            {error && (
              <div className="text-sm text-red-600">
                ❌ 错误: {error.message}
              </div>
            )}
          </div>

          {/* 记录列表 */}
          <div className="border rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">链上记录列表</h3>
              <button
                onClick={() => refetch()}
                disabled={isFetching}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                {isFetching ? '刷新中...' : '🔄 刷新'}
              </button>
            </div>

            {isFetching ? (
              <div className="text-center text-gray-500 py-8">加载中...</div>
            ) : records.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                暂无记录
              </div>
            ) : (
              <div className="space-y-2">
                {records.map((record, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 rounded p-3 space-y-1"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="text-xs text-gray-500">CID #{index + 1}</p>
                        <p className="font-mono text-sm break-all">
                          {record.cid}
                        </p>
                      </div>
                      <a
                        href={`https://gateway.pinata.cloud/ipfs/${record.cid}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline ml-2"
                      >
                        查看
                      </a>
                    </div>
                    <p className="text-xs text-gray-500">
                      时间: {new Date(Number(record.timestamp) * 1000).toLocaleString('zh-CN')}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* 使用说明 */}
      <div className="bg-gray-50 rounded p-4 text-sm space-y-2">
        <h4 className="font-semibold">使用流程：</h4>
        <ol className="list-decimal list-inside space-y-1 text-gray-700">
          <li>连接钱包（Sepolia 测试网）</li>
          <li>输入一个 IPFS CID（从 Pinata 上传后获得）</li>
          <li>点击"添加到链上"，确认交易</li>
          <li>等待交易确认（约 10-20 秒）</li>
          <li>记录将出现在列表中</li>
        </ol>
      </div>
    </div>
  )
}
