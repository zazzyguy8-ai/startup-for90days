import { NextResponse } from "next/server";
import OpenAI from "openai";
import { mockBuildSection } from "@/lib/build-mock";
import { BUILD_SYSTEM_PROMPT, buildKitSectionPrompt } from "@/lib/prompts";
import type { BuildSectionId, IdeaInput, ValidationReport } from "@/lib/types";

export const maxDuration = 120;

const SECTIONS: BuildSectionId[] = [
  "blueprint",
  "tasks",
  "project",
  "code",
  "prompts",
  "pages",
  "launch",
];

interface BuildBody {
  section: BuildSectionId;
  input: IdeaInput;
  report: ValidationReport;
}

export async function POST(req: Request) {
  let body: BuildBody;
  try {
    body = (await req.json()) as BuildBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  if (!SECTIONS.includes(body.section) || !body.input?.idea || !body.report) {
    return NextResponse.json(
      { error: "section, input and report are required" },
      { status: 400 }
    );
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({
      section: body.section,
      data: mockBuildSection(body.section, body.input, body.report),
      demo: true,
    });
  }

  try {
    const openai = new OpenAI({ apiKey });
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: BUILD_SYSTEM_PROMPT },
        {
          role: "user",
          content: buildKitSectionPrompt(
            body.section,
            body.input,
            JSON.stringify(body.report)
          ),
        },
      ],
      temperature: 0.6,
    });
    const raw = completion.choices[0]?.message?.content ?? "";
    let data: unknown = JSON.parse(raw);
    // Some sections are arrays; JSON mode wraps them in an object.
    if (
      (body.section === "tasks" ||
        body.section === "code" ||
        body.section === "prompts") &&
      !Array.isArray(data)
    ) {
      const obj = data as Record<string, unknown>;
      const firstArray = Object.values(obj).find(Array.isArray);
      if (firstArray) data = firstArray;
    }
    return NextResponse.json({ section: body.section, data, demo: false });
  } catch (err) {
    console.error(`Build section "${body.section}" failed, using demo:`, err);
    return NextResponse.json({
      section: body.section,
      data: mockBuildSection(body.section, body.input, body.report),
      demo: true,
    });
  }
}
