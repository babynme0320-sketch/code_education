from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import json
import os

app = FastAPI(title="코딩 입문서 API", version="1.0.0")

_raw = os.environ.get("ALLOWED_ORIGINS", "http://localhost:5173")
_origins = [o.strip() for o in _raw.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

CHAPTERS_PATH = os.path.join(os.path.dirname(__file__), "content", "chapters.json")


def load_chapters():
    with open(CHAPTERS_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def validate_chapters_structure():
    try:
        data = load_chapters()
        if "chapters" not in data or not isinstance(data["chapters"], list):
            raise ValueError("chapters.json must contain a list of chapters.")
        
        for ch in data["chapters"]:
            ch_id = ch.get("id")
            title = ch.get("title")
            if ch_id is None or title is None:
                raise ValueError(f"Chapter in chapters.json is missing id or title: {ch}")
            
            sections = ch.get("sections")
            if not isinstance(sections, list):
                raise ValueError(f"Chapter {ch_id} ({title}) sections must be a list.")
            
            for idx, sec in enumerate(sections):
                stype = sec.get("type")
                if not stype:
                    raise ValueError(f"Chapter {ch_id} section {idx} is missing 'type'.")
                
                if stype == "conversation":
                    if "messages" not in sec or not isinstance(sec["messages"], list):
                        raise ValueError(
                            f"Chapter {ch_id} section {idx} of type 'conversation' must contain a 'messages' list."
                        )
                    for m_idx, msg in enumerate(sec["messages"]):
                        if "role" not in msg or ("content" not in msg and "text" not in msg):
                            raise ValueError(
                                f"Chapter {ch_id} section {idx} message {m_idx} must contain 'role' and ('content' or 'text')."
                            )
                elif stype == "quiz":
                    if "questions" not in sec or not isinstance(sec["questions"], list):
                        raise ValueError(
                            f"Chapter {ch_id} section {idx} of type 'quiz' must contain a 'questions' list."
                        )
                    for q_idx, q in enumerate(sec["questions"]):
                        qtype = q.get("type")
                        if not qtype:
                            raise ValueError(
                                f"Chapter {ch_id} section {idx} question {q_idx} is missing 'type'."
                            )
                        if qtype == "choice":
                            if "options" not in q or "answer" not in q:
                                raise ValueError(
                                    f"Chapter {ch_id} section {idx} choice question {q_idx} must contain 'options' and 'answer'."
                                )
                        elif qtype == "keyword":
                            if "keywords" not in q:
                                raise ValueError(
                                    f"Chapter {ch_id} section {idx} keyword question {q_idx} must contain 'keywords'."
                                )
    except Exception as e:
        print(f"❌ 데이터 검증 실패: {e}")
        raise e


validate_chapters_structure()


@app.get("/api/health")
def health_check():
    return {"status": "ok", "message": "서버가 정상 작동 중입니다"}


@app.get("/api/chapters")
def get_chapters():
    data = load_chapters()
    chapters = data["chapters"]
    summary_list = [
        {
            "id": ch["id"],
            "title": ch["title"],
            "emoji": ch["emoji"],
            "summary": ch["summary"],
            "part": ch.get("part", 1),
            "isMiniProject": ch.get("isMiniProject", False),
        }
        for ch in chapters
    ]
    return {"chapters": summary_list, "total": len(summary_list)}


@app.get("/api/parts")
def get_parts():
    data = load_chapters()
    chapters = data["chapters"]
    parts: dict = {}
    for ch in chapters:
        part_id = ch.get("part", 1)
        if part_id not in parts:
            parts[part_id] = []
        parts[part_id].append({
            "id": ch["id"],
            "title": ch["title"],
            "emoji": ch["emoji"],
            "summary": ch["summary"],
            "isMiniProject": ch.get("isMiniProject", False),
        })
    return {"parts": [{"part": k, "chapters": v} for k, v in sorted(parts.items())]}


@app.get("/api/chapters/{chapter_id}")
def get_chapter(chapter_id: int):
    data = load_chapters()
    chapters = data["chapters"]
    chapter = next((ch for ch in chapters if ch["id"] == chapter_id), None)
    if chapter is None:
        raise HTTPException(status_code=404, detail=f"챕터 {chapter_id}를 찾을 수 없습니다")
    return chapter
