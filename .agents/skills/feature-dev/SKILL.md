---
name: feature-dev
description: 코딩 교육 앱에 새 기능을 추가하거나 기존 기능을 수정할 때 사용. React 컴포넌트 추가, FastAPI 엔드포인트 추가, Pyodide 통합, 라우트 추가 등 풀스택 기능 개발 시 반드시 이 스킬을 사용할 것. 키워드: 기능 추가, 컴포넌트, 페이지, 라우트, API, 엔드포인트, 구현
---

## 기술 스택

- **Frontend**: React 18 + Vite 5, react-router-dom, Pyodide v0.26.2 CDN
- **Backend**: FastAPI (Python 3.11), uvicorn, chapters.json 파일 기반
- **배포**: Vercel(frontend) + Render.com(backend), GitHub main 브랜치 자동 배포

## 핵심 파일 경로

```
frontend/src/
├── App.jsx              # BrowserRouter + Routes
├── App.css              # 전체 스타일 (클래스 추가 방식)
├── utils/pyodide.js     # Pyodide 싱글턴 (getPyodide export)
├── components/
│   ├── Sidebar.jsx      # 파트 그룹핑 + 기능 링크
│   ├── ChapterView.jsx  # 섹션 렌더링
│   ├── CodeBlock.jsx    # Pyodide 실행 블록
│   ├── Quiz.jsx         # 4종 퀴즈
│   └── MiniProjectGuide.jsx
└── pages/
    ├── Sandbox.jsx      # /sandbox
    └── Templates.jsx    # /templates

backend/
├── main.py              # FastAPI 앱
└── content/chapters.json
```

## 개발 원칙

1. **Pyodide**: 항상 `../utils/pyodide.js`에서 import. 중복 선언 금지.
2. **CSS**: `App.css`에 클래스 추가. 인라인 스타일 최소화.
3. **라우트 추가 시**: `App.jsx` Routes에 `<Route>` 추가 + Sidebar에 링크 추가.
4. **API 추가 시**: 기존 CORS 미들웨어 그대로 활용. `ALLOWED_ORIGINS` env var.
5. **외부 API 금지**: Codex API 포함 모든 외부 API 사용 금지.
6. **로컬 스토리지 키**: `coding-edu-completed`(진도), `coding-edu-current-chapter`(마지막 읽던 챕터 ID), `sandbox-code`(샌드박스), `mini-project-{id}`(미니프로젝트)
7. **백엔드 URL**: 로컬 개발은 Vite proxy(`/api/*` → `localhost:8000`). 프로덕션(Vercel)은 `VITE_BACKEND_URL` 환경변수로 주입 (`import.meta.env.VITE_BACKEND_URL ?? ''`). vercel.json에 API rewrite 없음.

## 빌드 검증 (기능 추가 후 필수)

```bash
cd frontend && npm run build
```

exit code 0 확인. 오류 시 수정 후 재빌드.

## 새 페이지 추가 패턴

```jsx
// 1. pages/NewPage.jsx 생성
import { Link } from 'react-router-dom'
export default function NewPage() { ... }

// 2. App.jsx Routes에 추가
import NewPage from './pages/NewPage'
<Route path="/new-page" element={<NewPage />} />

// 3. Sidebar.jsx 기능 링크 섹션에 추가
<Link to="/new-page" className="feature-link">📌 새 페이지</Link>
```

## 새 API 엔드포인트 패턴

```python
@app.get("/api/new-endpoint")
def new_endpoint():
    data = load_chapters()
    # 처리 로직
    return {"result": ...}
```

## 에러 핸들링

- Pyodide 로드 실패: try/catch로 에러 메시지 표시
- API 응답 실패: loading/error 상태 처리 (useState)
- 챕터 없음: 백엔드 404 HTTPException 반환
