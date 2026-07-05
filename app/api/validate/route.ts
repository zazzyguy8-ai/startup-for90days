import { NextResponse } from "next/server";
import OpenAI from "openai";
import { generateMockReport } from "@/lib/mock";
import {
  REPORT_SYSTEM_PROMPT,
  VERIFY_SYSTEM_PROMPT,
  buildReportPrompt,
} from "@/lib/prompts";
import type { IdeaInput, ValidationReport } from "@/lib/types";

export const maxDuration = 120;

export async function POST(req: Request) {
  let input: IdeaInput;
  try {
    input = (await req.json()) as IdeaInput;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  if (!input.idea?.trim() || !input.audience?.trim()) {
    return NextResponse.json(
      { error: "Idea and target audience are required" },
      { status: 400 }
    );
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    // Demo mode: deterministic mock report so the app works without keys.
    const report = generateMockReport(input);
    return NextResponse.json({ report, demo: true });
  }

  try {
    const openai = new OpenAI({ apiKey });
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: REPORT_SYSTEM_PROMPT },
        { role: "user", content: buildReportPrompt(input) },
      ],
      temperature: 0.7,
    });
    const raw = completion.choices[0]?.message?.content ?? "";
    let report = JSON.parse(raw) as ValidationReport;

    // Second pass: a skeptical reviewer verifies and corrects the draft
    // (scores, market sizing, generic advice). Disable with OPENAI_VERIFY=0.
    if (process.env.OPENAI_VERIFY !== "0") {
      try {
        const review = await openai.chat.completions.create({
          model: process.env.OPENAI_MODEL || "gpt-4o",
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: VERIFY_SYSTEM_PROMPT },
            {
              role: "user",
              content: `ORIGINAL BRIEF:\nIdea: ${input.idea}\nAudience: ${input.audience}\n\nDRAFT REPORT TO VERIFY:\n${raw}`,
            },
          ],
          temperature: 0.3,
        });
        const verified = review.choices[0]?.message?.content;
        if (verified) report = JSON.parse(verified) as ValidationReport;
      } catch (err) {
        console.error("Verification pass failed, keeping draft:", err);
      }
    }
    return NextResponse.json({ report, demo: false });
  } catch (err) {
    console.error("OpenAI validation failed, falling back to demo:", err);
    const report = generateMockReport(input);
    return NextResponse.json({ report, demo: true });
  }
}
