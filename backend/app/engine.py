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
    def evaluate_fen(
        self, fen: str, depth: int | None = None, elo: int | None = None
    ) -> Dict[str, Optional[str]]:
        """
        Return centipawn score, mate info, principal variation and best move for given FEN.
        An ELO rating can be provided to adjust Stockfish's skill level.
        """
        board = chess.Board(fen)
        options: dict[str, int] = {}
        limit = chess.engine.Limit()

        # Adjust skill and depth based on ELO
        if elo is not None:
            # Clamp ELO between 600 and 3200 for safety
            clamped_elo = max(600, min(elo, 3200))

            # Map ELO to Stockfish skill level (0-20)
            # Formula: skill = (elo - 600) / 130  (approximate)
            skill_level = round((clamped_elo - 600) / 130)
            options["Skill Level"] = max(0, min(skill_level, 20))
            if skill_level <= 10:
                # Introduce additional randomness / inaccuracies for low rated play
                options["Skill Level MaximumError"] = 200  # centipawns
                options["Skill Level Probability"] = 20  # % chance to commit error

            # Lower depth for weaker play to simulate less thinking time
            if depth is None:
                if clamped_elo < 1200:
                    limit.depth = 5
                elif clamped_elo < 1800:
                    limit.depth = 10
                else:
                    limit.depth = 15
            else:
                limit.depth = depth
        elif depth:
            limit.depth = depth
        else:
            limit.depth = 15  # Default depth

        result = self.engine.analyse(board, limit, options=options)

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