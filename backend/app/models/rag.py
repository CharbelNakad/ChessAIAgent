from typing import List
from pathlib import Path

from langchain.chains import RetrievalQA
from langchain_community.vectorstores import FAISS
from langchain_openai import OpenAIEmbeddings, OpenAI


class ChessRAG:
    """Retrieval-Augmented Generation wrapper specialized for chess content."""

    def __init__(self):
        embeddings = OpenAIEmbeddings()
        index_path = Path(__file__).resolve().parent.parent.parent / "data" / "faiss_index"

        if not index_path.exists():
            raise FileNotFoundError(
                "FAISS index not found. Run `python app/ingest.py` (inside the backend container) "
                "to create it from resources before starting the server."
            )

        self.vector_store = FAISS.load_local(str(index_path), embeddings)

        self.qa_chain = RetrievalQA.from_chain_type(
            llm=OpenAI(),
            chain_type="stuff",
            retriever=self.vector_store.as_retriever(),
        )

    def generate_response(self, query: str, history: List[str]) -> str:
        """Generate an answer grounded in retrieved chess documents."""
        return self.qa_chain.run(query) 