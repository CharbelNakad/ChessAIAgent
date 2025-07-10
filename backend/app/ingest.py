"""Ingest chess resources, build/refresh FAISS vector store.

Run:
    python -m app.ingest
or inside Docker:
    docker compose run --rm backend python app/ingest.py
"""
from __future__ import annotations

import os
from pathlib import Path
from typing import List

from langchain.document_loaders import TextLoader, PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores import FAISS


ROOT_DIR = Path(__file__).resolve().parent.parent  # backend/
RESOURCES_DIR = ROOT_DIR / "data" / "resources"
INDEX_DIR = ROOT_DIR / "data" / "faiss_index"


def load_documents(directory: Path) -> List["Document"]:  # type: ignore[name-defined]
    """Recursively load .txt/.pgn/.md/.pdf files under *directory*."""
    docs = []
    for root, _, files in os.walk(directory):
        for file in files:
            path = Path(root) / file
            if file.lower().endswith((".txt", ".md", ".pgn")):
                loader = TextLoader(str(path), encoding="utf-8")
            elif file.lower().endswith(".pdf"):
                loader = PyPDFLoader(str(path))
            else:
                # Unsupported extension
                continue
            docs.extend(loader.load())
    return docs


def main() -> None:
    if not RESOURCES_DIR.exists():
        raise FileNotFoundError(
            f"Resources directory not found: {RESOURCES_DIR}. "
            "Add chess docs (PGN, PDF, txt) then rerun."
        )

    print(f"Loading documents from {RESOURCES_DIR.resolve()} …")
    raw_docs = load_documents(RESOURCES_DIR)
    if not raw_docs:
        raise RuntimeError("No documents found for ingestion.")
    print(f"Loaded {len(raw_docs)} documents. Splitting …")

    splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=150)
    splits = splitter.split_documents(raw_docs)
    print(f"Generated {len(splits)} text chunks.")

    embeddings = OpenAIEmbeddings()
    vector_store = FAISS.from_documents(splits, embeddings)
    INDEX_DIR.mkdir(parents=True, exist_ok=True)
    vector_store.save_local(str(INDEX_DIR))
    print(f"FAISS index saved to {INDEX_DIR.resolve()} 🇫🇷✅")


if __name__ == "__main__":
    main() 