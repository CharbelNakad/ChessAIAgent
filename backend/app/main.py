from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Load .env early so that OpenAI / LangSmith keys are available
from dotenv import load_dotenv

load_dotenv()

# LangChain tracing (LangSmith) automatically picks up env vars; ensure import
import os
if os.getenv("LANGCHAIN_TRACING_V2", "false").lower() in {"1", "true", "yes"}:
    try:
        from langchain.callbacks.tracers import LangChainTracerV2

        LangChainTracerV2()
    except Exception as _e:
        # Fallback silently if tracer init fails (e.g., missing package during dev)
        pass

from app.api import chat, evaluate, recommend

app = FastAPI(title="Chess AI Coach Backend")

# Allow all origins for dev; tighten in prod
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount routers
app.include_router(chat.router, prefix="/chat", tags=["Chat"])
app.include_router(evaluate.router, prefix="/evaluate", tags=["Evaluation"])
app.include_router(recommend.router, prefix="/recommend", tags=["Recommendation"])


@app.get("/")
async def root():
    """Health check"""
    return {"message": "Chess AI Agent backend is running."} 