from fastapi import APIRouter
from pydantic import BaseModel

from app.models.agent import ChessAgent
from app.engine import StockfishEngine

router = APIRouter()
agent = ChessAgent()
engine = StockfishEngine()


class RecommendRequest(BaseModel):
    fen: str
    history_pgn: str | None = None
    depth: int | None = 15


class RecommendResponse(BaseModel):
    move: str | None = None
    analysis: str


@router.post("/", response_model=RecommendResponse)
async def recommend_move(req: RecommendRequest):
    """Suggest a best move and provide an explanation."""
    eval_data = engine.evaluate_fen(req.fen, depth=req.depth or 15)
    best_move = eval_data.get("best_move")

    if best_move is None:
        return {
            "move": None,
            "analysis": "Unable to determine a best move for this position. It might be checkmate or stalemate.",
        }

    prompt = (
        f"In the position (FEN): {req.fen}, the engine suggests the move {best_move}. "
        "Explain in concise terms why this move is strong, referencing chess strategy principles or similar well-known games."
    )
    explanation = agent.chat(prompt, history=[])
    return {"move": best_move, "analysis": explanation} 