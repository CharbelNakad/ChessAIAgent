"use client";

interface Props {
  scoreCp: number | null;
  mate: number | null;
}

export default function EvalBar({ scoreCp, mate }: Props) {
  // Map score to 0-100% where 0 = black winning, 100 = white winning
  let perc = 50;
  if (mate !== null) {
    perc = mate > 0 ? 100 : 0;
  } else if (scoreCp !== null) {
    const capped = Math.max(-1000, Math.min(1000, scoreCp));
    perc = 50 + (capped / 1000) * 50; // cp 0 ->50%, +1000 ->100%, -1000 ->0%
  }

  return (
    <div className="w-3 h-[560px] flex flex-col rounded overflow-hidden border">
      <div style={{ flexBasis: `${100 - perc}%` }} className="bg-black" />
      <div style={{ flexBasis: `${perc}%` }} className="bg-white" />
    </div>
  );
} 