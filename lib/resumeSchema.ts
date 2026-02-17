export interface ResumeHeader {
  name: string;
  contactItems: string[]; // e.g. ["brooklynfbeltran@gmail.com", "linkedin.com/in/brooklynfb/", "(562) 413-8770"]
}

export interface SubRole {
  title: string; // e.g. "Associate Product Manager | Google Store/Hardware"
  bullets: string[];
}

export interface ResumeBulletEntry {
  title: string; // e.g. "Founder & Product Engineer @ Bravenite"
  dateRange: string; // e.g. "January 2025 – December 2025"
  subRoles?: SubRole[];
  bullets: string[];
}

export interface ResumeSection {
  heading: string; // e.g. "WORK EXPERIENCE"
  entries: ResumeBulletEntry[];
  items?: string[]; // flat text lines for sections like SKILLS or ADDITIONAL INFO
}

export interface ResumeData {
  header: ResumeHeader;
  sections: ResumeSection[];
}

export function createEmptyResume(): ResumeData {
  return {
    header: { name: "", contactItems: [] },
    sections: [],
  };
}
