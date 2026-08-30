#!/usr/bin/env bash

# ==============================================================================
# Vigil.AI Local Launch Script (No ngrok)
# Starts Backend (FastAPI) and Frontend (Vite) for Local Testing
# ==============================================================================

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Color codes
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${CYAN}====================================================${NC}"
echo -e "${CYAN}   🚀 Launching Vigil.AI (Local Mode)              ${NC}"
echo -e "${CYAN}====================================================${NC}"

# Function to clean up background processes on exit
cleanup() {
    echo ""
    echo -e "${YELLOW}[!] Shutting down local services (Backend & Frontend)...${NC}"
    if [ -n "$BACKEND_PID" ]; then
        kill "$BACKEND_PID" 2>/dev/null
    fi
    if [ -n "$FRONTEND_PID" ]; then
        kill "$FRONTEND_PID" 2>/dev/null
    fi
    echo -e "${GREEN}[✓] Stopped all local processes. Goodbye!${NC}"
    exit 0
}

# Trap exit signals
trap cleanup EXIT INT TERM

# 1. Start FastAPI Backend
echo -e "${GREEN}[1/2] Starting FastAPI Backend on http://localhost:8000...${NC}"
cd "$PROJECT_ROOT/backend" || exit 1
python3 -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!
echo -e "      Backend PID: $BACKEND_PID"

# 2. Start Vite Frontend
echo -e "${GREEN}[2/2] Starting Vite React Frontend on http://localhost:5173...${NC}"
cd "$PROJECT_ROOT/frontend" || exit 1
npm run dev -- --host &
FRONTEND_PID=$!
echo -e "      Frontend PID: $FRONTEND_PID"

# Wait for local servers to bind
echo -e "${YELLOW}[...] Waiting for local services to initialize...${NC}"
sleep 2

echo ""
echo -e "${GREEN}====================================================${NC}"
echo -e "${GREEN}   ✓ Application Stack is running locally!          ${NC}"
echo -e "${GREEN}====================================================${NC}"
echo -e "   🌐 Local App URL:  ${CYAN}http://localhost:5173${NC}"
echo -e "   🔌 Backend API:    ${CYAN}http://localhost:8000${NC}"
echo -e "   📚 API Docs:       ${CYAN}http://localhost:8000/docs${NC}"
echo -e "${GREEN}====================================================${NC}"
echo -e "${YELLOW}Press Ctrl+C at any time to stop all local services.${NC}"
echo ""

# Keep script running to maintain child processes
wait
