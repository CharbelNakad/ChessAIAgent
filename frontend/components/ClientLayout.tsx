"use client";
import { ReactNode } from "react";
import GameProvider from "./GameProvider";

export default function ClientLayout({ children }: { children: ReactNode }) {
  return <GameProvider>{children}</GameProvider>;
} 