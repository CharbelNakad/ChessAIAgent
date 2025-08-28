import chess
from fastapi import APIRouter
from pydantic import BaseModel

from app.engine import StockfishEngine
from app.analysis import grade_move

router = APIRouter()
engine = StockfishEngine()


class EvaluateRequest(BaseModel):
    fen: str
    depth: int | None = 15
    elo: int | None = None
    move: str | None = None # Add move to be graded


class EvaluateResponse(BaseModel):
    score_cp: float | None = None
    mate: int | None = None
    best_move: str | None = None
    pv: str | None = None
    grade: str | None = None
    grade_description: str | None = None
    diff_cp: float | None = None


@router.post("/", response_model=EvaluateResponse)
async def evaluate_position(req: EvaluateRequest):
    """
    Return Stockfish evaluation of the given FEN position.
    If a move is provided, it will be graded.
    """
    if req.move:
        board = chess.Board(req.fen)
        try:
            move = board.parse_san(req.move)
            board.push(move)
            grade_data = grade_move(chess.Board(req.fen), board, engine)
            return {
                "score_cp": None,
                "mate": None,
                "best_move": None,
                "pv": None,
                "grade": grade_data.get("grade"),
                "grade_description": grade_data.get("description"),
                "diff_cp": grade_data.get("diff_cp"),
            }
        except ValueError:
            # Handle invalid move
            pass

    data = engine.evaluate_fen(req.fen, depth=req.depth, elo=req.elo)
    return data 