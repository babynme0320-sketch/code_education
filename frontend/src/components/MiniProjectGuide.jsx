import { useState, useEffect } from 'react'

const STORAGE_PREFIX = 'mini-project-'

export default function MiniProjectGuide({ chapterId, steps }) {
  const storageKey = `${STORAGE_PREFIX}${chapterId}`

  const [doneSteps, setDoneSteps] = useState(() => {
    try {
      return new Set(JSON.parse(localStorage.getItem(storageKey) || '[]'))
    } catch {
      return new Set()
    }
  })
  const [currentStep, setCurrentStep] = useState(0)

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify([...doneSteps]))
  }, [doneSteps, storageKey])

  const toggleDone = (stepIdx) => {
    setDoneSteps(prev => {
      const next = new Set(prev)
      if (next.has(stepIdx)) {
        next.delete(stepIdx)
      } else {
        next.add(stepIdx)
        if (stepIdx < steps.length - 1) {
          setCurrentStep(stepIdx + 1)
        }
      }
      return next
    })
  }

  const allDone = steps.every((_, i) => doneSteps.has(i))

  return (
    <div className="mini-guide-section">
      <div className="mini-guide-header">
        <span>🎯 미니프로젝트 단계별 가이드</span>
        <span className="mini-guide-progress">
          {doneSteps.size}/{steps.length} 단계 완료
        </span>
      </div>

      <div className="mini-guide-steps">
        {steps.map((step, i) => {
          const isDone = doneSteps.has(i)
          const isActive = i === currentStep
          const isLocked = i > 0 && !doneSteps.has(i - 1)

          return (
            <div
              key={i}
              className={`mini-step${isActive ? ' active' : ''}${isDone ? ' done' : ''}${isLocked ? ' locked' : ''}`}
            >
              <div className="mini-step-header" onClick={() => !isLocked && setCurrentStep(i)}>
                <div className="mini-step-num">
                  {isDone ? '✅' : isLocked ? '🔒' : `${i + 1}`}
                </div>
                <div className="mini-step-title">{step.title || `단계 ${i + 1}`}</div>
              </div>

              {isActive && !isLocked && (
                <div className="mini-step-body">
                  {step.promptExample && (
                    <div className="mini-step-prompt">
                      <div className="mini-step-prompt-label">💬 Claude Code에 이렇게 요청하세요</div>
                      <pre>{step.promptExample}</pre>
                    </div>
                  )}
                  {step.expected && (
                    <div className="mini-step-expected">
                      <div className="mini-step-expected-label">📋 예상 결과</div>
                      <p>{step.expected}</p>
                    </div>
                  )}
                  <button
                    className={`mini-step-done-btn${isDone ? ' undone' : ''}`}
                    onClick={() => toggleDone(i)}
                  >
                    {isDone ? '↩ 완료 취소' : '✓ 이 단계 완료'}
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {allDone && (
        <div className="mini-guide-complete">
          🎉 미니프로젝트를 완성했습니다! 정말 잘 하셨어요!
        </div>
      )}
    </div>
  )
}
