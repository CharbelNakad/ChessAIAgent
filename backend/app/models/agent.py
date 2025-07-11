from typing import List, Optional, Any

from .rag import ChessRAG

# LangGraph for future expansion (optional)
try:
    from langgraph.graph import Graph  # type: ignore
except Exception:  # pragma: no cover
    Graph = None  # type: ignore


class ChessAgent:
    """High-level wrapper exposing chat and move recommendation interfaces."""

    def __init__(self):
        self.rag = ChessRAG()
        self.graph: Any = None
        # In-memory conversation log
        self.memory: List[str] = []

    # ---------- Chat ---------- #
    def chat(self, message: str, history: List[str], fen: Optional[str] = None) -> str:
        """Return a conversational response leveraging RAG, current board position, and memory."""

        # Build rich prompt with position and conversation context
        fen_context = f"Current board position (FEN): {fen}." if fen else "Board position unknown."
        history_context = "\n".join(history or [])
        user_prompt = (
            f"{fen_context}\n\nConversation so far:\n{history_context}\n\nUser: {message}\nAssistant:"
        )

        # Invoke via graph (traced) if available; else direct
        if self.graph is not None:
            reply: str = self.graph.invoke({"query": user_prompt, "history": history or [], "fen": fen})  # type: ignore
        else:
            reply = self.rag.generate_response(user_prompt, history or [], fen)

        # Append to internal memory
        self.memory.extend([f"user: {message}", f"assistant: {reply}"])
        return reply

    # ---------- Recommendations ---------- #
    def recommend_move(self, fen: str, history_pgn: str | None = None):
        raise NotImplementedError("This method moved to API layer.") 