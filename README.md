# Chess AI Agent

A professional full-stack web application that integrates an AI agent to teach and coach chess through natural-language chat, real-time position evaluation, and move recommendations.

## Features

* Chat with an AI chess coach powered by LangChain and Retrieval-Augmented Generation (RAG)
* Embedded playable chessboard with live evaluation and recommended moves
* RESTful backend built with FastAPI
* React / Next.js frontend
* Docker-first deployment (Docker Compose ready)

---

## Directory Structure

```
Chess AI Agent/
│
├── backend/               # FastAPI service + LangChain agent
│   ├── app/
│   │   ├── api/           # REST route handlers (chat, evaluate, recommend)
│   │   └── models/        # Agent + RAG wrappers
│   ├── data/              # Vector store & raw chess resources
│   ├── requirements.txt   # Python dependencies
│   └── Dockerfile
│
├── frontend/              # Next.js (React) client
│   └── README.md          # Instructions to bootstrap UI
│
├── docker-compose.yml     # Multi-service orchestration
└── .env.example           # Environment variable template
```

---

## Quick Start (Development)

```powershell
# 1. Clone repo and cd into project root
# 2. Copy env vars
cp .env.example .env
# 3. Build and start services
docker compose up --build
```

The backend will be served at `http://localhost:8000` and the Next.js frontend (after you scaffold it) at `http://localhost:3000`.

---

## Step-by-Step Setup Guide

### 1. Backend (FastAPI + LangChain)
1. Install python deps: `pip install -r backend/requirements.txt`
2. Add your OpenAI (or other LLM) key to `.env`.
3. Run dev server: `uvicorn app.main:app --reload --port 8000` from `backend`.

### 2. RAG Pipeline
1. Place chess books/PGNs under `backend/data/resources`.
2. Create an ingestion script to chunk, embed, and store in FAISS (see `app/models/rag.py`).
3. The RAG retriever is wired into the `ChessAgent`.

### 3. Frontend (Next.js)
1. From project root: `npx create-next-app@latest frontend --typescript --eslint --use-npm`.
2. Install chessboard UI lib, e.g. `npm i react-chessboard`.
3. Implement components to call the backend endpoints and render board/evaluations.

### 4. Deployment
* Build containers: `docker compose build`.
* Push to your registry (Docker Hub / GHCR).
* Deploy on Render / AWS / DigitalOcean or any container host.

---

## API Endpoints (initial draft)

| Method | Path            | Body                          | Purpose                       |
|--------|-----------------|-------------------------------|-------------------------------|
| POST   | /chat/          | `{ message, history[] }`      | Chat with AI                  |
| POST   | /evaluate/      | `{ fen }`                     | Static evaluation of position |
| POST   | /recommend/     | `{ fen, history_pgn? }`       | Best move suggestion          |

---

## Roadmap

- [ ] Improve evaluation using a chess engine (e.g., Stockfish)
- [ ] Fine-tune prompts for openings/endgames
- [ ] Realtime websocket support for live games
- [ ] Frontend polish & themes

---

## License

MIT 