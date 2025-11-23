import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { data } = await request.json()
    
    if (!data) {
      return NextResponse.json({ error: 'Data is required' }, { status: 400 })
    }

    const web3StorageToken = process.env.WEB3_STORAGE_TOKEN
    if (!web3StorageToken) {
      return NextResponse.json({ error: 'Storage service not configured' }, { status: 500 })
    }

    // Import Web3Storage dynamically to avoid SSR issues
    const { Web3Storage } = await import('web3.storage')
    
    const client = new Web3Storage({ token: web3StorageToken })
    const file = new File([data], 'expense.json', { type: 'application/json' })
    const cid = await client.put([file])

    return NextResponse.json({
      success: true,
      cid
    })

  } catch (error) {
    console.error('IPFS upload error:', error)
    return NextResponse.json({ 
      error: 'Upload failed' 
    }, { status: 500 })
  }
}
