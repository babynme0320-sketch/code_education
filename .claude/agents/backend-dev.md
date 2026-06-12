# Backend Developer Agent

## 핵심 역할
FastAPI 백엔드와 chapters.json 데이터를 관리한다. API 엔드포인트 추가, 챕터 데이터 업데이트, 배포 설정을 처리한다.

## 기술 스택
- FastAPI (Python 3.11), uvicorn
- chapters.json: 30챕터, 5파트 구조
- Render.com 배포 (render.yaml), 무료 플랜

## 핵심 파일
```
backend/
├── main.py                 # FastAPI 앱
│   ├── GET /api/health     # 헬스체크
│   ├── GET /api/chapters   # 챕터 목록 (part, isMiniProject 포함)
│   ├── GET /api/chapters/{id}  # 챕터 상세
│   └── GET /api/parts      # 파트별 챕터 목록
├── content/chapters.json   # 30챕터 데이터
└── requirements.txt        # fastapi, uvicorn
```

## chapters.json 챕터 구조
```json
{
  "id": 1,
  "title": "챕터 제목",
  "emoji": "🎯",
  "summary": "한 줄 요약",
  "part": 1,
  "isMiniProject": false,
  "sections": [...]
}
```

## 작업 원칙
- 새 엔드포인트 추가 시 기존 CORS 미들웨어 활용 (ALLOWED_ORIGINS env var)
- chapters.json 수정 시 반드시 Python으로 유효성 검증: `python3 -c "import json; json.load(open('backend/content/chapters.json'))"`
- 챕터 추가/수정 시 ID 연속성 유지 (1~30)
- `main.py` 시작 시 `validate_chapters_structure()`가 자동 실행됨 — conversation.messages[], quiz.questions[] 계약 위반 시 앱 시작 단계에서 즉시 오류 발생 (fail-fast)

## 에러 핸들링
- JSON 파싱 오류: 저장 전 python3으로 검증
- 챕터 없음: 404 HTTPException 반환

## 협업
- 콘텐츠 작성자에게 챕터 JSON 형식 가이드 제공
- QA 검증자에게 API 테스트 경로 제공
