from typing import List, Tuple

from .rag import ChessRAG


class ChessAgent:
    """High-level wrapper exposing chat and move recommendation interfaces."""

    def __init__(self):
        self.rag = ChessRAG()

    # ---------- Chat ---------- #
    def chat(self, message: str, history: List[str]) -> str:
        """Return a conversational response leveraging RAG."""
        return self.rag.generate_response(message, history)

    # ---------- Recommendations ---------- #
    def recommend_move(self, fen: str, history_pgn: str | None = None):
        raise NotImplementedError("This method moved to API layer.") 