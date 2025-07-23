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
    <div className="flex flex-col h-full max-h-[60vh] w-full border rounded-md">
      <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-white">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`p-2 rounded-md whitespace-pre-line ${
              msg.role === "user" ? "bg-blue-100 self-end" : "bg-gray-100"
            }`}
          >
            {msg.content}
          </div>
        ))}
        {chatMutation.isPending && <div className="text-gray-500">Assistant typing…</div>}
      </div>
      <form onSubmit={handleSubmit} className="p-2 border-t flex gap-2 bg-gray-50">
        <textarea
          ref={inputRef}
          className="flex-1 resize-none border rounded p-2 text-sm"
          rows={2}
          placeholder="Ask the AI coach…"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          disabled={chatMutation.isPending}
        >
          Send
        </button>
      </form>
    </div>
  );
} 