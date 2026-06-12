# 코딩 입문서 프로젝트

코딩 무경험 직장인을 위한 인터랙티브 코딩 입문 웹앱.
5파트 30챕터, Pyodide 브라우저 Python 실행, 퀴즈/샌드박스/템플릿/미니프로젝트 포함.

## 기술 스택

- **백엔드**: FastAPI (Python 3.11), 포트 8000
- **프런트엔드**: React 18 + Vite 5, 포트 5173
- **Python 실행**: Pyodide v0.26.2 (브라우저 WebAssembly, CDN 동적 로드)
- **배포**: Vercel (프런트) + Render.com (백엔드, 무료)

## 핵심 결정사항

- `chapters.json`: 30챕터, 5파트 구조, `part` + `isMiniProject` 필드
- Pyodide 싱글턴: `frontend/src/utils/pyodide.js` (getPyodide export)
- 라우트: `/`(메인), `/sandbox`(샌드박스), `/templates`(템플릿)
- localStorage: `coding-edu-completed`(진도), `sandbox-code`(샌드박스), `mini-project-{id}`(미니프로젝트)
- conversation 메시지는 `content` 키 사용, role: `user`/`assistant`
- `executable: true` 플래그가 있는 code 섹션만 실행 버튼 표시
- CORS: `ALLOWED_ORIGINS` 환경변수 (콤마 구분), 기본값 `http://localhost:5173`
- 외부 API 완전 금지 (Claude API 포함), Pyodide로만 Python 실행

## 배포 정보

| 서비스 | URL | 플랫폼 |
|--------|-----|--------|
| 프런트엔드 | https://code-education.vercel.app | Vercel (무료) |
| 백엔드 | https://coding-edu-backend-5r66.onrender.com | Render.com (무료, 15분 슬립) |
| GitHub | https://github.com/babynme0320-sketch/code_education | main 브랜치 자동 배포 |

## 로컬 개발

```bash
bash start.sh
# 백엔드: http://localhost:8000
# 프런트엔드: http://localhost:5173
```

---

## 하네스: 코딩 교육 앱

**목표:** 챕터 콘텐츠 작성·기능 개발·배포 검증을 에이전트 팀으로 조율

**트리거:** 챕터 추가/수정, 기능 개발, 배포 확인 등 앱 관련 작업 시 `edu-orchestrator` 스킬을 사용하라. 단순 질문은 직접 응답 가능.

**변경 이력:**
| 날짜 | 변경 내용 | 대상 | 사유 |
|------|----------|------|------|
| 2026-06-11 | 초기 구성 (30챕터, 4기능 구현) | 전체 | 8챕터→30챕터 전면 재구성 |
| 2026-06-12 | 하네스 구성 | 에이전트 4개 + 스킬 3개 | 지속적 개발 지원 |
| 2026-06-12 | 챕터 19-30 데이터 계약 정상화 + 백엔드 validate_chapters_structure() 추가 | chapters.json, backend/main.py | conversation.messages[]/quiz.questions[] 계약 깨짐 수정 |
| 2026-06-12 | start.sh uvicorn 실행 복구 | start.sh | uvicorn command not found → python3 -m uvicorn |
| 2026-06-12 | Pyodide 상태 격리 (네임스페이스 + ns.destroy()) | CodeBlock, Quiz, Sandbox, Templates | 전역 상태 공유로 출력 혼입 방지 |
| 2026-06-12 | fetch race 방지 (AbortController) + 챕터 위치 보존 (localStorage) | App.jsx | currentId 빠른 전환 시 이전 fetch 응답 덮어쓰기 방지, 새로고침 시 마지막 챕터 복원 |
| 2026-06-12 | Vercel 백엔드 URL 하드코딩 제거 → VITE_BACKEND_URL env var | vercel.json, App.jsx, .env.example | vercel.json에 onrender URL 하드코딩 제거 |
| 2026-06-12 | .dockerignore 추가 | backend/.dockerignore, frontend/.dockerignore | 불필요한 파일 Docker 이미지 제외 |
| 2026-06-12 | 하네스 drift 동기화 | feature-dev, chapter-authoring, backend-dev | 오늘 코드 변경 반영 |
