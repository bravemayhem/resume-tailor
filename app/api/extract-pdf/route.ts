import { NextResponse } from "next/server";
import { extractPdfTextFromBuffer } from "@/lib/server/extractPdfText";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") ?? "";
    let buffer: Buffer | null = null;

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file");

      if (!(file instanceof File)) {
        return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
      }
      if (file.type !== "application/pdf") {
        return NextResponse.json({ error: "Only PDF files are supported" }, { status: 400 });
      }

      buffer = Buffer.from(await file.arrayBuffer());
    } else {
      const { fileBase64 } = await req.json();

      if (!fileBase64) {
        return NextResponse.json({ error: "No file data provided" }, { status: 400 });
      }
      buffer = Buffer.from(fileBase64, "base64");
    }

    const text = await extractPdfTextFromBuffer(buffer);
    return NextResponse.json({ text });
  } catch (error) {
    console.error("Error extracting PDF text:", error);
    return NextResponse.json({ error: "Failed to extract text from PDF" }, { status: 500 });
  }
}
