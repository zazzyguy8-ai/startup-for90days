import { NextResponse } from "next/server";
import OpenAI from "openai";
import { buildChatSystemPrompt } from "@/lib/prompts";
import type { ChatMessage } from "@/lib/types";

export const maxDuration = 60;

interface ChatBody {
  ideaTitle: string;
  reportJson: string;
  messages: ChatMessage[];
}

const DEMO_REPLIES = [
  "Good question. In demo mode I can't reach the AI, but here's the playbook: talk to 10 real people in your target audience this week and ask what they currently pay to solve this. Their answers matter more than any report. (Add an OPENAI_API_KEY to unlock live AI chat.)",
  "Demo mode answer: focus on the single riskiest assumption in the report — usually willingness to pay. Pre-sell before you build. Set OPENAI_API_KEY to chat with the real AI advisor.",
  "I'm running without an AI key right now. Rule of thumb: if you can't find 5 communities where your audience complains about this problem, distribution will be harder than building. Configure OPENAI_API_KEY for full answers.",
];

export async function POST(req: Request) {
  let body: ChatBody;
  try {
    body = (await req.json()) as ChatBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const messages = (body.messages ?? []).slice(-12);
  if (messages.length === 0) {
    return NextResponse.json({ error: "No messages" }, { status: 400 });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    const reply = DEMO_REPLIES[(messages.length - 1) % DEMO_REPLIES.length];
    return NextResponse.json({ reply, demo: true });
  }

  try {
    const openai = new OpenAI({ apiKey });
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o",
      messages: [
        {
          role: "system",
          content: buildChatSystemPrompt(body.ideaTitle, body.reportJson ?? ""),
        },
        ...messages,
      ],
      temperature: 0.8,
      max_tokens: 600,
    });
    const reply =
      completion.choices[0]?.message?.content ?? "Sorry, I couldn't answer that.";
    return NextResponse.json({ reply, demo: false });
  } catch (err) {
    console.error("OpenAI chat failed:", err);
    return NextResponse.json({ reply: DEMO_REPLIES[0], demo: true });
  }
}
