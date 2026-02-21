#!/bin/bash

echo "🎓 Starting Campus Life MVP..."
echo ""

# Start backend
echo "📦 Starting backend server on port 3000..."
cd /workspace/backend
npm start &
BACKEND_PID=$!

# Wait for backend to start
sleep 2

# Start frontend
echo "🎨 Starting frontend dev server on port 8080..."
cd /workspace
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ Campus Life is running!"
echo ""
echo "Frontend: http://localhost:8080"
echo "Backend API: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Keep script running
wait