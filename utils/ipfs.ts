import { Web3Storage } from 'web3.storage'

const WEB3_STORAGE_TOKEN = process.env.NEXT_PUBLIC_WEB3_STORAGE_TOKEN

export async function uploadToIPFS(data: string): Promise<string | null> {
  if (!WEB3_STORAGE_TOKEN) {
    console.error('Web3.Storage token not found')
    return null
  }

  try {
    const client = new Web3Storage({ token: WEB3_STORAGE_TOKEN })
    const file = new File([data], 'expense.json', { type: 'application/json' })
    const cid = await client.put([file])
    return cid
  } catch (error) {
    console.error('IPFS upload failed:', error)
    return null
  }
}

export async function retrieveFromIPFS(cid: string): Promise<string | null> {
  if (!WEB3_STORAGE_TOKEN) {
    console.error('Web3.Storage token not found')
    return null
  }

  try {
    const client = new Web3Storage({ token: WEB3_STORAGE_TOKEN })
    const res = await client.get(cid)
    if (!res?.ok) {
      throw new Error('IPFS retrieval failed')
    }
    
    const files = await res.files()
    if (files.length > 0) {
      return await files[0].text()
    }
    return null
  } catch (error) {
    console.error('IPFS retrieval failed:', error)
    return null
  }
}
