type PdfTextItem = {
  str: string;
  transform: number[];
  width: number;
  height: number;
};

type PositionedToken = {
  text: string;
  x: number;
  y: number;
  width: number;
  fontSize: number;
};

type Line = {
  y: number;
  fontSize: number;
  text: string;
};

const BULLET_CHARS = new Set(["•", "●", "◦", "\u2022", "\u25CF", "\u25E6"]);

function normalizeTokenText(text: string): string {
  if (BULLET_CHARS.has(text)) {
    return "•";
  }
  return text.replace(/\s+/g, " ");
}

function toPositionedToken(item: PdfTextItem): PositionedToken | null {
  const rawText = normalizeTokenText(item.str ?? "");
  if (!rawText.trim()) {
    return null;
  }

  const [, , , d, e, f] = item.transform ?? [];
  const x = Number.isFinite(e) ? e : 0;
  const y = Number.isFinite(f) ? f : 0;
  const fontSize = Number.isFinite(d) ? Math.abs(d) : 12;
  const width = Number.isFinite(item.width) ? item.width : rawText.length * (fontSize * 0.5);

  return {
    text: rawText,
    x,
    y,
    width,
    fontSize,
  };
}

function buildLineText(tokens: PositionedToken[]): string {
  if (tokens.length === 0) {
    return "";
  }

  const sorted = [...tokens].sort((a, b) => a.x - b.x);
  let text = sorted[0].text.trim();
  let prev = sorted[0];

  for (let i = 1; i < sorted.length; i += 1) {
    const curr = sorted[i];
    const prevEnd = prev.x + prev.width;
    const gap = curr.x - prevEnd;
    const charWidth = Math.max(2, prev.width / Math.max(prev.text.length, 1));
    const prevText = prev.text.trim();
    const currText = curr.text.trim();
    const isWordBoundary = /[A-Za-z0-9]$/.test(prevText) && /^[A-Za-z0-9]/.test(currText);
    const isBulletBoundary = prevText === "•" || currText === "•";

    if (isBulletBoundary) {
      text += " ";
    } else if (gap > charWidth * 3) {
      text += "  ";
    } else if (gap > charWidth * 1.1 || (isWordBoundary && gap > -charWidth * 0.2)) {
      text += " ";
    }

    text += currText;
    prev = curr;
  }

  return text.trim();
}

function getMedian(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  }
  return sorted[mid];
}

function extractPageLines(items: PdfTextItem[]): Line[] {
  const tokens = items.map(toPositionedToken).filter((token): token is PositionedToken => token !== null);
  if (tokens.length === 0) {
    return [];
  }

  const sortedByVisualOrder = [...tokens].sort((a, b) => {
    if (Math.abs(b.y - a.y) > 0.25) {
      return b.y - a.y;
    }
    return a.x - b.x;
  });

  const grouped: PositionedToken[][] = [];
  for (const token of sortedByVisualOrder) {
    const lastGroup = grouped[grouped.length - 1];
    if (!lastGroup) {
      grouped.push([token]);
      continue;
    }

    const avgY = lastGroup.reduce((sum, t) => sum + t.y, 0) / lastGroup.length;
    const avgFont = lastGroup.reduce((sum, t) => sum + t.fontSize, 0) / lastGroup.length;
    const lineTolerance = Math.max(2, avgFont * 0.35);

    if (Math.abs(token.y - avgY) <= lineTolerance) {
      lastGroup.push(token);
    } else {
      grouped.push([token]);
    }
  }

  return grouped
    .map((lineTokens) => {
      const y = lineTokens.reduce((sum, t) => sum + t.y, 0) / lineTokens.length;
      const fontSize = lineTokens.reduce((sum, t) => sum + t.fontSize, 0) / lineTokens.length;
      const text = buildLineText(lineTokens);
      return { y, fontSize, text };
    })
    .filter((line) => line.text.length > 0);
}

function linesToText(lines: Line[]): string {
  if (lines.length === 0) {
    return "";
  }

  const sorted = [...lines].sort((a, b) => b.y - a.y);
  const gaps: number[] = [];
  for (let i = 0; i < sorted.length - 1; i += 1) {
    const gap = sorted[i].y - sorted[i + 1].y;
    if (gap > 0.5) {
      gaps.push(gap);
    }
  }

  const baselineGap = getMedian(gaps) || 12;
  const paragraphBreakGap = baselineGap * 1.65;
  const output: string[] = [];

  for (let i = 0; i < sorted.length; i += 1) {
    const line = sorted[i];
    if (/^--\s*\d+\s+of\s+\d+\s*--$/i.test(line.text)) {
      continue;
    }
    output.push(line.text);

    if (i < sorted.length - 1) {
      const next = sorted[i + 1];
      const gap = line.y - next.y;
      if (gap >= paragraphBreakGap) {
        output.push("");
      }
    }
  }

  return output.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

export async function extractPdfTextFromBuffer(buffer: Buffer): Promise<string> {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");

  const loadingTask = pdfjs.getDocument({
    data: new Uint8Array(buffer),
    useWorkerFetch: false,
    isEvalSupported: false,
    disableFontFace: true,
  });

  const doc = await loadingTask.promise;
  const pages: string[] = [];

  for (let pageNumber = 1; pageNumber <= doc.numPages; pageNumber += 1) {
    const page = await doc.getPage(pageNumber);
    const textContent = await page.getTextContent();
    const items: PdfTextItem[] = textContent.items
      .map((item) => {
        if (!("str" in item)) {
          return null;
        }

        return {
          str: item.str,
          transform: Array.isArray(item.transform) ? item.transform : [],
          width: typeof item.width === "number" ? item.width : 0,
          height: typeof item.height === "number" ? item.height : 0,
        };
      })
      .filter((item): item is PdfTextItem => item !== null);

    const lines = extractPageLines(items);
    const pageText = linesToText(lines);
    if (pageText) {
      pages.push(pageText);
    }
  }

  return pages.join("\n\n");
}

