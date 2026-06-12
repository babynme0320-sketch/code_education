#!/bin/bash
set -e

BASE="$(cd "$(dirname "$0")" && pwd)"
BACKEND="$BASE/backend"
FRONTEND="$BASE/frontend"

echo "================================================"
echo "  코딩 입문서 서버 시작"
echo "================================================"

# 백엔드 의존성 설치 및 실행
echo "[1/2] 백엔드 시작 중..."
cd "$BACKEND"
python3 -m pip install -r requirements.txt -q
python3 -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!


# 프런트엔드 의존성 설치 및 실행
echo "[2/2] 프런트엔드 시작 중..."
cd "$FRONTEND"
npm install --silent
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ 서버가 시작됐습니다!"
echo "   → 브라우저에서 열기: http://localhost:5173"
echo "   → API 서버:           http://localhost:8000"
echo ""
echo "종료하려면 Ctrl+C 를 누르세요."

# Ctrl+C 시 두 프로세스 모두 종료
cleanup() {
  echo ""
  echo "서버를 종료합니다..."
  kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
  exit 0
}
trap cleanup INT TERM

wait
