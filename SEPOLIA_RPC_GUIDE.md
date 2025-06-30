# Sepolia RPC URL Guide

## Quick Options (Recommended)

### 1. **Alchemy** (Most Popular)
- Go to [alchemy.com](https://alchemy.com)
- Sign up for free account
- Create new app → Select "Sepolia" network
- Copy the HTTPS URL from your app dashboard
- **Format**: `https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY`

### 2. **Infura** (Very Reliable)
- Go to [infura.io](https://infura.io)
- Sign up for free account
- Create new project → Select "Sepolia" network
- Copy the endpoint URL
- **Format**: `https://sepolia.infura.io/v3/YOUR_PROJECT_ID`

### 3. **QuickNode** (Fast & Reliable)
- Go to [quicknode.com](https://quicknode.com)
- Sign up for free account
- Create endpoint → Select "Sepolia"
- Copy the HTTP Provider URL
- **Format**: `https://your-endpoint-name.sepolia.quiknode.pro/YOUR_API_KEY/`

## Free Public RPCs (Use with caution)

### 4. **Ankr**
```
https://rpc.ankr.com/eth_sepolia
```

### 5. **Chainstack**
```
https://nd-123-456-789.p2pify.com
```

### 6. **1RPC**
```
https://1rpc.io/sepolia
```

## For Your AgroAI Project

### Recommended Setup:
1. **Use Alchemy or Infura** for production reliability
2. **Add to your `.env` file**:
```bash
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY
```

### Testing Your RPC:
```bash
# Test with curl
curl -X POST -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
  https://your-rpc-url-here
```

## Security Notes:
- Never commit RPC URLs with API keys to public repositories
- Use environment variables
- Free tiers have rate limits (usually sufficient for development)

## Next Steps:
1. Choose a provider (Alchemy recommended)
2. Get your RPC URL
3. Add to `.env` file
4. Update `hardhat.config.js` with the URL
5. Test connection with `npx hardhat test --network sepolia` 