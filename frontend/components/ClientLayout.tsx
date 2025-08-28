"use client";
import { useState } from "react";
import ChessBoard from "./ChessBoard";
import ChatPanel from "./ChatPanel";
import EvalPanel from "./EvalPanel";
import { Chess } from "chess.js";

export default function ClientLayout() {
  const [fen, setFen] = useState(() => new Chess().fen());

  return (
    <div className="flex flex-row gap-8 w-full max-w-7xl mx-auto">
      {/* Left Column: Chessboard */}
      <div className="flex-shrink-0 w-[560px]">
        <ChessBoard onMove={setFen} fen={fen} setFen={setFen} />
      </div>
      {/* Right Column: Analysis and Chat */}
      <div className="flex flex-col gap-4 w-full overflow-y-auto">
        <EvalPanel fen={fen} />
        <ChatPanel fen={fen} />
      </div>
    </div>
  );
} 