import { useState } from 'react'
import { getPyodide } from '../utils/pyodide.js'

export default function CodeBlock({ language = 'python', label, content, executable = false }) {
  const [copied, setCopied] = useState(false)
  const [output, setOutput] = useState(null)
  const [running, setRunning] = useState(false)
  const [error, setError] = useState(null)

  const handleCopy = () => {
    navigator.clipboard.writeText(content).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    })
  }

  const handleRun = async () => {
    setRunning(true)
    setOutput(null)
    setError(null)
    let ns = null
    try {
      const py = await getPyodide()
      const captured = []
      ns = py.runPython('dict()')
      ns.set('print', (...args) => {
        captured.push(args.map(a => String(a)).join(' '))
      })
      await py.runPythonAsync(content, { globals: ns })
      setOutput(captured.length > 0 ? captured.join('\n') : '(출력 없음)')
    } catch (e) {
      setError(e.message || String(e))
    } finally {
      if (ns) ns.destroy()
      setRunning(false)
    }
  }

  return (
    <div className="code-block-wrap">
      <div className="code-block-header">
        <div className="code-block-left">
          <div className="code-dots">
            <div className="code-dot red" />
            <div className="code-dot yellow" />
            <div className="code-dot green" />
          </div>
          {label && <span className="code-label">{label}</span>}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {executable && (
            <button className="run-btn" onClick={handleRun} disabled={running}>
              {running ? '⏳ 실행 중...' : '▶ 실행'}
            </button>
          )}
          <button className={`copy-btn${copied ? ' copied' : ''}`} onClick={handleCopy}>
            {copied ? '✓ 복사됨' : '복사'}
          </button>
        </div>
      </div>
      <div className="code-block-body">
        <pre>{content}</pre>
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
  )
}
