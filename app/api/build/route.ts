import { NextResponse } from "next/server";
import OpenAI from "openai";
import { mockBuildSection } from "@/lib/build-mock";
import { mockReviseSpec } from "@/lib/project-generator";
import {
  BUILD_SYSTEM_PROMPT,
  buildKitSectionPrompt,
  buildRevisePrompt,
} from "@/lib/prompts";
import type {
  BuildSectionId,
  IdeaInput,
  ProjectSpec,
  ValidationReport,
} from "@/lib/types";

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
  section: BuildSectionId | "revise";
  input: IdeaInput;
  report: ValidationReport;
  // revise only:
  spec?: ProjectSpec;
  instruction?: string;
}

export async function POST(req: Request) {
  let body: BuildBody;
  try {
    body = (await req.json()) as BuildBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const isRevise = body.section === "revise";
  if (
    (!isRevise && !SECTIONS.includes(body.section as BuildSectionId)) ||
    !body.input?.idea ||
    !body.report ||
    (isRevise && (!body.spec || !body.instruction?.trim()))
  ) {
    return NextResponse.json(
      { error: "section, input and report are required" },
      { status: 400 }
    );
  }

  const apiKey = process.env.OPENAI_API_KEY;

  if (isRevise) {
    if (!apiKey) {
      return NextResponse.json({
        section: "revise",
        data: mockReviseSpec(body.spec!, body.instruction!),
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
            content: buildRevisePrompt(
              JSON.stringify(body.spec),
              body.instruction!,
              body.input
            ),
          },
        ],
        temperature: 0.5,
      });
      const data = JSON.parse(
        completion.choices[0]?.message?.content ?? "{}"
      ) as { spec: ProjectSpec; changes: string[] };
      if (!data.spec?.appName) throw new Error("Bad revise response");
      return NextResponse.json({ section: "revise", data, demo: false });
    } catch (err) {
      console.error("Revise failed, using demo parser:", err);
      return NextResponse.json({
        section: "revise",
        data: mockReviseSpec(body.spec!, body.instruction!),
        demo: true,
      });
    }
  }
  const section = body.section as BuildSectionId;
  if (!apiKey) {
    return NextResponse.json({
      section,
      data: mockBuildSection(section, body.input, body.report),
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
            section,
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
      (section === "tasks" || section === "code" || section === "prompts") &&
      !Array.isArray(data)
    ) {
      const obj = data as Record<string, unknown>;
      const firstArray = Object.values(obj).find(Array.isArray);
      if (firstArray) data = firstArray;
    }
    return NextResponse.json({ section, data, demo: false });
  } catch (err) {
    console.error(`Build section "${section}" failed, using demo:`, err);
    return NextResponse.json({
      section,
      data: mockBuildSection(section, body.input, body.report),
      demo: true,
    });
  }
}
