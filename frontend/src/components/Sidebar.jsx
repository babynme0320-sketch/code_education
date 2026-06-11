import { Link, useLocation } from 'react-router-dom'
import ProgressBar from './ProgressBar.jsx'

const PART_NAMES = {
  1: '1부: 코딩 기초',
  2: '2부: Python 심화',
  3: '3부: Claude Code 고급',
  4: '4부: 웹서비스 개발',
  5: '5부: 자동화 & 캡스톤',
}

export default function Sidebar({ chapters, currentId, completed, onSelect }) {
  const location = useLocation()

  const partGroups = []
  let lastPart = null
  for (const ch of chapters) {
    const partNum = ch.part || 1
    if (partNum !== lastPart) {
      lastPart = partNum
      partGroups.push({ part: partNum, chapters: [] })
    }
    partGroups[partGroups.length - 1].chapters.push(ch)
  }

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
          <h1>💻 코딩 입문서</h1>
        </Link>
        <p>Claude Code로 시작하는 프로그래밍</p>
      </div>
      <div className="sidebar-progress-wrap">
        <ProgressBar completed={completed.size} total={chapters.length} />
      </div>
      <div className="sidebar-feature-links">
        <Link
          to="/sandbox"
          className={`feature-link${location.pathname === '/sandbox' ? ' active' : ''}`}
        >
          <span>⚡</span> 코딩 샌드박스
        </Link>
        <Link
          to="/templates"
          className={`feature-link${location.pathname === '/templates' ? ' active' : ''}`}
        >
          <span>📋</span> 자동화 템플릿
        </Link>
      </div>
      <div className="sidebar-chapter-list">
        {partGroups.map(({ part, chapters: partChapters }) => (
          <div key={part} className="part-group">
            <div className="part-header">{PART_NAMES[part] || `${part}부`}</div>
            {partChapters.map((ch) => {
              const globalIdx = chapters.findIndex(c => c.id === ch.id)
              return (
                <div
                  key={ch.id}
                  className={`chapter-item${currentId === ch.id ? ' active' : ''}${completed.has(ch.id) ? ' completed' : ''}${ch.isMiniProject ? ' mini-project' : ''}`}
                  onClick={() => onSelect(ch.id)}
                >
                  <span className="chapter-emoji">{ch.emoji}</span>
                  <div className="chapter-info">
                    <div className="chapter-num">
                      {ch.isMiniProject ? '🎯 미니프로젝트' : `챕터 ${globalIdx + 1}`}
                    </div>
                    <div className="chapter-title">{ch.title}</div>
                  </div>
                  {completed.has(ch.id) && <span className="check-icon">✓</span>}
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
