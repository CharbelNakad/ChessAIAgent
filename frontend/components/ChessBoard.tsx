"use client";
import { useState, useMemo, useRef } from "react";
import dynamic from "next/dynamic";
import { Chess } from "chess.js";
import { useEvaluate, useRecommend, useGameContext } from "./GameProvider";
import EvalBar from "./EvalBar";

// `react-chessboard` generates dynamic IDs/attributes which can differ between
// server and client. Load it only on the client to avoid SSR hydration issues.
const Chessboard = dynamic(async () => (await import("react-chessboard")).Chessboard, {
  ssr: false,
});

interface Props {
  onMove: (fen: string) => void;
  fen: string;
  setFen: (fen: string) => void;
}

export default function ChessBoard({ onMove, fen, setFen }: Props) {
  const game = useRef(new Chess());
  const { effectiveElo } = useGameContext();
  const [lastMove, setLastMove] = useState<string | null>(null);
  const [orientation, setOrientation] = useState<"white" | "black">("white");
  const gradeQuery = useEvaluate(fen ?? null, 15, null, lastMove);
  const evalPosQuery = useEvaluate(fen);
  const recommendQuery = useRecommend(fen, 15, effectiveElo);

  const squareStyles = useMemo(() => {
    if (recommendQuery.data?.move) {
      try {
        const temp = new Chess(fen);
        const moveObj = temp.move(recommendQuery.data.move);
        if (moveObj) {
          return {
            [moveObj.from]: { backgroundColor: "rgba(50,205,50,0.4)" },
            [moveObj.to]: { backgroundColor: "rgba(50,205,50,0.4)" },
          } as Record<string, React.CSSProperties>;
        }
      } catch {
        /* ignore */
      }
    }
    return {};
  }, [recommendQuery.data, fen]);

  function handleDrop({ sourceSquare, targetSquare }: { sourceSquare: string; targetSquare: string | null }): boolean {
    if (!targetSquare) return false;
    const gameCopy = new Chess(game.current.fen());
    try {
      const move = gameCopy.move({ from: sourceSquare, to: targetSquare, promotion: "q" });
      if (!move) return false;
      game.current.load(gameCopy.fen());
      setLastMove(move.san);
      setFen(game.current.fen());
      onMove(game.current.fen());
      return true;
    } catch {
      return false;
    }
  }

  const boardOptions = {
    position: fen,
    boardOrientation: orientation,
    squareStyles,
    onPieceDrop: handleDrop,
    boardStyle: { width: 560, height: 560, border: 'none' },
  } as const;

  return (
    <div>
      <div className="mb-2 flex items-center gap-2">
        <button
          onClick={() => setOrientation(orientation === "white" ? "black" : "white")}
          className="px-4 py-2 rounded btn-ghost"
        >
          Flip Board
        </button>
        {evalPosQuery.data && (
          <span className="text-sm font-mono">
            {evalPosQuery.data.mate !== null
              ? `Mate in ${evalPosQuery.data.mate}`
              : ((evalPosQuery.data.score_cp ?? 0) / 100).toFixed(2)}
          </span>
        )}
      </div>
      <div className="flex">
        <Chessboard options={boardOptions} />
        {evalPosQuery.data && <EvalBar scoreCp={evalPosQuery.data.score_cp} mate={evalPosQuery.data.mate} />}
      </div>
      {gradeQuery.isLoading && lastMove && <p>Grading move...</p>}
      {gradeQuery.data && gradeQuery.data.grade && (
        <div
          className={
            {
              Brilliant: "bg-purple-500",
              Best: "bg-green-500",
              Good: "bg-green-400",
              Inaccuracy: "bg-yellow-400",
              Mistake: "bg-orange-500",
              Blunder: "bg-red-600",
            }[gradeQuery.data.grade] +
            " mt-2 inline-flex items-center gap-1 px-2 py-1 rounded text-sm font-semibold text-white"
          }
        >
          {
            {
              Brilliant: "‼",
              Best: "!",
              Good: "⭑",
              Inaccuracy: "!?",
              Mistake: "?!",
              Blunder: "??",
            }[gradeQuery.data.grade]
          }
          <span>{gradeQuery.data.grade}</span>
        </div>
      )}
    </div>
  );
} 