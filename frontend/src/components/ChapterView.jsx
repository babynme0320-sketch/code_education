import { useState } from 'react'
import CodeBlock from './CodeBlock.jsx'
import Quiz from './Quiz.jsx'
import MiniProjectGuide from './MiniProjectGuide.jsx'

function renderText(raw) {
  const lines = raw.split('\n')
  const elements = []
  let listItems = []
  let key = 0

  const flushList = () => {
    if (listItems.length > 0) {
      elements.push(<ul key={key++}>{listItems.map((li, i) => <li key={i}>{parseInline(li)}</li>)}</ul>)
      listItems = []
    }
  }

  const parseInline = (text) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/)
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i}>{part.slice(2, -2)}</strong>
      }
      return part
    })
  }

  for (const line of lines) {
    if (line.startsWith('# ')) {
      flushList()
      elements.push(<h1 key={key++}>{parseInline(line.slice(2))}</h1>)
    } else if (line.startsWith('## ')) {
      flushList()
      elements.push(<h2 key={key++}>{parseInline(line.slice(3))}</h2>)
    } else if (line.startsWith('### ')) {
      flushList()
      elements.push(<h3 key={key++}>{parseInline(line.slice(4))}</h3>)
    } else if (line.startsWith('- ')) {
      listItems.push(line.slice(2))
    } else if (line.trim() === '') {
      flushList()
    } else {
      flushList()
      elements.push(<p key={key++}>{parseInline(line)}</p>)
    }
  }
  flushList()
  return elements
}

function TextSection({ content }) {
  return <div className="section-text">{renderText(content)}</div>
}

function HighlightSection({ content }) {
  return <div className="section-highlight">{content}</div>
}

function ConversationSection({ messages }) {
  return (
    <div className="section-conversation">
      {messages.map((msg, i) => {
        const isUser = msg.role === 'user'
        const text = msg.text || msg.content || ''
        return (
          <div key={i} className={`conversation-bubble ${isUser ? 'user' : 'ai'}`}>
            <div className={`bubble-avatar ${isUser ? 'user-avatar' : 'ai-avatar'}`}>
              {isUser ? '🧑' : '🤖'}
            </div>
            <div className="bubble-body">
              <div className="bubble-label">{isUser ? '나 (사용자)' : 'Claude Code'}</div>
              <div className="bubble-text">{text}</div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function ScreenshotSection({ label, content }) {
  return (
    <div className="section-screenshot">
      {label && <div className="screenshot-label">{label}</div>}
      <pre className="screenshot-body">{content}</pre>
    </div>
  )
}

function WindowsNoteSection({ content }) {
  return (
    <div className="section-windows-note">
      <span className="windows-note-badge">🪟 Windows</span>
      <span>{content}</span>
    </div>
  )
}

function renderSection(section, i, onQuizPass) {
  switch (section.type) {
    case 'text':
      return <TextSection key={i} content={section.content} />
    case 'highlight':
      return <HighlightSection key={i} content={section.content} />
    case 'code':
      return (
        <CodeBlock
          key={i}
          language={section.language || 'python'}
          label={section.label}
          content={section.content}
          executable={section.executable === true}
        />
      )
    case 'conversation':
      return <ConversationSection key={i} messages={section.messages} />
    case 'screenshot':
      return <ScreenshotSection key={i} label={section.label} content={section.content} />
    case 'windows-note':
      return <WindowsNoteSection key={i} content={section.content} />
    case 'quiz':
      return <Quiz key={i} questions={section.questions || []} onPass={onQuizPass} />
    case 'mini-step':
      return null
    default:
      return null
  }
}

export default function ChapterView({ chapter, isCompleted, hasPrev, hasNext, onComplete, onPrev, onNext }) {
  const [quizPassed, setQuizPassed] = useState(false)

  const miniSteps = (chapter.sections || []).filter(s => s.type === 'mini-step')
  const mainSections = (chapter.sections || []).filter(s => s.type !== 'mini-step')

  const handleComplete = () => {
    onComplete()
    if (hasNext) onNext()
  }

  const handleQuizPass = () => {
    setQuizPassed(true)
    if (!isCompleted) onComplete()
  }

  return (
    <div className="chapter-view">
      <div className="chapter-header">
        <div className="chapter-badge">
          <span>{chapter.emoji}</span>
          {chapter.isMiniProject && <span className="mini-project-badge">🎯 미니프로젝트</span>}
          <span>챕터 {chapter.id}</span>
        </div>
        <h1 className="chapter-main-title">{chapter.title}</h1>
        <p className="chapter-summary-text">{chapter.summary}</p>
      </div>

      {mainSections.map((s, i) => renderSection(s, i, handleQuizPass))}

      {miniSteps.length > 0 && (
        <MiniProjectGuide chapterId={chapter.id} steps={miniSteps} />
      )}

      <div className="chapter-nav">
        <button className="nav-btn prev" onClick={onPrev} disabled={!hasPrev}>
          ← 이전 챕터
        </button>
        {!isCompleted ? (
          <button className="nav-btn complete" onClick={handleComplete}>
            ✓ 완료하고 다음으로
          </button>
        ) : hasNext ? (
          <button className="nav-btn next" onClick={onNext}>
            다음 챕터 →
          </button>
        ) : (
          <span style={{ color: '#22c55e', fontWeight: 700, fontSize: 15 }}>🎉 모든 챕터 완료!</span>
        )}
      </div>
    </div>
  )
}
