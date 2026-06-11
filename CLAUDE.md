# 코딩 입문서 프로젝트

코딩 무경험 직장인을 위한 인터랙티브 코딩 입문 웹앱.
Claude Code 사용법(60%)과 Python 기초(40%)를 8챕터로 구성.

## 기술 스택

- **백엔드**: FastAPI (Python 3.11), 포트 8000
- **프런트엔드**: React 18 + Vite 5, 포트 5173
- **Python 실행**: Pyodide v0.26.2 (브라우저 WebAssembly, CDN 동적 로드)
- **배포**: Vercel (프런트) + Render.com (백엔드, 무료)

## 프로젝트 구조

```
code_education/
├── backend/
│   ├── main.py              # FastAPI 앱, CORS, /api/health|chapters|chapters/{id}
│   ├── content/
│   │   └── chapters.json    # 8챕터 콘텐츠 (섹션 타입: text/highlight/code/conversation/screenshot)
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── App.jsx          # 메인 레이아웃, 상태관리, localStorage
│   │   ├── App.css          # 전체 스타일
│   │   └── components/
│   │       ├── Sidebar.jsx      # 챕터 목록, 완료 체크
│   │       ├── ChapterView.jsx  # 섹션 렌더링 (switch/case)
│   │       ├── CodeBlock.jsx    # Pyodide 실행, 복사 버튼
│   │       └── ProgressBar.jsx  # 진도 표시
│   ├── vercel.json          # /api/* → Render 백엔드 rewrite
│   └── vite.config.js       # dev: /api proxy → localhost:8000
├── render.yaml              # Render.com 배포 설정
├── docker-compose.yml       # 로컬 Docker 실행
└── start.sh                 # 로컬 개발 시작 스크립트
```

## 핵심 결정사항

- `chapters.json`의 conversation 메시지는 `content` 키 사용 (`text` 아님)
- conversation role: `user` / `assistant` → CSS 클래스: `user` / `ai`
- `executable: true` 플래그가 있는 code 섹션만 실행 버튼 표시 (input() 포함 코드 제외)
- Pyodide는 싱글턴 패턴 (`pyodideInstance`), CDN에서 첫 실행 시 1회 로드
- 챕터 완료 상태: localStorage `coding-edu-completed` 키에 JSON 배열로 저장
- CORS: `ALLOWED_ORIGINS` 환경변수로 제어 (콤마 구분), 기본값 `http://localhost:5173`

## 배포 정보

| 서비스 | URL | 플랫폼 |
|--------|-----|--------|
| 프런트엔드 | https://code-education.vercel.app | Vercel (무료) |
| 백엔드 | https://coding-edu-backend-5r66.onrender.com | Render.com (무료, 15분 미사용 시 슬립) |
| GitHub | https://github.com/babynme0320-sketch/code_education | main 브랜치 자동 배포 |

## 로컬 개발

```bash
bash start.sh
# 백엔드: http://localhost:8000
# 프런트엔드: http://localhost:5173
```

## chapters.json 섹션 타입

```jsonc
{ "type": "text",         "content": "마크다운 텍스트" }
{ "type": "highlight",    "content": "강조 텍스트" }
{ "type": "code",         "language": "python", "label": "예제", "content": "...", "executable": true }
{ "type": "conversation", "messages": [{"role": "user"|"assistant", "content": "..."}] }
{ "type": "screenshot",   "label": "화면 설명", "content": "ASCII 또는 텍스트" }
```

## 확장 예정 기능

- Python 샌드박스 (자유 실습 공간)
- 업무 자동화 템플릿 라이브러리
- 챕터별 퀴즈 시스템
