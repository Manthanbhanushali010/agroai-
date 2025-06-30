# 🔧 AgroAI Deployment Troubleshooting Guide

## 🚨 **COMMON ISSUES & INSTANT FIXES**

### **Issue 1: "Only seeing 4 files instead of complete project"**

**Problem**: The tar.gz file contains the complete project, but you're only seeing the attachment files.

**Solution**:
```bash
# Extract the tar.gz file properly
tar -xzf AGROAI_FINAL_COMPLETE_PACKAGE.tar.gz

# You should now see the complete project structure
cd agroai-final-complete
ls -la  # Should show 10+ folders and files
```

### **Issue 2: "tar command not found" (Windows)**

**Problem**: Windows doesn't have tar by default.

**Solutions**:
```bash
# Option 1: Use Git Bash (recommended)
# Download Git for Windows, then use Git Bash terminal

# Option 2: Use Windows Subsystem for Linux
wsl tar -xzf AGROAI_FINAL_COMPLETE_PACKAGE.tar.gz

# Option 3: Use 7-Zip or WinRAR
# Right-click → Extract with 7-Zip
```

### **Issue 3: "cursor command not found"**

**Problem**: Cursor CLI not installed or not in PATH.

**Solution**:
```bash
# Option 1: Open Cursor IDE manually
# File → Open Folder → Select agroai-final-complete

# Option 2: Install Cursor CLI
# In Cursor IDE: View → Command Palette → "Install 'cursor' command"

# Option 3: Use VS Code instead
code .
```

### **Issue 4: "npm install fails"**

**Problem**: Dependency conflicts or network issues.

**Solutions**:
```bash
# Try these in order:
npm install --legacy-peer-deps
npm install --force
rm -rf node_modules package-lock.json && npm install
npm cache clean --force && npm install
```

### **Issue 5: "Python dependencies fail to install"**

**Problem**: Missing Python packages or version conflicts.

**Solutions**:
```bash
# Create virtual environment (recommended)
python3 -m venv agroai-env
source agroai-env/bin/activate  # On Windows: agroai-env\Scripts\activate

# Install dependencies
pip3 install -r requirements.txt

# If still fails, try:
pip3 install --upgrade pip
pip3 install -r requirements.txt --no-cache-dir
```

### **Issue 6: "Contract deployment fails"**

**Problem**: Network issues, insufficient funds, or configuration errors.

**Solutions**:
```bash
# Check your .env configuration
cat blockchain/.env

# Verify you have Sepolia ETH
# Get free Sepolia ETH from: https://sepoliafaucet.com/

# Test network connection
npx hardhat run scripts/test-connection.js --network sepolia

# Try deployment with more gas
npx hardhat run scripts/deploy.js --network sepolia --gas-limit 5000000
```

### **Issue 7: "Port already in use"**

**Problem**: Ports 5000 or 5001 are occupied by other services.

**Solutions**:
```bash
# Find and kill processes using the ports
lsof -ti:5000 | xargs kill -9
lsof -ti:5001 | xargs kill -9

# Or change ports in configuration
# Edit enhanced-backend/enhanced_app.py: app.run(port=5002)
# Edit Plant-Disease-Detection-main/Flask Deployed App/app.py: app.run(port=5003)
```

### **Issue 8: "MetaMask not connecting"**

**Problem**: Network mismatch or connection issues.

**Solutions**:
```bash
# Ensure MetaMask is on Sepolia testnet
# Network: Sepolia Test Network
# Chain ID: 11155111
# RPC URL: https://sepolia.infura.io/v3/

# Clear MetaMask cache
# MetaMask → Settings → Advanced → Reset Account

# Check browser console for errors
# F12 → Console tab
```

### **Issue 9: "AI model not loading"**

**Problem**: Missing model files or path issues.

**Solutions**:
```bash
# Check if model files exist
ls -la Plant-Disease-Detection-main/Model/

# Verify Python path
cd Plant-Disease-Detection-main/Flask\ Deployed\ App
python3 -c "import CNN; print('Model loaded successfully')"

# If model missing, download from project repository
```

### **Issue 10: "Chainlink Functions not working"**

**Problem**: Subscription issues or network problems.

**Solutions**:
```bash
# Check Chainlink subscription
# Visit: https://functions.chain.link/
# Ensure subscription is funded with LINK tokens

# Verify function code
cat chainlink-functions/photo-verification.js

# Test function locally
node chainlink-functions/test-functions.js
```

## 🔄 **COMPLETE RESTART PROCEDURE**

If everything fails, use this nuclear option:

```bash
# 1. Clean everything
rm -rf node_modules
rm -rf agroai-env
rm package-lock.json

# 2. Re-extract project
tar -xzf AGROAI_FINAL_COMPLETE_PACKAGE.tar.gz
cd agroai-final-complete

# 3. Fresh installation
npm install
python3 -m venv agroai-env
source agroai-env/bin/activate
pip3 install -r enhanced-backend/requirements.txt

# 4. Configure environment
cp blockchain/.env.example blockchain/.env
# Edit .env with your values

# 5. Deploy fresh
./quick-deploy.sh
```

## 📞 **EMERGENCY DEPLOYMENT (30 minutes)**

If you're running out of time, use this minimal deployment:

```bash
# 1. Quick setup
cd blockchain
npm install
cp .env.example .env
# Edit .env with minimal required values

# 2. Deploy contracts only
npx hardhat compile
npx hardhat run scripts/deploy.js --network sepolia

# 3. Start basic frontend
cd ../Plant-Disease-Detection-main/Flask\ Deployed\ App
python3 app.py

# 4. Demo with existing AI (no blockchain integration)
# Show judges the AI works, explain blockchain integration is ready
```

## 🎯 **SUCCESS CHECKLIST**

Verify these are working:

- [ ] Project extracted (40+ files visible)
- [ ] Node.js and Python installed
- [ ] Dependencies installed successfully
- [ ] .env configured with your keys
- [ ] Smart contracts compiled
- [ ] Contracts deployed to Sepolia
- [ ] Backend running on port 5000
- [ ] Frontend running on port 5001
- [ ] MetaMask connects to Sepolia
- [ ] AI detection works
- [ ] Token rewards display
- [ ] Purchase flow functional

## 🏆 **FINAL TIPS**

1. **Keep it simple**: Focus on core functionality first
2. **Test incrementally**: Verify each step before proceeding
3. **Have backups**: Keep the original AI demo working
4. **Document issues**: Note any problems for quick fixes
5. **Stay calm**: You have a winning project, just need to deploy it!

## 🚀 **YOU'VE GOT THIS!**

Your AgroAI project is solid. These troubleshooting steps will get you through any deployment issues. 

**Focus on the goal: A working demo that shows AI + blockchain integration solving real agricultural problems for 500M+ farmers! 🌱⛓️🏆**

