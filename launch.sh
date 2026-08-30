#!/usr/bin/env bash

# ==============================================================================
# Vigil.AI Launch Script
# Starts Backend (FastAPI), Frontend (Vite), and ngrok Tunnel Simultaneously
# ==============================================================================

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Color codes
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${CYAN}====================================================${NC}"
echo -e "${CYAN}   🚀 Launching Vigil.AI Full Application Stack    ${NC}"
echo -e "${CYAN}====================================================${NC}"

# Function to clean up background processes on exit
cleanup() {
    echo ""
    echo -e "${YELLOW}[!] Shutting down all background processes (Backend & Frontend)...${NC}"
    if [ -n "$BACKEND_PID" ]; then
        kill "$BACKEND_PID" 2>/dev/null
    fi
    if [ -n "$FRONTEND_PID" ]; then
        kill "$FRONTEND_PID" 2>/dev/null
    fi
    echo -e "${GREEN}[✓] Stopped all processes. Goodbye!${NC}"
    exit 0
}

# Trap exit signals
trap cleanup EXIT INT TERM

# 1. Start FastAPI Backend
echo -e "${GREEN}[1/3] Starting FastAPI Backend on port 8000...${NC}"
cd "$PROJECT_ROOT/backend" || exit 1
python3 -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!
echo -e "      Backend PID: $BACKEND_PID"

# 2. Start Vite Frontend
echo -e "${GREEN}[2/3] Starting Vite React Frontend on port 5173...${NC}"
cd "$PROJECT_ROOT/frontend" || exit 1
npm run dev -- --host &
FRONTEND_PID=$!
echo -e "      Frontend PID: $FRONTEND_PID"

# Wait for local servers to bind
echo -e "${YELLOW}[...] Waiting for local services to initialize (3 seconds)...${NC}"
sleep 3

# 3. Start ngrok Tunnel
echo -e "${GREEN}[3/3] Launching ngrok tunnel for Frontend (Port 5173)...${NC}"
echo -e "${CYAN}Press Ctrl+C at any time to stop all services simultaneously.${NC}"
echo ""

ngrok http 5173 --host-header=rewrite
