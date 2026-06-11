import ProgressBar from './ProgressBar.jsx'

export default function Sidebar({ chapters, currentId, completed, onSelect }) {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h1>💻 코딩 입문서</h1>
        <p>Claude Code로 시작하는 첫 번째 프로그래밍</p>
      </div>
      <div className="sidebar-progress-wrap">
        <ProgressBar completed={completed.size} total={chapters.length} />
      </div>
      <div className="sidebar-chapter-list">
        {chapters.map((ch, i) => (
          <div
            key={ch.id}
            className={`chapter-item${currentId === ch.id ? ' active' : ''}${completed.has(ch.id) ? ' completed' : ''}`}
            onClick={() => onSelect(ch.id)}
          >
            <span className="chapter-emoji">{ch.emoji}</span>
            <div className="chapter-info">
              <div className="chapter-num">챕터 {i + 1}</div>
              <div className="chapter-title">{ch.title}</div>
            </div>
            {completed.has(ch.id) && <span className="check-icon">✓</span>}
          </div>
        ))}
      </div>
    </div>
  )
}
