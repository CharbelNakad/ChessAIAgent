"use client";
import { useEvaluate, useRecommend, useGameContext } from "./GameProvider";

interface Props {
  fen: string | null;
}

export default function EvalPanel({ fen }: Props) {
  const { elo, setElo, coachEnabled, setCoachEnabled } = useGameContext();
  const evalQuery = useEvaluate(fen);
  const recommendQuery = useRecommend(fen, 15, elo);

  return (
    <div className="p-4 border rounded-md bg-gray-50 w-full">
      <h2 className="text-lg font-bold mb-2">Analysis</h2>

      {/* ELO Slider */}
      <div className="mb-4">
        <label htmlFor="elo" className="block text-sm font-medium text-gray-700">
          Bot ELO: {elo}
        </label>
        <input
          id="elo"
          type="range"
          min="600"
          max="3200"
          step="100"
          value={elo}
          onChange={(e) => setElo(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
      </div>

      {/* Coach toggle */}
      <label className="flex items-center gap-2 mb-4 text-sm">
        <input
          type="checkbox"
          checked={coachEnabled}
          onChange={(e) => setCoachEnabled(e.target.checked)}
        />
        Enable AI coach explanations
      </label>

      {evalQuery.isLoading && <p>Loading evaluation...</p>}
      {evalQuery.data && (
        <div>
          <p>
            <strong>Score:</strong> {evalQuery.data.score_cp} (cp)
          </p>
          <p>
            <strong>Best Move:</strong> {evalQuery.data.best_move}
          </p>
          <p>
            <strong>PV:</strong> {evalQuery.data.pv}
          </p>
        </div>
      )}

      {recommendQuery.isLoading && <p>Getting recommendation...</p>}
      {recommendQuery.data && (
        <div className="mt-4">
          <h3 className="font-bold">Recommendation (ELO: {elo})</h3>
          <p>
            <strong>Move:</strong> {recommendQuery.data.move}
          </p>
          {coachEnabled && (
            <p>
              <strong>Analysis:</strong> {recommendQuery.data.analysis}
            </p>
          )}
        </div>
      )}
    </div>
  );
} 