"use client";
import { useState } from "react";
import { useRecommend } from "../components/GameProvider";
import ChessBoard from "../components/ChessBoard";
import EvalPanel from "../components/EvalPanel";
import ChatPanel from "../components/ChatPanel";

export default function HomePage() {
  const [fen, setFen] = useState<string | null>(null);
  const { data: recData } = useRecommend(fen);

  return (
    <main className="min-h-screen p-4 flex flex-col items-center gap-4 bg-gray-50">
      <h1 className="text-2xl font-bold">Chess AI Coach</h1>
      <div className="flex flex-col md:flex-row gap-4">
        <ChessBoard fen={fen} bestMoveSan={recData?.move ?? null} onFenChange={setFen} />
        <EvalPanel fen={fen} />
      </div>
      <div className="w-full max-w-3xl mt-4">
        <ChatPanel fen={fen} />
      </div>
    </main>
  );
}
