"use client";
import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { Chess } from "chess.js";

// react-chessboard should be loaded dynamically to avoid SSR issues
const ReactChessboard = dynamic(() => import("react-chessboard").then((mod) => mod.Chessboard), {
  ssr: false,
});

interface Props {
  fen?: string | null;
  bestMoveSan?: string | null; // engine suggestion in SAN
  onFenChange?: (fen: string) => void;
}

export default function ChessBoard({ fen, bestMoveSan, onFenChange }: Props) {
  const [game, setGame] = useState(() => new Chess(fen ?? undefined));

  // Highlight engine best move (from → to style)
  const squareStyles = useMemo(() => {
    if (!bestMoveSan) return {};
    try {
      const temp = new Chess(game.fen());
      const move = temp.move(bestMoveSan as any);
      if (move) {
        return {
          [move.from]: { backgroundColor: "rgba(255,215,0,0.4)" },
          [move.to]: { backgroundColor: "rgba(50,205,50,0.4)" },
        } as Record<string, any>;
      }
    } catch {
      /* ignore */
    }
    return {};
  }, [bestMoveSan, game]);

  function handlePieceDrop({
    sourceSquare,
    targetSquare,
  }: any): boolean {
    if (!targetSquare) return false;

    console.log("DROP", sourceSquare, targetSquare);
    const gameCopy = new Chess(game.fen());
    const move = gameCopy.move({
      from: sourceSquare,
      to: targetSquare,
      promotion: "q",
    });

    if (!move) return false; // illegal → snap back

    setGame(gameCopy); // update board state
    onFenChange?.(gameCopy.fen()); // notify parent

    console.log("MOVE", move?.san);
    return !!move;
  }

  // Update board if external FEN changes (e.g., reset)
  useEffect(() => {
    if (fen && fen !== game.fen()) {
      setGame(new Chess(fen));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fen]);

  return (
    <ReactChessboard
      options={{
        position: game.fen(),
        boardStyle: { width: "500px", height: "500px" },
        squareStyles,
        allowDragging: true,
        onPieceDrop: handlePieceDrop,
      }}
    />
  );
} 