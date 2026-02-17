import React from "react";
import type { ResumeData, ResumeSection, ResumeBulletEntry, SubRole } from "@/lib/resumeSchema";

export type ResumeFontFamily = "times" | "georgia" | "arial" | "helvetica" | "calibri";

export interface ResumeStyleSettings {
  fontFamily: ResumeFontFamily;
  baseFontSizePt: number;
  lineHeight: number;
  headingSpacingPx: number;
  entrySpacingPx: number;
}

export const DEFAULT_RESUME_STYLE: ResumeStyleSettings = {
  fontFamily: "times",
  baseFontSizePt: 10,
  lineHeight: 1.35,
  headingSpacingPx: 10,
  entrySpacingPx: 8,
};

interface ResumeTemplateProps {
  data: ResumeData;
  className?: string;
  styleSettings?: Partial<ResumeStyleSettings>;
}

function getFontClass(fontFamily: ResumeFontFamily): string {
  if (fontFamily === "georgia") return "font-['Georgia',_serif]";
  if (fontFamily === "arial") return "font-['Arial',_sans-serif]";
  if (fontFamily === "helvetica") return "font-['Helvetica',_Arial,_sans-serif]";
  if (fontFamily === "calibri") return "font-['Calibri',_Arial,_sans-serif]";
  return "font-['Times_New_Roman',_'Times',_serif]";
}

function BulletList({
  bullets,
  style,
}: {
  bullets: string[];
  style: ResumeStyleSettings;
}) {
  if (bullets.length === 0) return null;
  return (
    <ul className="mt-[1px] mb-[2px] pl-[18px] list-none">
      {bullets.map((bullet, i) => (
        <li
          key={i}
          className="relative pl-[2px] mb-[1px]"
          style={{ fontSize: `${style.baseFontSizePt}pt`, lineHeight: style.lineHeight }}
        >
          <span
            className="absolute -left-[14px] top-0"
            style={{
              fontSize: `${Math.max(6, style.baseFontSizePt - 3)}pt`,
              lineHeight: style.lineHeight,
            }}
          >
            ●
          </span>
          {bullet}
        </li>
      ))}
    </ul>
  );
}

function SubRoleBlock({ subRole, style }: { subRole: SubRole; style: ResumeStyleSettings }) {
  return (
    <div className="mt-[2px]">
      <p
        className="italic font-medium"
        style={{ fontSize: `${style.baseFontSizePt}pt`, lineHeight: style.lineHeight }}
      >
        {subRole.title}
      </p>
      <BulletList bullets={subRole.bullets} style={style} />
    </div>
  );
}

function EntryBlock({
  entry,
  style,
  isLast,
}: {
  entry: ResumeBulletEntry;
  style: ResumeStyleSettings;
  isLast: boolean;
}) {
  return (
    <div className="mt-[4px]" style={{ marginBottom: isLast ? 0 : style.entrySpacingPx }}>
      <div className="flex items-baseline justify-between gap-4">
        <p
          className="font-bold"
          style={{ fontSize: `${style.baseFontSizePt + 0.5}pt`, lineHeight: style.lineHeight }}
        >
          {entry.title}
        </p>
        {entry.dateRange && (
          <p
            className="whitespace-nowrap shrink-0"
            style={{ fontSize: `${style.baseFontSizePt}pt`, lineHeight: style.lineHeight }}
          >
            {entry.dateRange}
          </p>
        )}
      </div>
      <BulletList bullets={entry.bullets} style={style} />
      {entry.subRoles?.map((sub, i) => (
        <SubRoleBlock key={i} subRole={sub} style={style} />
      ))}
    </div>
  );
}

function SectionBlock({
  section,
  style,
}: {
  section: ResumeSection;
  style: ResumeStyleSettings;
}) {
  return (
    <div style={{ marginTop: style.headingSpacingPx }}>
      {section.heading && (
        <h2
          className="font-bold uppercase leading-[1.2] border-b border-black pb-[1px] mb-[3px] tracking-wide"
          style={{ fontSize: `${style.baseFontSizePt + 1}pt` }}
        >
          {section.heading}
        </h2>
      )}

      {section.entries.map((entry, i) => (
        <EntryBlock
          key={i}
          entry={entry}
          style={style}
          isLast={i === section.entries.length - 1}
        />
      ))}

      {section.items && section.items.length > 0 && (
        <div className="mt-[2px]">
          {section.items.map((item, i) => (
            <p
              key={i}
              style={{ fontSize: `${style.baseFontSizePt}pt`, lineHeight: style.lineHeight }}
            >
              {item}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ResumeTemplate({ data, className, styleSettings }: ResumeTemplateProps) {
  const { header, sections } = data;
  const style = { ...DEFAULT_RESUME_STYLE, ...styleSettings };
  const fontClass = getFontClass(style.fontFamily);

  return (
    <div
      className={`bg-white text-black ${fontClass} ${className ?? ""}`}
      style={{ fontSize: `${style.baseFontSizePt}pt`, lineHeight: style.lineHeight }}
    >
      {/* Header */}
      {header.name && (
        <h1
          className="text-center font-bold tracking-[0.08em] mb-[2px]"
          style={{
            fontSize: `${style.baseFontSizePt + 6}pt`,
            fontVariant: "small-caps",
            lineHeight: style.lineHeight,
          }}
        >
          {header.name}
        </h1>
      )}

      {header.contactItems.length > 0 && (
        <p
          className="text-center mb-[4px]"
          style={{ fontSize: `${style.baseFontSizePt - 0.5}pt`, lineHeight: style.lineHeight }}
        >
          {header.contactItems.map((item, i) => (
            <React.Fragment key={i}>
              {i > 0 && <span className="mx-[4px]">•</span>}
              <span>{item}</span>
            </React.Fragment>
          ))}
        </p>
      )}

      {/* Sections */}
      {sections.map((section, i) => (
        <SectionBlock key={i} section={section} style={style} />
      ))}
    </div>
  );
}
