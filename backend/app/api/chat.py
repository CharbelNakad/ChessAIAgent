from fastapi import APIRouter
from pydantic import BaseModel

from app.models.agent import ChessAgent

router = APIRouter()
agent = ChessAgent()


class ChatRequest(BaseModel):
    message: str
    history: list[str] | None = []


class ChatResponse(BaseModel):
    reply: str


@router.post("/", response_model=ChatResponse)
async def chat_endpoint(req: ChatRequest):
    """Chat with the AI chess coach."""
    reply = agent.chat(req.message, req.history or [])
    return {"reply": reply} 