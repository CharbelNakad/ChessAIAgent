"""Stockfish engine wrapper for position evaluation."""
from __future__ import annotations

import functools
from pathlib import Path
from typing import Dict, Optional

import chess
import chess.engine


class StockfishEngine:
    """Lightweight singleton-style wrapper around the system Stockfish binary."""

    _instance: "StockfishEngine" | None = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._init_engine()
        return cls._instance

    def _init_engine(self) -> None:
        binary_path = "/usr/games/stockfish"  # Debian/Ubuntu default
        if not Path(binary_path).exists():
            raise FileNotFoundError(f"Stockfish binary not found at {binary_path}. Is it installed in the container?")
        self.engine = chess.engine.SimpleEngine.popen_uci(binary_path)

    def __del__(self):
        try:
            self.engine.close()
        except Exception:
            pass

    @functools.lru_cache(maxsize=1024)
    def evaluate_fen(self, fen: str, depth: int = 15) -> Dict[str, Optional[str]]:
        """Return centipawn score, mate info, principal variation and best move for given FEN."""
        board = chess.Board(fen)
        result = self.engine.analyse(board, chess.engine.Limit(depth=depth))

        score_cp = None
        mate = None
        if result["score"].is_mate():
            mate = result["score"].mate()
        else:
            score_cp = result["score"].white().score()

        pv_moves = []
        if "pv" in result:
            pv_board = board.copy()
            for m in result["pv"]:
                pv_moves.append(pv_board.san(m))
                pv_board.push(m)
        best_move = pv_moves[0] if pv_moves else None

        return {
            "score_cp": score_cp,
            "mate": mate,
            "pv": " ".join(pv_moves),
            "best_move": best_move,
        } 