"use client";

import type { SavedIdea, ChatMessage } from "./types";
import { getSupabase, supabaseConfigured } from "./supabase";

// Persistence abstraction: Supabase when configured + signed in,
// localStorage otherwise (demo mode).

const LS_IDEAS = "msv_ideas";
const LS_CHAT_PREFIX = "msv_chat_";

function readLocal(): SavedIdea[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(LS_IDEAS) || "[]") as SavedIdea[];
  } catch {
    return [];
  }
}

function writeLocal(ideas: SavedIdea[]) {
  localStorage.setItem(LS_IDEAS, JSON.stringify(ideas));
}

async function getUserId(): Promise<string | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const { data } = await sb.auth.getUser();
  return data.user?.id ?? null;
}

export async function listIdeas(): Promise<SavedIdea[]> {
  const uid = supabaseConfigured ? await getUserId() : null;
  if (uid) {
    const sb = getSupabase()!;
    const { data, error } = await sb
      .from("ideas")
      .select("id, title, input, report, created_at, status, industry, tags, build")
      .order("created_at", { ascending: false });
    if (!error && data) {
      return data.map((r) => ({
        id: r.id,
        title: r.title,
        input: r.input,
        report: r.report,
        createdAt: r.created_at,
        status: r.status,
        industry: r.industry,
        tags: r.tags ?? [],
        build: r.build ?? null,
      }));
    }
  }
  return readLocal().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getIdea(id: string): Promise<SavedIdea | null> {
  const ideas = await listIdeas();
  return ideas.find((i) => i.id === id) ?? null;
}

export async function saveIdea(idea: SavedIdea): Promise<void> {
  const uid = supabaseConfigured ? await getUserId() : null;
  if (uid) {
    const sb = getSupabase()!;
    const { error } = await sb.from("ideas").upsert({
      id: idea.id,
      user_id: uid,
      title: idea.title,
      input: idea.input,
      report: idea.report,
      created_at: idea.createdAt,
      status: idea.status,
      industry: idea.industry,
      tags: idea.tags,
      build: idea.build ?? null,
    });
    if (!error) return;
  }
  const ideas = readLocal().filter((i) => i.id !== idea.id);
  ideas.unshift(idea);
  writeLocal(ideas);
}

export async function deleteIdea(id: string): Promise<void> {
  const uid = supabaseConfigured ? await getUserId() : null;
  if (uid) {
    const sb = getSupabase()!;
    await sb.from("ideas").delete().eq("id", id);
  }
  writeLocal(readLocal().filter((i) => i.id !== id));
}

export async function updateIdeaStatus(id: string, status: SavedIdea["status"]) {
  const idea = await getIdea(id);
  if (!idea) return;
  idea.status = status;
  await saveIdea(idea);
}

export async function saveBuild(
  ideaId: string,
  build: SavedIdea["build"]
): Promise<void> {
  const idea = await getIdea(ideaId);
  if (!idea) return;
  idea.build = build;
  await saveIdea(idea);
}

export function loadChat(ideaId: string): ChatMessage[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(
      localStorage.getItem(LS_CHAT_PREFIX + ideaId) || "[]"
    ) as ChatMessage[];
  } catch {
    return [];
  }
}

export function saveChat(ideaId: string, messages: ChatMessage[]) {
  localStorage.setItem(LS_CHAT_PREFIX + ideaId, JSON.stringify(messages));
}

export function newId(): string {
  return (
    Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
  );
}
