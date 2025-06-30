# Chainlink & Blockchain Usage Proof

## 1. Smart Contract Integration
- **Contracts:**
  - `AgroAICore.sol` and `AgroAIToken.sol` deployed on Sepolia
  - Implements reward logic, disease detection, and Chainlink Functions/VRF
- **Events Emitted:**
  - `PhotoRewarded`, `DiseaseDetectionRewarded`, `PurchaseProcessed`, `CommunityAlertTriggered`, etc.
- **Chainlink Functions:**
  - Used for off-chain computation and data verification
  - Events: `RequestSent`, `RequestFulfilled` (see `FunctionsClient.sol`)

## 2. Backend Blockchain Calls
- **File:** `backend/blockchain/web3_service.py`
- **Functions:**
  - `reward_photo_upload(user_address)`
  - `reward_disease_detection(user_address, is_early_detection, disease)`
  - `request_chainlink_verification(...)`
- **Returns:** Each function returns a `transaction_hash` and result details
- **API Endpoint:** `/api/detect-enhanced` (POST)
  - Returns blockchain transaction hashes in the response

## 3. How to Verify On-Chain Activity
1. **Upload a photo using `/api/detect-enhanced` with a wallet address**
2. **Get the `transaction_hash` from the API response**
3. **Go to [Sepolia Etherscan](https://sepolia.etherscan.io/)**
4. **Paste the transaction hash to view details**
5. **Check for contract events and Chainlink logs**

## 4. Example Transaction
- **Sample Transaction Hash:** (replace with your actual hash)
- **Etherscan Link:** https://sepolia.etherscan.io/tx/YOUR_TX_HASH
- **Events:**
  - `PhotoRewarded`, `DiseaseDetectionRewarded`, `RequestSent`, `RequestFulfilled`

## 5. Chainlink Usage in Code
- **Solidity:**
  - `FunctionsClient.sol` emits Chainlink request/fulfillment events
  - `AgroAICore.sol` calls Chainlink Functions for photo analysis
- **Backend:**
  - Calls `request_chainlink_verification` to trigger on-chain Chainlink requests

---

**This project demonstrates heavy use of Chainlink Functions and on-chain reward logic, all verifiable on Etherscan.** 