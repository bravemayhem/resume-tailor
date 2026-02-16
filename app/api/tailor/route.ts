import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { apiKey, masterResume, jobDescription } = await req.json();

    const apiKeyToUse = apiKey || process.env.ANTHROPIC_API_KEY;

    if (!apiKeyToUse) {
      return NextResponse.json({ error: "API Key is required" }, { status: 400 });
    }

    if (!masterResume || !jobDescription) {
      return NextResponse.json({ error: "Master Resume and Job Description are required" }, { status: 400 });
    }

    const anthropic = new Anthropic({
      apiKey: apiKeyToUse,
    });

    const msg = await anthropic.messages.create({
      model: "claude-3-sonnet-20240229",
      max_tokens: 4000,
      temperature: 0.7,
      system: "You are an expert resume writer. Your goal is to tailor a master resume to a specific job description. You should optimize the summary, rephrase bullet points to match keywords, and reorder skills. Output ONLY the tailored resume in Markdown format. Do not include any preamble or postscript.",
      messages: [
        {
          role: "user",
          content: `Master Resume:\n${masterResume}\n\nJob Description:\n${jobDescription}\n\nPlease tailor the resume.`,
        },
      ],
    });

    const content = msg.content[0].text;
    return NextResponse.json({ content });
  } catch (error) {
    console.error("Error tailoring resume:", error);
    return NextResponse.json({ error: "Failed to tailor resume" }, { status: 500 });
  }
}
