---
name: edu-orchestrator
description: 코딩 교육 앱 전반적인 작업을 조율하는 오케스트레이터. 챕터 추가/수정, 기능 개발, 배포 확인 등 복합 작업 요청 시 이 스킬을 사용. 키워드: 앱 개발, 교육 앱, 챕터, 기능, 배포, 업데이트, 수정, 재실행, 다시
---

**실행 모드: 서브 에이전트** — 각 에이전트는 독립 작업 후 결과를 오케스트레이터에 반환. 병렬 실행 가능한 작업은 `run_in_background: true`로 실행.

## 팀 구성

| 에이전트 | 역할 | 파일 |
|---------|------|------|
| content-writer | chapters.json 콘텐츠 작성 | `.claude/agents/content-writer.md` |
| frontend-dev | React 컴포넌트/페이지 구현 | `.claude/agents/frontend-dev.md` |
| backend-dev | FastAPI 엔드포인트/데이터 관리 | `.claude/agents/backend-dev.md` |
| qa-verifier | 빌드/API/배포 검증 | `.claude/agents/qa-verifier.md` |

## Phase 0: 컨텍스트 확인

기존 산출물 및 요청 유형 파악:

1. `backend/content/chapters.json` 읽어 챕터 수/파트 구성 확인
2. 요청 분류:
   - **콘텐츠 작업** (챕터 추가/수정) → content-writer + backend-dev + qa-verifier
   - **기능 개발** (컴포넌트/페이지/API) → frontend-dev + backend-dev + qa-verifier
   - **배포 확인** → qa-verifier만
   - **복합 작업** → 전체 팀

## Phase 1: 작업 할당

### 콘텐츠 작업 패턴
```
1. content-writer: 챕터 JSON 초안 작성 (chapter-authoring 스킬 사용)
2. backend-dev: chapters.json에 추가 + Python 검증
3. qa-verifier: 챕터 수/구조 확인
```

### 기능 개발 패턴
```
1. backend-dev: 필요한 API 엔드포인트 추가 (있을 경우)
2. frontend-dev: React 컴포넌트/페이지 구현 (feature-dev 스킬 사용)
3. qa-verifier: 빌드 검증 (npm run build)
```

### 전체 팀 패턴 (병렬 가능한 경우 병렬 실행)
```
병렬:
  content-writer → chapters.json 콘텐츠
  frontend-dev → UI 컴포넌트
  backend-dev → API 엔드포인트
직렬:
  qa-verifier → 통합 검증
```

## Phase 2: 검증

qa-verifier 체크리스트:
- `cd frontend && npm run build` (exit 0)
- `python3 -c "import json; json.load(open('backend/content/chapters.json')); print('OK')"`
- curl localhost:8000/api/health (로컬 실행 중인 경우)

## Phase 3: 배포

검증 통과 후:
```bash
git add -A
git commit -m "feat: <변경 내용 요약>"
git push origin main
```
Vercel/Render 자동 배포 트리거됨.

## 에러 핸들링

- 빌드 실패 → frontend-dev에 재작업 요청
- JSON 파싱 오류 → backend-dev에 재검증 요청
- 배포 후 상태 이상 → qa-verifier가 curl로 재확인

## 테스트 시나리오

**정상 흐름**: 챕터 31 추가 요청 → content-writer 초안 → backend-dev 추가 → qa-verifier 빌드/구조 확인 → git push

**에러 흐름**: npm run build 실패 → 오류 캡처 → frontend-dev 수정 → 재빌드 확인
