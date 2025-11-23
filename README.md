# AI Web3 Expense Tracker

AI-powered Web3 expense tracking application built with Next.js, RainbowKit, and IPFS storage.

## Features

- 🤖 **AI Natural Language Processing**: Input expenses in natural language (e.g., "今天吃饭30块")
- 🔐 **Web3 Data Ownership**: Encrypted data storage on IPFS
- 💳 **Wallet Integration**: Connect with MetaMask and other wallets via RainbowKit
- 🏆 **NFT Milestones**: Earn NFTs for expense tracking milestones
- 📊 **Monthly Statistics**: Visualize spending patterns

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Web3**: RainbowKit, Wagmi, Viem
- **AI**: Alibaba Qwen (通义千问) with Claude fallback
- **Storage**: IPFS via Pinata
- **Blockchain**: Ethereum Sepolia testnet

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Setup

Edit `.env.local` with your API keys:

```env
# AI Service (provide at least one)
QWEN_API_KEY=your_qwen_api_key_here
CLAUDE_API_KEY=your_claude_api_key_here

# IPFS Storage (Pinata)
PINATA_JWT=your_pinata_jwt_token_here

# Wallet
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
```

**Note**: The app will try Qwen API first, and automatically fallback to Claude if Qwen fails or is not configured.

### 3. Deploy NFT Contract

1. Open [Remix IDE](https://remix.ethereum.org/)
2. Create new file `FirstExpenseNFT.sol`
3. Copy contract code from `contracts/FirstExpenseNFT.sol`
4. Compile and deploy to Sepolia testnet
5. Update `NEXT_PUBLIC_NFT_CONTRACT_ADDRESS` in `.env.local`

### 4. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## API Keys Setup

### AI Services (Choose at least one)

#### Qwen API (通义千问) - Primary

1. Visit [Alibaba Cloud DashScope](https://dashscope.aliyun.com/)
2. Sign up and get your API key
3. Add to `.env.local` as `QWEN_API_KEY`

#### Claude API - Backup (Optional)

1. Visit [Anthropic Console](https://console.anthropic.com/)
2. Sign up and get your API key
3. Add to `.env.local` as `CLAUDE_API_KEY`

The system will automatically use Claude as a fallback if Qwen is unavailable or fails.

### Web3.Storage

1. Visit [Pinata](https://pinata.cloud/)
2. Sign up for a free account
3. Go to API Keys section
4. Create a new API key and copy the JWT token
5. Add to `.env.local` as `PINATA_JWT`

### WalletConnect Project ID

1. Visit [WalletConnect Cloud](https://cloud.walletconnect.com/)
2. Create a new project
3. Get your Project ID
4. Add to `.env.local` as `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`

## Usage

1. **Connect Wallet**: Click the connect button and select your preferred wallet
2. **Add Expenses**: Type natural language like "今天吃饭30块" and let AI parse it
3. **Review & Confirm**: Check AI parsing results and confirm
4. **Track Progress**: View monthly statistics and expense history
5. **Earn NFTs**: Get your first expense NFT milestone!

## Project Structure

```
/app
  /api
    /parse          # AI parsing endpoint
    /ipfs-upload    # IPFS upload endpoint
  layout.tsx        # Root layout with wallet provider
  page.tsx          # Main application page
  globals.css       # Global styles

/components
  WalletConnect.tsx # Wallet connection setup
  ExpenseForm.tsx   # Input form with AI parsing
  ExpenseList.tsx   # Expense history display
  MonthStats.tsx    # Monthly statistics

/utils
  crypto.ts         # Encryption utilities
  ipfs.ts          # IPFS utilities
  ai.ts            # AI parsing utilities

/contracts
  FirstExpenseNFT.sol # NFT contract for milestones

/lib
  constants.ts      # App constants and types
  wagmi.ts         # Wagmi configuration
```


## License

MIT License
