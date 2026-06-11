let pyodideInstance = null
let pyodideLoadPromise = null

export async function getPyodide() {
  if (pyodideInstance) return pyodideInstance
  if (!pyodideLoadPromise) {
    pyodideLoadPromise = (async () => {
      if (!window.loadPyodide) {
        await new Promise((resolve, reject) => {
          const s = document.createElement('script')
          s.src = 'https://cdn.jsdelivr.net/pyodide/v0.26.2/full/pyodide.js'
          s.onload = resolve
          s.onerror = () => reject(new Error('Pyodide 로드 실패'))
          document.head.appendChild(s)
        })
      }
      pyodideInstance = await window.loadPyodide()
      return pyodideInstance
    })()
  }
  return pyodideLoadPromise
}
