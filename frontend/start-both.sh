#!/bin/bash

# Start FastAPI backend
echo "Starting FastAPI backend..."
cd ../backend || { echo "Failed to navigate to backend"; exit 1; }
export ENVIRONMENT=development
fastapi dev main.py > backend.log 2>&1 &
BACKEND_PID=$!
if [ $BACKEND_PID -eq 0 ]; then
  echo "Failed to start FastAPI backend" >&2
  cat backend.log
  exit 1
fi
cd - || exit 1
echo "FastAPI backend started with PID $BACKEND_PID"

# Start React frontend directly
echo "Starting React frontend..."
npx react-scripts start > frontend.log 2>&1 &
FRONTEND_PID=$!
if [ $FRONTEND_PID -eq 0 ]; then
  echo "Failed to start React frontend" >&2
  cat frontend.log
  kill $BACKEND_PID
  exit 1
fi
echo "React frontend started with PID $FRONTEND_PID"

# Store PIDs for cleanup
echo "Backend PID: $BACKEND_PID, Frontend PID: $FRONTEND_PID" > pids.txt

# Trap Ctrl+C to kill both processes
trap 'kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; rm -f pids.txt; exit' INT

# Wait for any process to exit
wait $BACKEND_PID