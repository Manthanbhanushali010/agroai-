#!/bin/bash

# AgroAI Complete Testing & Validation Suite
# Comprehensive testing for hackathon-winning deployment

set -e

# Colors and emojis
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'
CHECK="✅"
CROSS="❌"
ROCKET="🚀"
TEST="🧪"

print_test() {
    echo -e "${BLUE}${TEST} $1${NC}"
}

print_pass() {
    echo -e "${GREEN}${CHECK} $1${NC}"
}

print_fail() {
    echo -e "${RED}${CROSS} $1${NC}"
}

echo -e "${YELLOW}${ROCKET} AgroAI Complete Testing Suite ${ROCKET}${NC}"
echo "Testing all components for hackathon readiness..."
echo ""

# Test 1: Environment Variables
print_test "Testing environment configuration..."
if [ -f ".env" ]; then
    if grep -q "PRIVATE_KEY=" .env && grep -q "SEPOLIA_RPC_URL=" .env; then
        print_pass "Environment file configured"
    else
        print_fail "Environment file missing required variables"
        echo "Please configure PRIVATE_KEY and SEPOLIA_RPC_URL in .env"
    fi
else
    print_fail "No .env file found"
    echo "Copy .env.example to .env and configure"
fi

# Test 2: Node.js Dependencies
print_test "Testing Node.js dependencies..."
if npm list --depth=0 > /dev/null 2>&1; then
    print_pass "Node.js dependencies installed"
else
    print_fail "Node.js dependencies missing"
    echo "Run: npm install"
fi

# Test 3: Python Dependencies
print_test "Testing Python dependencies..."
cd enhanced-backend 2>/dev/null || mkdir -p enhanced-backend
if python3 -c "import flask, web3, torch" 2>/dev/null; then
    print_pass "Python dependencies available"
else
    print_fail "Python dependencies missing"
    echo "Run: pip install -r enhanced-backend/requirements.txt"
fi
cd ..

# Test 4: Smart Contract Compilation
print_test "Testing smart contract compilation..."
if npx hardhat compile > /dev/null 2>&1; then
    print_pass "Smart contracts compile successfully"
else
    print_fail "Smart contract compilation failed"
    echo "Check contracts for syntax errors"
fi

# Test 5: Contract Tests
print_test "Running smart contract tests..."
if npx hardhat test > /dev/null 2>&1; then
    print_pass "All contract tests pass"
else
    print_fail "Contract tests failed"
    echo "Run: npx hardhat test for details"
fi

# Test 6: Backend Health Check
print_test "Testing backend health..."
if python3 -c "
import sys
sys.path.append('enhanced-backend')
try:
    from app import app
    print('Backend imports successfully')
except ImportError as e:
    print(f'Backend import failed: {e}')
    sys.exit(1)
" 2>/dev/null; then
    print_pass "Backend health check passed"
else
    print_fail "Backend health check failed"
fi

# Test 7: Frontend Files
print_test "Testing frontend files..."
if [ -f "frontend/static/js/web3.js" ]; then
    print_pass "Frontend Web3 integration found"
else
    print_fail "Frontend Web3 integration missing"
fi

# Test 8: IPFS Configuration
print_test "Testing IPFS configuration..."
if grep -q "IPFS_PROJECT_ID" .env 2>/dev/null; then
    print_pass "IPFS configuration found"
else
    print_fail "IPFS configuration missing"
    echo "Add IPFS_PROJECT_ID and IPFS_PROJECT_SECRET to .env"
fi

# Test 9: Chainlink Configuration
print_test "Testing Chainlink configuration..."
if grep -q "CHAINLINK_SUBSCRIPTION_ID" .env 2>/dev/null; then
    print_pass "Chainlink configuration found"
else
    print_fail "Chainlink configuration missing"
    echo "Add CHAINLINK_SUBSCRIPTION_ID to .env"
fi

# Test 10: Demo Materials
print_test "Testing demo materials..."
if [ -f "demo/DEMO_SCRIPT.md" ]; then
    print_pass "Demo script ready"
else
    print_fail "Demo script missing"
fi

# Test 11: Documentation
print_test "Testing documentation..."
if [ -f "README.md" ] && [ -f "docs/SETUP.md" ]; then
    print_pass "Documentation complete"
else
    print_fail "Documentation incomplete"
fi

# Test 12: Gas Estimation
print_test "Testing gas estimation..."
if npx hardhat run scripts/estimate-gas.js --network hardhat > /dev/null 2>&1; then
    print_pass "Gas estimation successful"
else
    print_fail "Gas estimation failed"
fi

echo ""
echo -e "${YELLOW}${ROCKET} Testing Complete ${ROCKET}${NC}"
echo ""

# Summary
TOTAL_TESTS=12
PASSED_TESTS=$(grep -c "✅" <<< "$(cat)")
FAILED_TESTS=$((TOTAL_TESTS - PASSED_TESTS))

if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "${GREEN}🎉 ALL TESTS PASSED! Ready for hackathon victory! 🏆${NC}"
    echo -e "${GREEN}Your AgroAI platform is production-ready!${NC}"
else
    echo -e "${YELLOW}⚠️  $FAILED_TESTS tests failed. Please fix issues above.${NC}"
    echo -e "${YELLOW}Run this script again after fixes.${NC}"
fi

echo ""
echo -e "${BLUE}Next steps:${NC}"
echo -e "${BLUE}1. Fix any failed tests above${NC}"
echo -e "${BLUE}2. Run deployment: ./ultimate_deployment_script.sh${NC}"
echo -e "${BLUE}3. Test complete user flow${NC}"
echo -e "${BLUE}4. Prepare winning demo presentation${NC}"

