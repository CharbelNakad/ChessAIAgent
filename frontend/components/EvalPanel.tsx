"use client";
import { useEffect } from "react";
import { useEvaluate, useRecommend } from "./GameProvider";

interface Props {
  fen: string | null;
}

export default function EvalPanel({ fen }: Props) {
  const { data: evalData, isFetching: loadingEval } = useEvaluate(fen);
  const { data: recData, isFetching: loadingRec } = useRecommend(fen);

  // Optionally refetch recommendation when evaluation finished
  useEffect(() => {
    // Could implement logic to refresh recommendation when fen changes
  }, [fen]);

  if (!fen) {
    return <div className="p-4 text-gray-500">Make a move to start evaluation…</div>;
  }

  if (loadingEval || loadingRec) {
    return <div className="p-4 text-gray-500 animate-pulse">Evaluating…</div>;
  }

  const score = evalData?.score_cp;
  const mate = evalData?.mate;
  const bestMove = recData?.move || evalData?.best_move;
  const analysis = recData?.analysis || "";

  return (
    <div className="p-4 bg-gray-100 rounded-md w-full max-w-sm">
      <h2 className="text-lg font-semibold mb-2">Engine Evaluation</h2>
      {mate !== null ? (
        <div className="text-red-600 font-bold">Mate in {Math.abs(mate)}</div>
      ) : (
        <div className="text-blue-700 font-semibold">Score: {(score ?? 0) / 100}</div>
      )}
      {bestMove && (
        <div className="mt-2">
          <span className="font-semibold">Best Move:</span> {bestMove}
        </div>
      )}
      {analysis && (
        <div className="mt-2 text-sm text-gray-700 whitespace-pre-line">{analysis}</div>
      )}
      {evalData?.pv && (
        <div className="mt-2 text-xs text-gray-600">
          <span className="font-semibold">PV:</span> {evalData.pv}
        </div>
      )}
    </div>
  );
} 