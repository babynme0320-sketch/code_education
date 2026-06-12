import { useState } from 'react'
import { getPyodide } from '../utils/pyodide.js'

function ChoiceQuestion({ q, onAnswer }) {
  const [selected, setSelected] = useState(null)

  const handleSelect = (idx) => {
    if (selected !== null) return
    setSelected(idx)
    onAnswer(idx === q.answer)
  }

  return (
    <div className="quiz-question">
      <p className="quiz-q-text">{q.question}</p>
      <div className="quiz-options">
        {q.options.map((opt, i) => (
          <button
            key={i}
            className={`quiz-option${selected === i ? (i === q.answer ? ' correct' : ' wrong') : ''}${selected !== null && i === q.answer ? ' reveal' : ''}`}
            onClick={() => handleSelect(i)}
          >
            {opt}
          </button>
        ))}
      </div>
      {selected !== null && (
        <div className={`quiz-feedback ${selected === q.answer ? 'correct' : 'wrong'}`}>
          {selected === q.answer ? '✅ 정답입니다!' : `❌ 오답입니다. 정답: ${q.options[q.answer]}`}
        </div>
      )}
    </div>
  )
}

function CodeCompletionQuestion({ q, onAnswer }) {
  const [code, setCode] = useState(q.code || '')
  const [result, setResult] = useState(null)
  const [running, setRunning] = useState(false)

  const handleRun = async () => {
    setRunning(true)
    let ns = null
    try {
      const py = await getPyodide()
      const captured = []
      ns = py.runPython('dict()')
      ns.set('print', (...args) => captured.push(args.map(String).join(' ')))
      await py.runPythonAsync(code, { globals: ns })
      const output = captured.join('\n').trim()
      const correct = output === (q.expectedOutput || '').trim()
      setResult({ output, correct, hasError: false })
      onAnswer(correct)
    } catch (e) {
      setResult({ output: e.message || String(e), correct: false, hasError: true })
    } finally {
      if (ns) ns.destroy()
      setRunning(false)
    }
  }

  return (
    <div className="quiz-question">
      <p className="quiz-q-text">{q.question}</p>
      <textarea
        className="quiz-code-input"
        value={code}
        onChange={e => setCode(e.target.value)}
        rows={4}
        spellCheck={false}
      />
      <button className="run-btn" onClick={handleRun} disabled={running}>
        {running ? '⏳ 실행 중...' : '▶ 실행해서 확인'}
      </button>
      {result && (
        <div className={`quiz-feedback ${result.correct ? 'correct' : 'wrong'}`}>
          <pre>{result.output}</pre>
          {result.correct ? '✅ 정답!' : result.hasError ? '❌ 오류가 발생했습니다.' : `❌ 예상 출력: ${q.expectedOutput}`}
        </div>
      )}
    </div>
  )
}

function ErrorFixQuestion({ q, onAnswer }) {
  const [code, setCode] = useState(q.code || '')
  const [result, setResult] = useState(null)
  const [running, setRunning] = useState(false)

  const handleRun = async () => {
    setRunning(true)
    let ns = null
    try {
      const py = await getPyodide()
      const captured = []
      ns = py.runPython('dict()')
      ns.set('print', (...args) => captured.push(args.map(String).join(' ')))
      await py.runPythonAsync(code, { globals: ns })
      const output = captured.join('\n') || '(출력 없음)'
      setResult({ output, hasError: false })
      onAnswer(true)
    } catch (e) {
      setResult({ output: e.message || String(e), hasError: true })
      onAnswer(false)
    } finally {
      if (ns) ns.destroy()
      setRunning(false)
    }
  }

  return (
    <div className="quiz-question">
      <p className="quiz-q-text">{q.question}</p>
      {q.hint && <p className="quiz-hint">💡 힌트: {q.hint}</p>}
      <textarea
        className="quiz-code-input"
        value={code}
        onChange={e => setCode(e.target.value)}
        rows={4}
        spellCheck={false}
      />
      <button className="run-btn" onClick={handleRun} disabled={running}>
        {running ? '⏳...' : '▶ 코드 실행'}
      </button>
      {result && (
        <div className={`quiz-feedback ${result.hasError ? 'wrong' : 'correct'}`}>
          <pre>{result.output}</pre>
          {result.hasError ? '❌ 아직 오류가 있습니다.' : '✅ 오류 없이 실행됐습니다!'}
        </div>
      )}
    </div>
  )
}

function KeywordQuestion({ q, onAnswer }) {
  const [text, setText] = useState('')
  const [checked, setChecked] = useState(false)
  const [passed, setPassed] = useState(false)

  const handleCheck = () => {
    if (checked) return
    const lower = text.toLowerCase()
    const correct = q.keywords.every(kw => lower.includes(kw.toLowerCase()))
    setPassed(correct)
    setChecked(true)
    onAnswer(correct)
  }

  return (
    <div className="quiz-question">
      <p className="quiz-q-text">{q.question}</p>
      <textarea
        className="quiz-code-input"
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="여기에 답을 적어보세요..."
        rows={3}
      />
      <button className="run-btn" onClick={handleCheck} disabled={checked || !text.trim()}>
        ✓ 답변 제출
      </button>
      {checked && (
        <div className={`quiz-feedback ${passed ? 'correct' : 'wrong'}`}>
          {passed
            ? '✅ 잘 이해하셨네요!'
            : `❌ 핵심 키워드를 포함해보세요: ${q.keywords.join(', ')}`}
        </div>
      )}
    </div>
  )
}

const QUESTION_COMPONENTS = {
  'choice': ChoiceQuestion,
  'code-completion': CodeCompletionQuestion,
  'error-fix': ErrorFixQuestion,
  'keyword': KeywordQuestion,
}

export default function Quiz({ questions, onPass }) {
  const [answers, setAnswers] = useState({})
  const [expanded, setExpanded] = useState(true)

  const handleAnswer = (idx, correct) => {
    setAnswers(prev => {
      const next = { ...prev, [idx]: correct }
      const allAnswered = questions.every((_, i) => i in next)
      const allCorrect = questions.every((_, i) => next[i] === true)
      if (allAnswered && allCorrect && onPass) onPass()
      return next
    })
  }

  const answeredCount = Object.keys(answers).length
  const correctCount = Object.values(answers).filter(Boolean).length

  return (
    <div className="quiz-section">
      <div className="quiz-header" onClick={() => setExpanded(e => !e)}>
        <span>📝 챕터 퀴즈</span>
        <span className="quiz-score">{answeredCount}/{questions.length} 완료</span>
        <span>{expanded ? '▲' : '▼'}</span>
      </div>
      {expanded && (
        <div className="quiz-body">
          {questions.map((q, i) => {
            const QComp = QUESTION_COMPONENTS[q.type] || ChoiceQuestion
            return (
              <div key={i} className="quiz-item">
                <div className="quiz-item-num">Q{i + 1}</div>
                <QComp q={q} onAnswer={(correct) => handleAnswer(i, correct)} />
              </div>
            )
          })}
          {answeredCount === questions.length && (
            <div className={`quiz-result ${correctCount === questions.length ? 'all-pass' : ''}`}>
              {correctCount === questions.length
                ? '🎉 모든 문제를 맞혔습니다!'
                : `${correctCount}/${questions.length} 정답. 틀린 문제를 다시 확인해보세요.`}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
