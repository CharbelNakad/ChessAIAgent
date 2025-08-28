"use client";
import { ReactNode, createContext, useContext, useState } from "react";
import { QueryClient, QueryClientProvider, useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";

// --------------------------------------------------
// Determine backend URL from env or default to localhost
const BACKEND_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

// --------------------------------------------------
// Axios instance – direct to backend
const api = axios.create({ baseURL: BACKEND_BASE });

// --------------------------------------------------
// React Query client (singleton)
// --------------------------------------------------
const queryClient = new QueryClient();

// --------------------------------------------------
// Hooks
// --------------------------------------------------
export function useEvaluate(
  fen: string | null,
  depth: number = 15,
  elo: number | null = null,
  move: string | null = null,
) {
  return useQuery({
    queryKey: ["evaluate", fen, depth, elo, move],
    queryFn: async () => {
      if (!fen) throw new Error("Missing FEN");
      const { data } = await api.post("/evaluate/", { fen, depth, elo, move });
      return data as {
        score_cp: number | null;
        mate: number | null;
        best_move: string | null;
        pv: string | null;
        grade: string | null;
        grade_description: string | null;
        diff_cp: number | null;
      };
    },
    enabled: !!fen && (move === null || move !== null),
    staleTime: 5_000,
  });
}

export function useRecommend(
  fen: string | null,
  depth: number = 15,
  elo: number | null = null,
) {
  const { coachEnabled } = useGameContext();
  return useQuery({
    queryKey: ["recommend", fen, depth, elo, coachEnabled],
    queryFn: async () => {
      if (!fen) throw new Error("Missing FEN");
      const { data } = await api.post("/recommend/", { fen, depth, elo, explain: coachEnabled });
      return data as { move: string | null; analysis: string };
    },
    enabled: !!fen,
    staleTime: 5_000,
  });
}

export function useChat() {
  return useMutation({
    mutationFn: async ({ message, history, fen }: { message: string; history: string[]; fen: string | null }) => {
      const { data } = await api.post("/chat/", { message, history, fen });
      return data as { reply: string };
    },
  });
}

// --------------------------------------------------
// Context
// --------------------------------------------------
const GameContext = createContext<{
  elo: number;
  setElo: (elo: number) => void;
  effectiveElo: number; // debounced elo used for API calls
  applyElo: () => void;
  coachEnabled: boolean;
  setCoachEnabled: (v: boolean) => void;
} | null>(null);

// Custom hook to use the game context
export function useGameContext() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGameContext must be used within a GameProvider");
  }
  return context;
}

// --------------------------------------------------
// Provider component
// --------------------------------------------------
interface Props {
  children: ReactNode;
}

export default function GameProvider({ children }: Props) {
  const [elo, setElo] = useState(1600);
  const [coachEnabled, setCoachEnabled] = useState(true);
  const [effectiveElo, setEffectiveElo] = useState(1600);

  // Explicitly apply the current slider value to become the active ELO
  function applyElo() {
    setEffectiveElo(elo);
  }

  return (
    <QueryClientProvider client={queryClient}>
      <GameContext.Provider value={{ elo, setElo, effectiveElo, applyElo, coachEnabled, setCoachEnabled }}>
        {children}
      </GameContext.Provider>
    </QueryClientProvider>
  );
} 