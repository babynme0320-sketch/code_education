---
name: chapter-authoring
description: 코딩 입문서 챕터 콘텐츠를 작성하거나 수정할 때 사용. 챕터 추가, 섹션 편집, 퀴즈 작성, 미니프로젝트 가이드 생성 등 chapters.json 콘텐츠 작업 시 반드시 이 스킬을 사용할 것. 키워드: 챕터 작성, 챕터 추가, 섹션, 퀴즈, 미니프로젝트, 콘텐츠
---

## 대상 독자

코딩 완전 무경험 직장인, 업무자동화 희망. 친근하고 쉬운 한국어, 추상적 설명 금지.

## 챕터 JSON 구조

```json
{
  "id": 1,
  "title": "챕터 제목",
  "emoji": "🎯",
  "summary": "한 줄 요약 (30자 이내)",
  "part": 1,
  "isMiniProject": false,
  "sections": [...]
}
```

**isMiniProject**: 파트 마지막 챕터(6,12,18,24,30)는 `true`, 나머지는 `false`

## 섹션 타입

| type | 용도 | 필수 필드 |
|------|------|---------|
| `text` | 마크다운 설명 | `content` |
| `highlight` | 핵심 포인트 박스 | `content` |
| `code` | Python 코드 블록 | `code`, `executable` |
| `conversation` | Claude Code 대화 예시 | `messages[]` (role/content) |
| `screenshot` | ASCII 스크린샷 | `description`, `ascii` |
| `mini-step` | 미니프로젝트 단계 | `stepNumber`, `title`, `instructions`, `promptExample`, `expected` |
| `quiz` | 챕터 마지막 퀴즈 | `questions[]` |

### code 섹션 executable 조건

- `executable: true`: 기본 Python만 (list/dict/str/math/print). 파일 I/O, requests, os, subprocess는 `false`.

### conversation 섹션 형식

```json
{
  "type": "conversation",
  "messages": [
    {"role": "user", "content": "프롬프트 예시"},
    {"role": "assistant", "content": "Claude Code 응답 예시"}
  ]
}
```

## 퀴즈 형식 (챕터 마지막 필수)

```json
{
  "type": "quiz",
  "questions": [
    {
      "type": "choice",
      "question": "질문 텍스트",
      "options": ["A", "B", "C", "D"],
      "answer": 0
    },
    {
      "type": "code-completion",
      "question": "빈칸을 채우세요",
      "code": "print(___)",
      "expectedOutput": "hello"
    },
    {
      "type": "error-fix",
      "question": "오류를 찾으세요",
      "code": "prnt('hi')",
      "hint": "함수명을 확인하세요"
    },
    {
      "type": "keyword",
      "question": "설명에 맞는 단어는?",
      "keywords": ["변수", "저장"]
    }
  ]
}
```

## 분량 기준

- 챕터당 12~18개 섹션 (40~60분 읽기)
- 미니프로젝트 챕터: 4~6개 `mini-step` 섹션 포함
- 퀴즈: 챕터당 3~5문제, 타입 다양하게 혼합

## JSON 이스케이프 규칙

- 문자열 내 따옴표: `\"`
- 줄바꿈: `\n`
- 백슬래시: `\\`

## 저장 후 검증

```bash
python3 -c "import json; json.load(open('backend/content/chapters.json')); print('OK')"
```

## 참고

- 파트 구성: 1부(기초), 2부(Python심화), 3부(Claude Code고급), 4부(웹서비스), 5부(자동화+캡스톤)
- 챕터 추가 후 백엔드 시작 시 `validate_chapters_structure()`가 자동 검증하므로, 저장 후 `python3 backend/main.py` 실행으로 조기 오류 확인 가능
