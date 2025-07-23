import { ReactNode } from "react";
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
export function useEvaluate(fen: string | null, depth: number = 15) {
  return useQuery({
    queryKey: ["evaluate", fen, depth],
    queryFn: async () => {
      if (!fen) throw new Error("Missing FEN");
      const { data } = await api.post("/evaluate/", { fen, depth });
      return data as {
        score_cp: number | null;
        mate: number | null;
        best_move: string | null;
        pv: string | null;
      };
    },
    enabled: !!fen,
    staleTime: 5_000,
  });
}

export function useRecommend(fen: string | null, depth: number = 15) {
  return useQuery({
    queryKey: ["recommend", fen, depth],
    queryFn: async () => {
      if (!fen) throw new Error("Missing FEN");
      const { data } = await api.post("/recommend/", { fen, depth });
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
// Provider component
// --------------------------------------------------
interface Props {
  children: ReactNode;
}

export default function GameProvider({ children }: Props) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
} 