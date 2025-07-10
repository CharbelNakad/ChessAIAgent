import chess
from fastapi import APIRouter
from pydantic import BaseModel

from app.engine import StockfishEngine

router = APIRouter()
engine = StockfishEngine()


class EvaluateRequest(BaseModel):
    fen: str
    depth: int | None = 15


class EvaluateResponse(BaseModel):
    score_cp: float | None = None
    mate: int | None = None
    best_move: str | None = None
    pv: str | None = None


@router.post("/", response_model=EvaluateResponse)
async def evaluate_position(req: EvaluateRequest):
    """Return Stockfish evaluation of the given FEN position."""
    data = engine.evaluate_fen(req.fen, depth=req.depth or 15)
    return data 