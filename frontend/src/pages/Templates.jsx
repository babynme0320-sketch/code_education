import { useState } from 'react'
import { Link } from 'react-router-dom'
import { getPyodide } from '../utils/pyodide.js'

const TEMPLATES = {
  excel: {
    label: '📊 엑셀/CSV',
    templates: [
      {
        title: 'CSV 데이터 요약',
        description: 'CSV 데이터를 읽어 기본 통계(합계, 평균, 최대/최소)를 출력합니다.',
        promptExample: 'CSV 파일에서 숫자 데이터를 읽어서 각 열의 합계, 평균, 최대, 최소값을 출력하는 파이썬 코드를 만들어줘',
        code: `import csv
from io import StringIO

# 예시 CSV 데이터 (실제로는 파일 경로 사용)
sample_csv = """이름,1월매출,2월매출,3월매출
김철수,1500000,1800000,2100000
이영희,2300000,1900000,2500000
박민준,1200000,1600000,1400000
최수진,1800000,2200000,2400000"""

reader = csv.DictReader(StringIO(sample_csv))
rows = list(reader)
numeric_cols = ['1월매출', '2월매출', '3월매출']

print(f"총 {len(rows)}명 데이터\\n")
for col in numeric_cols:
    values = [int(r[col]) for r in rows]
    print(f"[{col}]")
    print(f"  합계: {sum(values):,}원")
    print(f"  평균: {sum(values)//len(values):,}원")
    print(f"  최고: {max(values):,}원")
    print(f"  최저: {min(values):,}원")`,
        executable: true,
      },
      {
        title: '중복 데이터 제거',
        description: '리스트나 CSV에서 중복 항목을 제거하고 유일한 값만 출력합니다.',
        promptExample: 'CSV 파일의 특정 컬럼에서 중복 값을 제거하고 유일한 값 목록과 각 값의 등장 횟수를 출력하는 코드 만들어줘',
        code: `from collections import Counter

# 예시: 직원 부서 데이터
departments = ['영업팀', '개발팀', '영업팀', '인사팀', '개발팀',
               '마케팅팀', '영업팀', '개발팀', '인사팀', '마케팅팀']

print(f"전체 데이터 수: {len(departments)}개")
print(f"중복 제거 후: {len(set(departments))}개\\n")

counter = Counter(departments)
print("부서별 인원수:")
for dept, count in counter.most_common():
    bar = '█' * count
    print(f"  {dept:10} {bar} ({count}명)")`,
        executable: true,
      },
      {
        title: '날짜별 데이터 그룹화',
        description: '날짜 컬럼을 기준으로 데이터를 월별로 그룹화하고 집계합니다.',
        promptExample: '날짜 컬럼이 있는 CSV 파일을 월별로 그룹화해서 매출 합계를 구하는 코드 만들어줘',
        code: `from datetime import datetime
from collections import defaultdict

# 예시 매출 데이터
sales = [
    ('2024-01-05', 350000), ('2024-01-12', 480000), ('2024-01-28', 210000),
    ('2024-02-03', 520000), ('2024-02-17', 390000), ('2024-02-25', 610000),
    ('2024-03-08', 440000), ('2024-03-20', 580000), ('2024-03-31', 320000),
]

monthly = defaultdict(int)
for date_str, amount in sales:
    month = datetime.strptime(date_str, '%Y-%m-%d').strftime('%Y년 %m월')
    monthly[month] += amount

print("월별 매출 현황:")
print("-" * 30)
for month in sorted(monthly):
    bar = '█' * (monthly[month] // 100000)
    print(f"{month}: {monthly[month]:,}원")

total = sum(monthly.values())
print(f"\\n총 매출: {total:,}원")`,
        executable: true,
      },
    ],
  },
  files: {
    label: '📁 파일/폴더',
    templates: [
      {
        title: '파일 목록 확장자별 분류',
        description: '폴더의 파일들을 확장자별로 분류해서 보여줍니다.',
        promptExample: '특정 폴더 안의 파일들을 확장자별로 분류해서 각 종류의 파일 수와 용량을 출력하는 코드 만들어줘',
        code: `import os

# 예시 파일 목록 (실제로는 os.listdir() 사용)
files = [
    ('보고서_2024.xlsx', 15360),
    ('회의록_01월.docx', 8192),
    ('발표자료.pptx', 262144),
    ('데이터.csv', 32768),
    ('코드.py', 5120),
    ('사진001.jpg', 524288),
    ('사진002.jpg', 489472),
    ('README.txt', 1024),
    ('분석결과.csv', 45056),
]

ext_groups = {}
for filename, size in files:
    ext = os.path.splitext(filename)[1].lower() or '(확장자없음)'
    if ext not in ext_groups:
        ext_groups[ext] = {'count': 0, 'size': 0}
    ext_groups[ext]['count'] += 1
    ext_groups[ext]['size'] += size

print(f"{'확장자':12} {'파일수':8} {'용량':12}")
print("-" * 35)
for ext, info in sorted(ext_groups.items()):
    size_kb = info['size'] / 1024
    print(f"{ext:12} {info['count']:8}개 {size_kb:10.1f}KB")`,
        executable: true,
      },
      {
        title: '파일명 일괄 변경 미리보기',
        description: '파일명 변경 규칙을 정하고 변경 전 미리보기를 출력합니다.',
        promptExample: '폴더 안의 파일명에서 특정 단어를 다른 단어로 일괄 변경하는 코드를 만들어줘. 실제 변경 전에 미리보기를 보여줘',
        code: `import os
import re

# 예시 파일 목록
file_names = [
    '2023_1분기_보고서.xlsx',
    '2023_2분기_보고서.xlsx',
    '2023_3분기_보고서.xlsx',
    '2023_연간_요약.xlsx',
    '2023_고객현황.csv',
    '회의록_2023.docx',
]

# 변경 규칙: 연도 변경
old_text = '2023'
new_text = '2024'

print(f"'{old_text}' → '{new_text}' 변경 미리보기")
print("=" * 50)

changed_count = 0
for name in file_names:
    new_name = name.replace(old_text, new_text)
    if new_name != name:
        print(f"✏️  {name}")
        print(f"  → {new_name}")
        changed_count += 1
    else:
        print(f"   {name} (변경 없음)")

print(f"\\n총 {changed_count}개 파일 변경 예정")
print("실제 변경하려면: os.rename(old_path, new_path)")`,
        executable: true,
      },
    ],
  },
  scraping: {
    label: '🌐 웹 스크래핑',
    templates: [
      {
        title: 'JSON API 데이터 파싱',
        description: 'API에서 받은 JSON 응답을 파싱하고 원하는 필드를 추출합니다.',
        promptExample: 'JSON 형태의 API 응답에서 특정 필드를 추출하고 정리해서 출력하는 파이썬 코드 만들어줘',
        code: `import json

# API 응답 JSON 예시
api_response = '''
{
  "status": "success",
  "total": 5,
  "items": [
    {"id": 1, "name": "노트북", "price": 1200000, "stock": 15, "category": "전자기기"},
    {"id": 2, "name": "마우스", "price": 45000, "stock": 80, "category": "주변기기"},
    {"id": 3, "name": "키보드", "price": 89000, "stock": 0, "category": "주변기기"},
    {"id": 4, "name": "모니터", "price": 380000, "stock": 7, "category": "전자기기"},
    {"id": 5, "name": "웹캠", "price": 65000, "stock": 23, "category": "주변기기"}
  ]
}
'''

data = json.loads(api_response)
items = data['items']

print(f"전체 {data['total']}개 상품")
print("\\n재고 있는 상품:")
print(f"{'상품명':12} {'가격':10} {'재고':8} {'카테고리'}")
print("-" * 45)
for item in sorted(items, key=lambda x: x['price'], reverse=True):
    if item['stock'] > 0:
        status = '🔴 품절 임박' if item['stock'] < 10 else '✅ 정상'
        print(f"{item['name']:12} {item['price']:>9,}원 {item['stock']:>6}개 {status}")`,
        executable: true,
      },
      {
        title: '웹 스크래핑 패턴 (개념)',
        description: 'requests + BeautifulSoup을 사용한 기본 스크래핑 패턴입니다.',
        promptExample: 'requests와 BeautifulSoup으로 [사이트 URL]에서 [원하는 데이터]를 수집하는 코드 만들어줘. robots.txt 확인도 해줘',
        code: `# 웹 스크래핑 기본 패턴
# 실제 실행은 로컬 파이썬에서 해야 합니다 (pip install requests beautifulsoup4)

import re

# 실제 BeautifulSoup 코드 패턴 (주석)
scraping_pattern = """
import requests
from bs4 import BeautifulSoup

url = "https://example.com"
headers = {"User-Agent": "Mozilla/5.0"}

response = requests.get(url, headers=headers)
response.raise_for_status()  # 오류 확인

soup = BeautifulSoup(response.text, 'html.parser')

# 제목 찾기
titles = soup.find_all('h2', class_='article-title')
for title in titles:
    print(title.get_text(strip=True))

# CSS 선택자로 찾기
prices = soup.select('.product-price')
for price in prices:
    print(price.get_text(strip=True))
"""

# 정규식으로 간단한 패턴 연습 (브라우저에서 실행 가능)
sample_text = """
2024-01-15: 삼성전자 75,000원
2024-01-16: SK하이닉스 142,000원
2024-01-17: 카카오 48,500원
"""

# 날짜와 가격 추출
pattern = r'(\\d{4}-\\d{2}-\\d{2}): (.+?) (\\d{1,3}(?:,\\d{3})*)원'
matches = re.findall(pattern, sample_text)

print("추출된 데이터:")
for date, name, price in matches:
    print(f"  {date} | {name} | {price}원")`,
        executable: true,
      },
      {
        title: '데이터 수집 + 분석',
        description: '수집한 데이터를 분석하고 인사이트를 추출합니다.',
        promptExample: '수집한 데이터에서 평균, 상위 N개, 변화율 등을 계산해서 인사이트를 뽑아주는 코드 만들어줘',
        code: `# 수집된 주간 방문자 데이터 분석 예시
weekly_data = {
    '1주차': {'방문자': 1250, '전환율': 0.032},
    '2주차': {'방문자': 1380, '전환율': 0.028},
    '3주차': {'방문자': 1100, '전환율': 0.041},
    '4주차': {'방문자': 1680, '전환율': 0.035},
    '5주차': {'방문자': 2100, '전환율': 0.029},
    '6주차': {'방문자': 1950, '전환율': 0.038},
}

visitors = [v['방문자'] for v in weekly_data.values()]
conversions = [v['방문자'] * v['전환율'] for v in weekly_data.values()]

print("📊 6주간 방문자 분석")
print("=" * 40)
print(f"평균 방문자: {sum(visitors)/len(visitors):,.0f}명")
print(f"최고 방문자: {max(visitors):,}명")
print(f"최저 방문자: {min(visitors):,}명")
print(f"총 전환 수: {sum(conversions):,.0f}명")

prev = None
print("\\n주차별 증감:")
for week, data in weekly_data.items():
    v = data['방문자']
    if prev:
        change = (v - prev) / prev * 100
        arrow = "↑" if change > 0 else "↓"
        print(f"  {week}: {v:,}명 {arrow} {abs(change):.1f}%")
    prev = v`,
        executable: true,
      },
    ],
  },
  text: {
    label: '📝 텍스트 처리',
    templates: [
      {
        title: '날짜 형식 통일',
        description: '다양한 형식의 날짜를 YYYY-MM-DD로 통일합니다.',
        promptExample: '엑셀에서 가져온 여러 형식의 날짜 문자열을 YYYY-MM-DD로 통일하는 코드 만들어줘',
        code: `from datetime import datetime

# 실무에서 흔히 보이는 다양한 날짜 형식
dates = [
    '2024/01/15',
    '2024-02-20',
    '20240315',
    '2024.04.10',
    '2024년 5월 5일',
    '01/06/2024',
    'Jan 7, 2024',
]

def parse_date(date_str):
    formats = [
        '%Y/%m/%d', '%Y-%m-%d', '%Y%m%d',
        '%Y.%m.%d', '%m/%d/%Y', '%b %d, %Y',
    ]
    # 한국어 날짜 처리
    import re
    kor = re.match(r'(\\d{4})년 (\\d{1,2})월 (\\d{1,2})일', date_str)
    if kor:
        y, m, d = kor.groups()
        return f"{y}-{int(m):02d}-{int(d):02d}"

    for fmt in formats:
        try:
            return datetime.strptime(date_str, fmt).strftime('%Y-%m-%d')
        except ValueError:
            continue
    return f"파싱 실패: {date_str}"

print("날짜 형식 변환 결과:")
print(f"{'원본':25} → {'변환':12}")
print("-" * 42)
for d in dates:
    print(f"{d:25} → {parse_date(d)}")`,
        executable: true,
      },
      {
        title: '단어 빈도 분석',
        description: '텍스트에서 자주 등장하는 단어 Top N을 추출합니다.',
        promptExample: '텍스트 파일을 읽어 가장 많이 등장하는 단어 Top 10을 막대 그래프로 출력하는 코드 만들어줘',
        code: `from collections import Counter

report_text = """
2024년 1분기 사업 보고서

올해 1분기 매출은 전년 대비 15% 성장하였습니다.
주요 성장 동력은 디지털 전환 프로젝트와 신규 고객 확보였습니다.
디지털 전환을 통해 업무 효율성이 30% 향상되었으며,
고객 만족도 점수도 전분기 대비 향상되었습니다.

신규 고객은 총 150개사를 확보하였으며, 기존 고객의 재계약률은
95%를 기록하였습니다. 특히 제조업 분야의 디지털 전환 수요가
크게 증가하여 매출 성장을 견인하였습니다.

2분기에는 추가적인 성장을 위해 마케팅 투자를 확대하고,
신규 서비스를 출시할 예정입니다.
"""

# 단어 분리 및 정제 (조사, 접속사 제외)
stop_words = {'이', '가', '은', '는', '의', '을', '를', '에', '와', '과', '및', '이며', '하여', '위해'}
words = [w.strip('.,!?()') for w in report_text.split() if len(w) > 1]
words = [w for w in words if w not in stop_words]

counter = Counter(words)
top_10 = counter.most_common(10)

print("문서 단어 빈도 Top 10")
print("=" * 35)
for rank, (word, count) in enumerate(top_10, 1):
    bar = '█' * count
    print(f"{rank:2}위. {word:12} {bar} {count}회")`,
        executable: true,
      },
      {
        title: '이메일/전화번호 추출',
        description: '텍스트에서 이메일과 전화번호를 정규식으로 추출합니다.',
        promptExample: '고객 데이터나 문서에서 이메일 주소와 전화번호를 자동으로 추출하는 코드 만들어줘',
        code: `import re

# 다양한 연락처 정보가 섞인 텍스트
contact_text = """
거래처 연락처 목록

[A업체] 담당자: 김철수 - 010-1234-5678, kim.cs@acompany.com
[B업체] 이영희 부장: 02-345-6789 (내선 123), lee@biz.co.kr
[C업체] 박민준 과장: 070-1111-2222, park.mj@cmail.net
[D업체] 대표: 최수진 (011-9876-5432), choi@dco.com
긴급문의: help@support.org, 1588-1234
"""

email_pattern = r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}'
phone_pattern = r'\\b(?:0\\d{1,2}|1\\d{3})-\\d{3,4}-\\d{4}\\b'

emails = re.findall(email_pattern, contact_text)
phones = re.findall(phone_pattern, contact_text)

print(f"📧 이메일 {len(emails)}개 발견:")
for e in emails:
    print(f"   {e}")

print(f"\\n📞 전화번호 {len(phones)}개 발견:")
for p in phones:
    print(f"   {p}")`,
        executable: true,
      },
    ],
  },
}

function TemplateCard({ template, onRun }) {
  const [output, setOutput] = useState(null)
  const [error, setError] = useState(null)
  const [running, setRunning] = useState(false)
  const [showPrompt, setShowPrompt] = useState(false)

  const handleRun = async () => {
    setRunning(true)
    setOutput(null)
    setError(null)
    let ns = null
    try {
      const py = await getPyodide()
      const captured = []
      ns = py.runPython('dict()')
      ns.set('print', (...args) => captured.push(args.map(String).join(' ')))
      await py.runPythonAsync(template.code, { globals: ns })
      setOutput(captured.join('\n') || '(출력 없음)')
    } catch (e) {
      setError(e.message || String(e))
    } finally {
      if (ns) ns.destroy()
      setRunning(false)
    }
  }

  return (
    <div className="template-card">
      <div className="template-card-header">
        <h3>{template.title}</h3>
        <p>{template.description}</p>
      </div>
      <div className="template-code-wrap">
        <div className="code-block-header">
          <div className="code-block-left">
            <div className="code-dots">
              <div className="code-dot red" /><div className="code-dot yellow" /><div className="code-dot green" />
            </div>
            <span className="code-label">Python</span>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {template.executable && (
              <button className="run-btn" onClick={handleRun} disabled={running}>
                {running ? '⏳...' : '▶ 실행'}
              </button>
            )}
          </div>
        </div>
        <pre className="template-code">{template.code}</pre>
      </div>
      {(output || error) && (
        <div className={`code-output${error ? ' code-output-error' : ''}`}>
          <div className="code-output-label">{error ? '❌ 오류' : '✅ 실행 결과'}</div>
          <pre>{error || output}</pre>
        </div>
      )}
      <div className="template-prompt-section">
        <button className="template-prompt-toggle" onClick={() => setShowPrompt(p => !p)}>
          💬 Claude Code 요청 예시 {showPrompt ? '▲' : '▼'}
        </button>
        {showPrompt && (
          <div className="template-prompt-box">
            <p>{template.promptExample}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function Templates() {
  const [activeTab, setActiveTab] = useState('excel')

  return (
    <div className="templates-page">
      <div className="templates-header">
        <Link to="/" className="back-link">← 교재로 돌아가기</Link>
        <h1>📋 업무자동화 템플릿</h1>
        <p>자주 쓰는 자동화 코드를 바로 실행해보세요. Claude Code에 요청하는 방법도 함께 제공합니다.</p>
      </div>
      <div className="template-tabs">
        {Object.entries(TEMPLATES).map(([key, cat]) => (
          <button
            key={key}
            className={`template-tab${activeTab === key ? ' active' : ''}`}
            onClick={() => setActiveTab(key)}
          >
            {cat.label}
          </button>
        ))}
      </div>
      <div className="template-grid">
        {TEMPLATES[activeTab].templates.map((t, i) => (
          <TemplateCard key={i} template={t} />
        ))}
      </div>
    </div>
  )
}
