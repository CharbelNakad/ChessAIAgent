"use client";
import { FormEvent, useRef, useState } from "react";
import { useChat } from "./GameProvider";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface Props {
  fen: string | null;
}

export default function ChatPanel({ fen }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const chatMutation = useChat();

  const sendMessage = (content: string) => {
    if (!content.trim()) return;
    const newHistory = [...messages.map((m) => `${m.role}: ${m.content}`), `user: ${content}`];
    setMessages((prev) => [...prev, { role: "user", content }]);

    chatMutation.mutate(
      { message: content, history: newHistory, fen },
      {
        onSuccess: (data) => {
          setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
        },
      }
    );
  };

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const text = inputRef.current?.value || "";
    if (inputRef.current) inputRef.current.value = "";
    sendMessage(text);
  }

  return (
    <div className="flex flex-col h-full max-h-[60vh] w-full border rounded-md border-surface-3 bg-surface-2">
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`p-2 rounded-md whitespace-pre-line ${
              msg.role === "user" ? "bg-green-dark text-green-light self-end" : "bg-surface-3"
            }`}
          >
            {msg.content}
          </div>
        ))}
        {chatMutation.isPending && <div className="text-green-light">Assistant typing…</div>}
      </div>
      <form onSubmit={handleSubmit} className="p-2 border-t flex gap-2 bg-surface-3 border-green">
        <textarea
          ref={inputRef}
          className="flex-1 resize-none border rounded p-2 text-sm bg-surface-2 border-surface-3 text-foreground focus:outline-none focus:ring-2 focus:ring-green"
          rows={2}
          placeholder="Ask the AI coach…"
        />
        <button
          type="submit"
          className="btn-primary px-4 py-2 rounded disabled:opacity-50"
          disabled={chatMutation.isPending}
        >
          Send
        </button>
      </form>
    </div>
  );
} 