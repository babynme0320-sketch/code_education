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
