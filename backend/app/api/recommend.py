from fastapi import APIRouter
from pydantic import BaseModel

from app.models.agent import ChessAgent
from app.engine import StockfishEngine
import random
import chess

router = APIRouter()
agent = ChessAgent()
engine = StockfishEngine()


class RecommendRequest(BaseModel):
    fen: str
    history_pgn: str | None = None
    depth: int | None = 15
    elo: int | None = None
    explain: bool | None = True


class RecommendResponse(BaseModel):
    move: str | None = None
    analysis: str
    skill_used: int


@router.post("/", response_model=RecommendResponse)
async def recommend_move(req: RecommendRequest):
    """Suggest a best move and provide an explanation."""
    # Determine skill level from elo mapping used in engine
    if req.elo is not None:
        clamped_elo = max(600, min(req.elo, 3200))
        skill_level = round((clamped_elo - 600) / 130)
    else:
        skill_level = 20

    board = chess.Board(req.fen)
    limit = chess.engine.Limit(depth=req.depth or 15)
    options = {"Skill Level": skill_level}

    # Dynamic depth: lower depth for weak skill if depth not provided
    if req.depth is None:
        if skill_level <= 5:
            limit = chess.engine.Limit(depth=4)
        elif skill_level <= 10:
            limit = chess.engine.Limit(depth=6)
        elif skill_level <= 15:
            limit = chess.engine.Limit(depth=10)

    try:
        infos = engine.engine.analyse(board, limit, multipv=5, options=options)
    except Exception as exc:
        # Fallback to single line if multipv fails
        infos = engine.engine.analyse(board, limit, options=options)
        candidate_moves = [infos["pv"][0]] if "pv" in infos else []
    else:
        candidate_moves = [info["pv"][0] for info in infos if "pv" in info]

    if not candidate_moves:
        return {
            "move": None,
            "analysis": "Unable to generate move recommendations for this position.",
            "skill_used": skill_level,
        }

    # choose index based on skill brackets
    n = len(candidate_moves)
    if skill_level <= 5:
        # random among last half to emulate blunders
        start = max(1, n // 2)
        chosen = random.choice(candidate_moves[start:])
    elif skill_level <= 10:
        idx = min(2, n - 1)
        chosen = candidate_moves[idx]
    elif skill_level <= 15:
        idx = min(1, n - 1)
        chosen = candidate_moves[idx] if random.random() < 0.5 else candidate_moves[0]
    else:
        chosen = candidate_moves[0]

    best_move_san = board.san(chosen)

    explanation = ""
    if req.explain:
        prompt = (
            f"In the position (FEN): {req.fen}, a player rated approximately {req.elo or 3200} would likely play {best_move_san}. "
            "Explain in concise terms why this move is reasonable for that skill level."
        )
        explanation = agent.chat(prompt, history=[])

    return {"move": best_move_san, "analysis": explanation, "skill_used": skill_level} 