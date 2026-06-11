import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getPyodide } from '../utils/pyodide.js'

const SANDBOX_KEY = 'sandbox-code'

const DEFAULT_CODE = `# 여기에 파이썬 코드를 자유롭게 작성해보세요!
# 코드는 자동으로 저장됩니다.

name = "Claude Code"
print(f"안녕하세요, {name}!")

# 간단한 계산
numbers = [1, 2, 3, 4, 5]
total = sum(numbers)
average = total / len(numbers)
print(f"숫자 목록: {numbers}")
print(f"합계: {total}, 평균: {average}")

# 딕셔너리 사용
person = {"이름": "김철수", "나이": 30, "직업": "회사원"}
for key, value in person.items():
    print(f"{key}: {value}")
`

export default function Sandbox() {
  const [code, setCode] = useState(() => localStorage.getItem(SANDBOX_KEY) || DEFAULT_CODE)
  const [output, setOutput] = useState(null)
  const [error, setError] = useState(null)
  const [running, setRunning] = useState(false)
  const debounceRef = useRef(null)

  useEffect(() => {
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      localStorage.setItem(SANDBOX_KEY, code)
    }, 500)
    return () => clearTimeout(debounceRef.current)
  }, [code])

  const handleRun = async () => {
    setRunning(true)
    setOutput(null)
    setError(null)
    try {
      const py = await getPyodide()
      const captured = []
      py.globals.set('print', (...args) => {
        captured.push(args.map(a => String(a)).join(' '))
      })
      await py.runPythonAsync(code)
      setOutput(captured.length > 0 ? captured.join('\n') : '(출력 없음)')
    } catch (e) {
      setError(e.message || String(e))
    } finally {
      setRunning(false)
    }
  }

  const handleReset = () => {
    if (window.confirm('코드를 초기 예제로 되돌리시겠습니까?')) {
      setCode(DEFAULT_CODE)
      setOutput(null)
      setError(null)
    }
  }

  const handleKeyDown = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault()
      handleRun()
    }
    if (e.key === 'Tab') {
      e.preventDefault()
      const start = e.target.selectionStart
      const end = e.target.selectionEnd
      const newCode = code.substring(0, start) + '    ' + code.substring(end)
      setCode(newCode)
      setTimeout(() => {
        e.target.selectionStart = e.target.selectionEnd = start + 4
      }, 0)
    }
  }

  return (
    <div className="sandbox-page">
      <div className="sandbox-header">
        <Link to="/" className="back-link">← 교재로 돌아가기</Link>
        <h1>⚡ 코딩 샌드박스</h1>
        <p>파이썬 코드를 자유롭게 작성하고 실행해보세요. 코드는 자동으로 저장됩니다.</p>
        <p className="sandbox-tip">💡 Ctrl+Enter (Mac: ⌘+Enter) 로 빠르게 실행 | Tab 키로 들여쓰기</p>
      </div>
      <div className="sandbox-body">
        <div className="sandbox-editor">
          <div className="sandbox-editor-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div className="code-dots">
                <div className="code-dot red" />
                <div className="code-dot yellow" />
                <div className="code-dot green" />
              </div>
              <span style={{ fontSize: 13, color: '#888' }}>Python (Pyodide)</span>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="run-btn" onClick={handleRun} disabled={running}>
                {running ? '⏳ 실행 중...' : '▶ 실행'}
              </button>
              <button className="copy-btn" onClick={handleReset}>
                초기화
              </button>
            </div>
          </div>
          <textarea
            className="sandbox-textarea"
            value={code}
            onChange={e => setCode(e.target.value)}
            onKeyDown={handleKeyDown}
            spellCheck={false}
            autoCapitalize="none"
            autoCorrect="off"
            placeholder="파이썬 코드를 입력하세요..."
          />
        </div>
        {(output !== null || error) && (
          <div className={`code-output${error ? ' code-output-error' : ''}`}>
            <div className="code-output-label">
              {error ? '❌ 오류' : '✅ 실행 결과'}
            </div>
            <pre>{error || output}</pre>
          </div>
        )}
      </div>
    </div>
  )
}
