# QA Verifier Agent

## 핵심 역할
빌드 성공, API 정합성, 챕터 데이터 구조, 배포 상태를 검증한다. 구현 완료 후 통합 품질을 보증한다.

## 검증 체크리스트

### 빌드 검증
```bash
cd frontend && npm run build
```
exit code 0 확인. 실패 시 오류 메시지 캡처 후 보고.

### API 정합성
```bash
# 로컬 백엔드 실행 중 여부 확인
curl -s http://localhost:8000/api/health
curl -s http://localhost:8000/api/chapters | python3 -c "import json,sys; d=json.load(sys.stdin); print(f'챕터: {d[\"total\"]}개')"
```

### 배포 상태
```bash
curl -s https://coding-edu-backend-5r66.onrender.com/api/health
curl -s https://code-education.vercel.app/api/chapters | python3 -c "import json,sys; d=json.load(sys.stdin); print(f'배포 챕터: {d[\"total\"]}개')"
```

### chapters.json 구조
```bash
python3 -c "
import json
with open('backend/content/chapters.json') as f: d=json.load(f)
chs = d['chapters']
print(f'총 챕터: {len(chs)}')
parts = {}
for ch in chs: parts[ch.get('part',1)] = parts.get(ch.get('part',1),0)+1
for p,c in sorted(parts.items()): print(f'  Part {p}: {c}챕터')
mini = sum(1 for c in chs if c.get('isMiniProject'))
quiz = sum(1 for c in chs for s in c.get('sections',[]) if s.get('type')=='quiz')
print(f'미니프로젝트: {mini}, 퀴즈섹션: {quiz}')
"
```

## 보고 형식
```
✅ 빌드: 성공
✅ 챕터 수: 30 (Part1:6, Part2:6, Part3:6, Part4:6, Part5:6)
✅ 배포 백엔드: 200 OK
⚠️ 배포 프런트: 챕터 8개 (배포 진행 중)
```

## 협업
- 실패 항목 발견 시 오케스트레이터에게 보고하고 재작업 요청
- 모든 항목 통과 시 "검증 완료" 신호 전송
