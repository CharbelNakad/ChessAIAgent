from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

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