import {
  ResumeData,
  ResumeHeader,
  ResumeSection,
  ResumeBulletEntry,
  SubRole,
  createEmptyResume,
} from "./resumeSchema";

const BULLET_RE = /^[•●◦\-*]\s+/;
const SECTION_HEADER_RE = /^[A-Z][A-Z&/\s]+$/;
const DATE_RE = /(?:January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Oct|Nov|Dec|Fall|Spring|Summer|Winter)\s+\d{4}/i;
const CONTACT_SEPARATORS = /[•·∙|,]\s*/;

function isSectionHeader(line: string): boolean {
  const cleaned = line.replace(/_+/g, "").trim();
  if (!cleaned || cleaned.length > 50 || cleaned.length < 3) {
    return false;
  }
  return SECTION_HEADER_RE.test(cleaned);
}

function isBulletLine(line: string): boolean {
  return BULLET_RE.test(line.trim());
}

function stripBullet(line: string): string {
  return line.trim().replace(BULLET_RE, "");
}

function hasDateRange(line: string): boolean {
  return DATE_RE.test(line);
}

function isSubRoleLine(line: string): boolean {
  const trimmed = line.trim();
  if (isBulletLine(trimmed) || isSectionHeader(trimmed)) {
    return false;
  }
  if (trimmed.includes("|") && !hasDateRange(trimmed)) {
    return true;
  }
  if (trimmed.includes("/") && !hasDateRange(trimmed) && trimmed.length < 80) {
    const words = trimmed.split(/\s+/);
    const capsWords = words.filter((w) => /^[A-Z]/.test(w));
    if (capsWords.length >= 2) {
      return true;
    }
  }
  return false;
}

function splitTitleAndDate(line: string): { title: string; dateRange: string } {
  const tabParts = line.split(/\t+/).map((p) => p.trim()).filter(Boolean);
  if (tabParts.length >= 2) {
    const last = tabParts[tabParts.length - 1];
    if (DATE_RE.test(last)) {
      return {
        title: tabParts.slice(0, -1).join(" "),
        dateRange: last,
      };
    }
  }

  const spaceParts = line.split(/\s{2,}/).map((p) => p.trim()).filter(Boolean);
  if (spaceParts.length >= 2) {
    const last = spaceParts[spaceParts.length - 1];
    if (DATE_RE.test(last)) {
      return {
        title: spaceParts.slice(0, -1).join(" "),
        dateRange: last,
      };
    }
  }

  const dateMatch = line.match(
    /(\s{2,})((?:January|February|March|April|May|June|July|August|September|October|November|December|Fall|Spring|Summer|Winter)\s+\d{4}\s*[–\-—]\s*(?:January|February|March|April|May|June|July|August|September|October|November|December|Present|Current)?\s*\d{0,4})/i
  );
  if (dateMatch && dateMatch.index !== undefined) {
    return {
      title: line.slice(0, dateMatch.index).trim(),
      dateRange: dateMatch[2].trim(),
    };
  }

  return { title: line.trim(), dateRange: "" };
}

function parseHeader(lines: string[]): { header: ResumeHeader; bodyStartIndex: number } {
  const header: ResumeHeader = { name: "", contactItems: [] };
  let bodyStartIndex = 0;

  const firstNonEmpty = lines.findIndex((l) => l.trim().length > 0);
  if (firstNonEmpty < 0) {
    return { header, bodyStartIndex: 0 };
  }

  header.name = lines[firstNonEmpty].trim();
  bodyStartIndex = firstNonEmpty + 1;

  for (let i = firstNonEmpty + 1; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    if (!trimmed) continue;

    if (isSectionHeader(trimmed)) {
      bodyStartIndex = i;
      break;
    }

    const hasContactInfo =
      trimmed.includes("@") ||
      trimmed.includes("linkedin") ||
      trimmed.includes("github") ||
      /\(\d{3}\)/.test(trimmed) ||
      /\d{3}[.\-]\d{3}[.\-]\d{4}/.test(trimmed);

    if (hasContactInfo) {
      header.contactItems = trimmed
        .split(CONTACT_SEPARATORS)
        .map((item) => item.trim())
        .filter(Boolean);
      bodyStartIndex = i + 1;
      break;
    }

    bodyStartIndex = i + 1;
    break;
  }

  return { header, bodyStartIndex };
}

function isEntryTitleLine(line: string): boolean {
  const trimmed = line.trim();
  if (isBulletLine(trimmed) || !trimmed) {
    return false;
  }
  if (hasDateRange(trimmed)) {
    return true;
  }
  if (trimmed.includes("@") && trimmed.length < 100) {
    return true;
  }
  return false;
}

export function parseResumeText(text: string): ResumeData {
  if (!text || !text.trim()) {
    return createEmptyResume();
  }

  const rawLines = text.split(/\r?\n/);
  const lines = rawLines.map((l) => {
    let cleaned = l.replace(/_+/g, (match, offset) => {
      const before = l.slice(0, offset).trim();
      return before.length > 0 && before.length < 40 ? "" : match;
    });
    cleaned = cleaned.replace(/_+$/, "").replace(/^_+/, "");
    return cleaned;
  });

  const { header, bodyStartIndex } = parseHeader(lines);

  const sections: ResumeSection[] = [];
  let currentSection: ResumeSection | null = null;
  let currentEntry: ResumeBulletEntry | null = null;
  let currentSubRole: SubRole | null = null;

  function flushSubRole() {
    if (currentSubRole && currentEntry) {
      if (!currentEntry.subRoles) {
        currentEntry.subRoles = [];
      }
      currentEntry.subRoles.push(currentSubRole);
      currentSubRole = null;
    }
  }

  function flushEntry() {
    flushSubRole();
    if (currentEntry && currentSection) {
      currentSection.entries.push(currentEntry);
      currentEntry = null;
    }
  }

  function flushSection() {
    flushEntry();
    if (currentSection) {
      sections.push(currentSection);
      currentSection = null;
    }
  }

  for (let i = bodyStartIndex; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) continue;

    if (/^--\s*\d+\s+of\s+\d+\s*--$/i.test(trimmed)) {
      continue;
    }

    if (isSectionHeader(trimmed)) {
      flushSection();
      currentSection = {
        heading: trimmed.replace(/_+/g, "").trim(),
        entries: [],
        items: [],
      };
      continue;
    }

    if (!currentSection) {
      currentSection = {
        heading: "",
        entries: [],
        items: [],
      };
    }

    if (isBulletLine(trimmed)) {
      const bulletText = stripBullet(trimmed);

      if (i + 1 < lines.length) {
        let nextIdx = i + 1;
        let fullBullet = bulletText;
        while (nextIdx < lines.length) {
          const nextLine = lines[nextIdx].trim();
          if (
            !nextLine ||
            isBulletLine(nextLine) ||
            isSectionHeader(nextLine) ||
            isEntryTitleLine(nextLine) ||
            isSubRoleLine(nextLine)
          ) {
            break;
          }
          fullBullet += " " + nextLine;
          nextIdx++;
        }
        i = nextIdx - 1;

        if (currentSubRole) {
          currentSubRole.bullets.push(fullBullet);
        } else if (currentEntry) {
          currentEntry.bullets.push(fullBullet);
        } else {
          currentSection.items = currentSection.items || [];
          currentSection.items.push(fullBullet);
        }
      } else {
        if (currentSubRole) {
          currentSubRole.bullets.push(bulletText);
        } else if (currentEntry) {
          currentEntry.bullets.push(bulletText);
        } else {
          currentSection.items = currentSection.items || [];
          currentSection.items.push(bulletText);
        }
      }
      continue;
    }

    if (isEntryTitleLine(trimmed)) {
      flushEntry();
      const { title, dateRange } = splitTitleAndDate(trimmed);
      currentEntry = {
        title,
        dateRange,
        bullets: [],
      };
      continue;
    }

    if (currentEntry && isSubRoleLine(trimmed)) {
      flushSubRole();
      currentSubRole = {
        title: trimmed,
        bullets: [],
      };
      continue;
    }

    if (currentSection) {
      currentSection.items = currentSection.items || [];
      currentSection.items.push(trimmed);
    }
  }

  flushSection();

  return { header, sections };
}

export function resumeDataToText(data: ResumeData): string {
  const lines: string[] = [];

  if (data.header.name) {
    lines.push(data.header.name);
  }
  if (data.header.contactItems.length > 0) {
    lines.push(data.header.contactItems.join(" • "));
  }

  for (const section of data.sections) {
    lines.push("");
    if (section.heading) {
      lines.push(section.heading);
    }

    for (const entry of section.entries) {
      const titleLine = entry.dateRange
        ? `${entry.title}  ${entry.dateRange}`
        : entry.title;
      lines.push(titleLine);

      for (const bullet of entry.bullets) {
        lines.push(`• ${bullet}`);
      }

      if (entry.subRoles) {
        for (const sub of entry.subRoles) {
          lines.push(sub.title);
          for (const bullet of sub.bullets) {
            lines.push(`• ${bullet}`);
          }
        }
      }
    }

    if (section.items && section.items.length > 0) {
      for (const item of section.items) {
        lines.push(item);
      }
    }
  }

  return lines.join("\n").trim();
}
