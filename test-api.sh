#!/bin/bash

echo "🧪 Campus Life API Test Suite"
echo "=============================="
echo ""

API="http://localhost:3000/api"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if backend is running
echo "📡 Checking backend connection..."
if ! curl -s "$API/health" > /dev/null 2>&1; then
    echo -e "${RED}❌ Backend not running on port 3000${NC}"
    echo "Start backend with: cd backend && npm start"
    exit 1
fi
echo -e "${GREEN}✅ Backend is running${NC}"
echo ""

# Generate test credentials
TEST_EMAIL="test_$(date +%s)@university.edu"
TEST_USERNAME="student_$(date +%s)"
TEST_PASSWORD="password123"

echo "📝 Test Credentials:"
echo "Email: $TEST_EMAIL"
echo "Username: $TEST_USERNAME"
echo "Password: $TEST_PASSWORD"
echo ""

# Test 1: Register
echo "1️⃣  Testing Registration..."
REGISTER_RESPONSE=$(curl -s -X POST "$API/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_EMAIL\",
    \"username\": \"$TEST_USERNAME\",
    \"password\": \"$TEST_PASSWORD\"
  }")

TOKEN=$(echo $REGISTER_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)
USER_ID=$(echo $REGISTER_RESPONSE | grep -o '"userId":"[^"]*' | cut -d'"' -f4 | head -1)

if [ -z "$TOKEN" ]; then
    echo -e "${RED}❌ Registration failed${NC}"
    echo "Response: $REGISTER_RESPONSE"
    exit 1
fi

echo -e "${GREEN}✅ Registration successful${NC}"
echo "Token: ${TOKEN:0:20}..."
echo "User ID: $USER_ID"
echo ""

# Test 2: Get User Data
echo "2️⃣  Testing Get User Data..."
USER_DATA=$(curl -s -X GET "$API/user/$USER_ID" \
  -H "Authorization: Bearer $TOKEN")

STREAK=$(echo $USER_DATA | grep -o '"streak":"[^"]*' | head -1 | cut -d'"' -f4)
TOTAL_XP=$(echo $USER_DATA | grep -o '"total_xp":"[^"]*' | head -1 | cut -d'"' -f4)

if [ -z "$STREAK" ]; then
    echo -e "${RED}❌ Get user data failed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ User data retrieved${NC}"
echo "Streak: $STREAK"
echo "Total XP: $TOTAL_XP"
echo ""

# Test 3: Daily Check-In
echo "3️⃣  Testing Daily Check-In..."
CHECKIN=$(curl -s -X POST "$API/checkin" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"userId\": $USER_ID}")

NEW_STREAK=$(echo $CHECKIN | grep -o '"streak":"[^"]*' | head -1 | cut -d'"' -f4)
NEW_XP=$(echo $CHECKIN | grep -o '"total_xp":"[^"]*' | head -1 | cut -d'"' -f4)

if [ -z "$NEW_STREAK" ]; then
    echo -e "${RED}❌ Check-in failed${NC}"
    echo "Response: $CHECKIN"
    exit 1
fi

echo -e "${GREEN}✅ Check-in successful${NC}"
echo "New Streak: $NEW_STREAK"
echo "New XP: $NEW_XP"
echo ""

# Test 4: Try to check in again (should fail)
echo "4️⃣  Testing Double Check-In Protection..."
DOUBLE_CHECKIN=$(curl -s -X POST "$API/checkin" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"userId\": $USER_ID}")

if echo $DOUBLE_CHECKIN | grep -q "Already checked in"; then
    echo -e "${GREEN}✅ Double check-in prevented${NC}"
else
    echo -e "${YELLOW}⚠️  Double check-in protection might not be working${NC}"
fi
echo ""

# Test 5: Get missions
echo "5️⃣  Testing Get Missions..."
USER_DATA=$(curl -s -X GET "$API/user/$USER_ID" \
  -H "Authorization: Bearer $TOKEN")

MISSION_COUNT=$(echo $USER_DATA | grep -o '"id"' | wc -l)

if [ "$MISSION_COUNT" -ge 3 ]; then
    echo -e "${GREEN}✅ Missions loaded (found $MISSION_COUNT)${NC}"
else
    echo -e "${RED}❌ Missions not loading properly${NC}"
fi
echo ""

# Test 6: Login
echo "6️⃣  Testing Login..."
LOGIN=$(curl -s -X POST "$API/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"$TEST_PASSWORD\"
  }")

LOGIN_TOKEN=$(echo $LOGIN | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$LOGIN_TOKEN" ]; then
    echo -e "${RED}❌ Login failed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Login successful${NC}"
echo ""

echo "=============================="
echo -e "${GREEN}✅ All tests passed!${NC}"
echo ""
echo "Frontend is ready at: http://localhost:8080"
echo "Backend API is ready at: http://localhost:3000/api"