"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Send, Sparkles } from "lucide-react";
import type { ChatMessage, SavedIdea } from "@/lib/types";
import { loadChat, saveChat } from "@/lib/store";

const SUGGESTIONS = [
  "What's the riskiest assumption here?",
  "How would you get the first 10 paying customers?",
  "Is the pricing too low?",
  "What should I build in week one?",
];

export default function ChatPanel({ idea }: { idea: SavedIdea }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages(loadChat(idea.id));
  }, [idea.id]);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, sending]);

  async function send(text: string) {
    const content = text.trim();
    if (!content || sending) return;
    const next: ChatMessage[] = [...messages, { role: "user", content }];
    setMessages(next);
    saveChat(idea.id, next);
    setInput("");
    setSending(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ideaTitle: idea.title,
          reportJson: JSON.stringify(idea.report),
          messages: next,
        }),
      });
      const { reply } = await res.json();
      const done: ChatMessage[] = [
        ...next,
        { role: "assistant", content: reply ?? "Sorry, something went wrong." },
      ];
      setMessages(done);
      saveChat(idea.id, done);
    } catch {
      setMessages([
        ...next,
        { role: "assistant", content: "Network error — try again." },
      ]);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="glass flex h-[36rem] flex-col rounded-3xl">
      <div className="flex items-center gap-3 border-b border-(--card-border) px-6 py-4">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-accent-2 text-white">
          <Sparkles size={16} />
        </span>
        <div>
          <h2 className="font-bold leading-tight">AI Startup Advisor</h2>
          <p className="text-xs text-muted">
            Has full context of this validation report
          </p>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-6">
        {messages.length === 0 && (
          <div className="space-y-2">
            <p className="text-sm text-muted">
              Ask anything about this idea. Try:
            </p>
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                className="btn-ghost block w-full px-4 py-2.5 text-left text-sm !rounded-2xl"
              >
                {s}
              </button>
            ))}
          </div>
        )}
        {messages.map((m, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                m.role === "user"
                  ? "bg-gradient-to-br from-accent to-accent-2 text-white"
                  : "border border-(--card-border) bg-(--card)"
              }`}
            >
              {m.content}
            </div>
          </motion.div>
        ))}
        {sending && (
          <div className="flex justify-start">
            <div className="flex items-center gap-1.5 rounded-2xl border border-(--card-border) bg-(--card) px-4 py-3">
              {[0, 1, 2].map((d) => (
                <motion.span
                  key={d}
                  className="h-1.5 w-1.5 rounded-full bg-accent"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1, repeat: Infinity, delay: d * 0.2 }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="flex gap-2 border-t border-(--card-border) p-4"
      >
        <input
          className="input-glass flex-1"
          placeholder="Ask about this startup…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          type="submit"
          disabled={!input.trim() || sending}
          className="btn-primary h-12 w-12 shrink-0 !rounded-2xl !p-0"
          aria-label="Send"
        >
          <Send size={17} />
        </button>
      </form>
    </div>
  );
}
