import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar.jsx'
import ChapterView from './components/ChapterView.jsx'
import ProgressBar from './components/ProgressBar.jsx'
import Sandbox from './pages/Sandbox.jsx'
import Templates from './pages/Templates.jsx'

const STORAGE_KEY = 'coding-edu-completed'
const CURRENT_CHAPTER_KEY = 'coding-edu-current-chapter'
const API_BASE = import.meta.env.VITE_BACKEND_URL ?? ''

function MainApp() {
  const [chapters, setChapters] = useState([])
  const [currentId, setCurrentId] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(CURRENT_CHAPTER_KEY) || 'null')
    } catch {
      return null
    }
  })
  const [currentChapter, setCurrentChapter] = useState(null)
  const [completed, setCompleted] = useState(() => {
    try {
      return new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'))
    } catch {
      return new Set()
    }
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${API_BASE}/api/chapters`)
      .then(r => r.json())
      .then(data => {
        setChapters(data.chapters)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!currentId) return
    const controller = new AbortController()
    fetch(`${API_BASE}/api/chapters/${currentId}`, { signal: controller.signal })
      .then(r => r.json())
      .then(data => setCurrentChapter(data))
      .catch(err => { if (err.name !== 'AbortError') console.error(err) })
    return () => controller.abort()
  }, [currentId])

  const markComplete = (id) => {
    setCompleted(prev => {
      const next = new Set(prev)
      next.add(id)
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]))
      return next
    })
  }

  const goTo = (id) => {
    setCurrentChapter(null)
    setCurrentId(id)
    localStorage.setItem(CURRENT_CHAPTER_KEY, JSON.stringify(id))
    window.scrollTo(0, 0)
  }

  const goNext = () => {
    const idx = chapters.findIndex(c => c.id === currentId)
    if (idx < chapters.length - 1) goTo(chapters[idx + 1].id)
  }

  const goPrev = () => {
    const idx = chapters.findIndex(c => c.id === currentId)
    if (idx > 0) goTo(chapters[idx - 1].id)
  }

  const currentIdx = chapters.findIndex(c => c.id === currentId)

  return (
    <div className="app-layout">
      <Sidebar
        chapters={chapters}
        currentId={currentId}
        completed={completed}
        onSelect={goTo}
      />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {chapters.length > 0 && (
          <div className="top-progress">
            <ProgressBar completed={completed.size} total={chapters.length} />
          </div>
        )}
        <div className="main-content">
          {loading ? (
            <div className="loading-state">
              <div style={{ fontSize: 48, marginBottom: 16 }}>⏳</div>
              <p>챕터를 불러오는 중...</p>
            </div>
          ) : !currentId ? (
            <div className="welcome-state">
              <div className="big-emoji">💻</div>
              <h2>코딩 입문서에 오신 걸 환영합니다!</h2>
              <p>Claude Code를 활용해 코딩을 처음 배우는 분들을 위한 인터랙티브 가이드입니다.</p>
              <p style={{ color: '#6b7280', fontSize: 14 }}>총 30챕터 · 약 20시간 · 5개 미니프로젝트</p>
              {chapters.length > 0 && (
                <button className="start-btn" onClick={() => goTo(chapters[0].id)}>
                  첫 번째 챕터 시작하기 →
                </button>
              )}
            </div>
          ) : currentChapter ? (
            <ChapterView
              chapter={currentChapter}
              isCompleted={completed.has(currentId)}
              hasPrev={currentIdx > 0}
              hasNext={currentIdx < chapters.length - 1}
              onComplete={() => markComplete(currentId)}
              onPrev={goPrev}
              onNext={goNext}
            />
          ) : (
            <div className="loading-state">
              <div style={{ fontSize: 48, marginBottom: 16 }}>📖</div>
              <p>챕터를 불러오는 중...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainApp />} />
        <Route path="/sandbox" element={<Sandbox />} />
        <Route path="/templates" element={<Templates />} />
      </Routes>
    </BrowserRouter>
  )
}
