import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";

const STOP_WORDS = new Set(
  "a an and are as at be by for from has have in into is it its of on or our that the their this to using with will you your we they them who role job work working candidate candidates required requirements responsibilities experience knowledge skills skill ability strong good plus added advantage preferred should must years year".split(" "),
);

const SKILLS = [
  "javascript", "typescript", "react", "next.js", "node.js", "express", "html", "css", "bootstrap",
  "python", "java", "c#", ".net", "asp.net", "php", "sql", "mysql", "postgresql", "mongodb", "sqlite",
  "git", "github", "docker", "kubernetes", "aws", "azure", "linux", "windows", "microsoft 365", "entra id",
  "rest api", "api testing", "postman", "selenium", "cypress", "playwright", "manual testing", "automation testing",
  "test cases", "bug tracking", "jira", "agile", "scrum", "waterfall", "sdlc", "stlc", "business analysis",
  "requirements gathering", "wireframing", "figma", "ui/ux", "machine learning", "artificial intelligence", "rag",
  "llm", "generative ai", "data analysis", "power bi", "excel", "odoo", "erp", "ci/cd", "networking", "dns",
  "dhcp", "vpn", "firebase", "flutter", "dart", "three.js", "vite", "cloud", "troubleshooting",
];

const ACTION_VERBS = [
  "built", "developed", "designed", "implemented", "created", "delivered", "improved", "reduced", "increased",
  "managed", "led", "coordinated", "tested", "automated", "analyzed", "supported", "deployed", "integrated",
  "optimized", "resolved", "maintained", "configured", "documented", "collaborated", "engineered",
];

function clean(text) {
  return String(text ?? "").replace(/\u0000/g, " ").replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
}

const PDFJS_ERRORS_ONLY = 0;

function textFromPageItems(items) {
  const parts = [];
  let line = [];

  for (const item of items) {
    if (!("str" in item)) continue;

    const value = String(item.str ?? "").trim();
    if (value) line.push(value);

    // PDF.js marks many visual line endings on text items. Keeping them makes
    // ATS section headings/dates much easier to detect than flattening the
    // entire page into one long line.
    if (item.hasEOL) {
      if (line.length) parts.push(line.join(" "));
      line = [];
    }
  }

  if (line.length) parts.push(line.join(" "));
  return parts.join("\n");
}

export async function extractPdfText(buffer) {
  let doc = null;

  try {
    const task = getDocument({
      data: new Uint8Array(buffer),
      isEvalSupported: false,
      useSystemFonts: true,
      stopAtErrors: false,

      // Some perfectly readable CV PDFs contain malformed/unused TrueType
      // hinting functions. PDF.js can safely continue, but its default warning
      // level prints messages such as:
      //   TT: undefined function: 21
      //   TT: invalid function id: 136
      // Errors-only verbosity suppresses that font noise without hiding real
      // extraction failures, which are still caught and logged below.
      verbosity: PDFJS_ERRORS_ONLY,
    });

    doc = await task.promise;
    const pages = [];
    const links = new Set();

    for (let pageNumber = 1; pageNumber <= doc.numPages; pageNumber += 1) {
      const page = await doc.getPage(pageNumber);
      try {
        const [content, annotations] = await Promise.all([
          page.getTextContent(),
          page.getAnnotations({ intent: "display" }),
        ]);
        pages.push(textFromPageItems(content.items));

        // Word/Canva often stores a URL only as a PDF link annotation while
        // the visible text is merely "LinkedIn", "GitHub", or "Portfolio".
        // Collect those annotation targets so ATS contact detection sees the
        // real destination rather than relying only on extracted text.
        for (const annotation of annotations ?? []) {
          if (annotation?.subtype !== "Link") continue;
          const value = String(annotation.url ?? annotation.unsafeUrl ?? "").trim();
          if (/^(?:https?:\/\/|mailto:)/i.test(value)) links.add(value);
        }
      } finally {
        page.cleanup();
      }
    }

    const text = clean(pages.join("\n\n"));
    return {
      text,
      links: [...links],
      pageCount: doc.numPages,
      extractionOk: text.length > 0,
    };
  } catch (error) {
    // Keep genuine parser errors visible. Only PDF.js's internal non-fatal font
    // warnings are silenced by the per-document verbosity setting above.
    console.warn("[ATS] PDF text extraction failed:", error?.message ?? error);
    return { text: "", links: [], pageCount: 0, extractionOk: false };
  } finally {
    if (doc) {
      try {
        await doc.destroy();
      } catch {
        // Cleanup failure should never turn a successful ATS read into an error.
      }
    }
  }
}

function tokens(text) {
  return clean(text)
    .toLowerCase()
    .replace(/[^a-z0-9+#./\- ]+/g, " ")
    .split(/\s+/)
    .filter((word) => word.length >= 2 && !STOP_WORDS.has(word));
}

function unique(items) {
  return [...new Set(items)];
}

function percentage(found, total) {
  if (!total) return 0;
  return Math.round((found / total) * 100);
}

function findSkills(text) {
  const haystack = clean(text).toLowerCase();
  return SKILLS.filter((skill) => haystack.includes(skill));
}

function extractKeywords(text, max = 24) {
  const haystack = clean(text).toLowerCase();
  const skillHits = findSkills(haystack);
  const freq = new Map();
  for (const token of tokens(haystack)) {
    if (token.length < 3 || /^\d+$/.test(token)) continue;
    freq.set(token, (freq.get(token) ?? 0) + 1);
  }
  const frequent = [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([word]) => word)
    .filter((word) => !skillHits.some((skill) => skill.includes(word)))
    .slice(0, Math.max(0, max - skillHits.length));
  return unique([...skillHits, ...frequent]).slice(0, max);
}

function section(text, headings, nextHeadings) {
  const lower = text.toLowerCase();
  let start = -1;
  for (const heading of headings) {
    const index = lower.search(new RegExp(`(^|\\n)\\s*${heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*(:|\\n|$)`, "i"));
    if (index >= 0 && (start === -1 || index < start)) start = index;
  }
  if (start < 0) return "";
  let end = text.length;
  const tail = lower.slice(start + 1);
  for (const heading of nextHeadings) {
    const index = tail.search(new RegExp(`\\n\\s*${heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*(:|\\n|$)`, "i"));
    if (index >= 0) end = Math.min(end, start + 1 + index);
  }
  return text.slice(start, end);
}

function headingScore(text) {
  const lower = text.toLowerCase();
  const groups = [
    ["experience", "work experience", "employment", "professional experience"],
    ["education", "academic background", "qualifications"],
    ["skills", "technical skills", "core skills", "competencies"],
    ["summary", "profile", "professional summary", "objective"],
    ["projects", "project experience", "academic projects"],
  ];
  const found = groups.map((variants) => variants.some((h) => lower.includes(h)));
  return { score: percentage(found.filter(Boolean).length, groups.length), found };
}

function dateHealth(text) {
  const yearHits = text.match(/\b(?:19|20)\d{2}\b/g) ?? [];
  const monthHits = text.match(/\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\b/gi) ?? [];
  if (yearHits.length >= 4 || (yearHits.length >= 2 && monthHits.length >= 2)) return 100;
  if (yearHits.length >= 2) return 75;
  if (yearHits.length === 1) return 45;
  return 15;
}

function formattingScore(text, pageCount, extractionOk) {
  if (!extractionOk || !text) return { score: 20, risks: ["The PDF text could not be reliably extracted by the local ATS parser."] };
  const words = tokens(text).length;
  let score = 100;
  const risks = [];
  if (pageCount > 3) {
    score -= 22;
    risks.push(`The resume is ${pageCount} pages; many early-career resumes scan better at 1–2 pages.`);
  } else if (pageCount === 3) {
    score -= 8;
    risks.push("The resume is 3 pages; check whether every section is necessary.");
  }
  if (words < 180) {
    score -= 18;
    risks.push("Very little machine-readable text was detected.");
  }
  if (words > 1400) {
    score -= 18;
    risks.push("The resume is text-heavy, which can reduce scanability.");
  }
  const strange = (text.match(/[■□◆◇�]/g) ?? []).length;
  if (strange >= 3) {
    score -= 18;
    risks.push("Unusual glyphs were detected; icons or custom bullets may not parse cleanly.");
  }
  if ((text.match(/\|/g) ?? []).length > 12) {
    score -= 12;
    risks.push("Many table-like separators were detected; multi-column/table layouts can confuse parsers.");
  }
  return { score: Math.max(0, score), risks };
}

export function computeAtsScore({ resumeText, detectedLinks = [], pageCount = 0, extractionOk = true, jobDescriptionText = "", jobTitle = "" }) {
  const text = clean(resumeText);
  const lower = text.toLowerCase();
  const normalizedLinks = unique(
    (Array.isArray(detectedLinks) ? detectedLinks : [])
      .map((link) => String(link ?? "").trim())
      .filter(Boolean),
  );
  const contactArea = text.slice(0, 1600);
  const hasEmail = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(text) || normalizedLinks.some((link) => /^mailto:/i.test(link));
  const hasPhone = /(?:\+?\d[\d ()-]{7,}\d)/.test(text);

  const hasLinkedIn =
    /linkedin\.com/i.test(text) ||
    normalizedLinks.some((link) => /(?:^|\.)linkedin\.com(?:\/|$)/i.test(link)) ||
    /\blinked\s*in\b/i.test(contactArea);
  const hasGitHub =
    /github\.com/i.test(text) ||
    normalizedLinks.some((link) => /(?:^|\.)github\.com(?:\/|$)/i.test(link)) ||
    /\bgithub\b/i.test(contactArea);
  const hasPortfolio =
    /(?:https?:\/\/|www\.)/i.test(text) ||
    normalizedLinks.some((link) => /^https?:\/\//i.test(link) && !/(?:^|\.)(?:linkedin|github)\.com(?:\/|$)/i.test(link)) ||
    /\b(?:portfolio|personal website|website|web portfolio)\b/i.test(contactArea);
  const hasLink = hasLinkedIn || hasGitHub || hasPortfolio || normalizedLinks.some((link) => /^https?:\/\//i.test(link));
  const contactScore = Math.round((hasEmail ? 40 : 0) + (hasPhone ? 35 : 0) + (hasLink ? 25 : 0));

  const headings = headingScore(text);
  const resumeSkills = findSkills(text);
  const targetText = clean(`${jobTitle}\n${jobDescriptionText}`);
  const targetSkills = findSkills(targetText);
  const targetKeywords = extractKeywords(targetText || jobTitle, 24);
  const matchedKeywords = targetKeywords.filter((keyword) => lower.includes(keyword.toLowerCase()));
  const missingKeywords = targetKeywords.filter((keyword) => !lower.includes(keyword.toLowerCase()));

  const keywordScore = targetKeywords.length ? percentage(matchedKeywords.length, targetKeywords.length) : Math.min(100, 45 + resumeSkills.length * 4);
  const matchedSkills = targetSkills.filter((skill) => resumeSkills.includes(skill));
  const skillsScore = targetSkills.length ? percentage(matchedSkills.length, targetSkills.length) : Math.min(100, 45 + resumeSkills.length * 5);

  const experienceText = section(
    text,
    ["experience", "work experience", "employment", "professional experience"],
    ["education", "skills", "projects", "certifications", "references"],
  );
  const actionCount = ACTION_VERBS.filter((verb) => experienceText.toLowerCase().includes(verb)).length;
  const expKeywordMatches = targetKeywords.filter((keyword) => experienceText.toLowerCase().includes(keyword.toLowerCase())).length;
  let experienceScore = experienceText ? 45 : 20;
  experienceScore += Math.min(25, actionCount * 4);
  if (targetKeywords.length) experienceScore += Math.round(30 * (expKeywordMatches / targetKeywords.length));
  else experienceScore += Math.min(30, (experienceText.match(/\b\d+(?:%|\+)?\b/g) ?? []).length * 5);
  experienceScore = Math.min(100, experienceScore);

  const hasEducationHeading = /\b(education|academic background|qualifications)\b/i.test(text);
  const hasQualification = /\b(bachelor|b\.?(sc|eng|tech)|degree|diploma|hnd|higher national|master|msc|certificat|university|college|institute)\b/i.test(text);
  const educationScore = hasEducationHeading && hasQualification ? 100 : hasEducationHeading || hasQualification ? 65 : 20;

  const formatting = formattingScore(text, pageCount, extractionOk);
  const datesScore = dateHealth(text);
  const formattingWithDates = Math.round(formatting.score * 0.7 + datesScore * 0.3);

  const weights = {
    contact: 0.12,
    headings: 0.12,
    keywordMatch: 0.18,
    skillsMatch: 0.18,
    experienceMatch: 0.18,
    education: 0.08,
    formatting: 0.12,
  };

  const overall = Math.round(
    contactScore * weights.contact +
      headings.score * weights.headings +
      keywordScore * weights.keywordMatch +
      skillsScore * weights.skillsMatch +
      experienceScore * weights.experienceMatch +
      educationScore * weights.education +
      formattingWithDates * weights.formatting,
  );

  const risks = [...formatting.risks];
  if (!hasEmail) risks.push("No email address was detected.");
  if (!hasPhone) risks.push("No phone number was detected.");
  if (!hasLink) risks.push("No portfolio, LinkedIn, GitHub, or web link was detected.");
  if (datesScore < 60) risks.push("Few recognizable employment/education dates were detected.");
  if (headings.score < 80) risks.push("Some standard ATS section headings appear to be missing.");

  return {
    score: Math.max(0, Math.min(100, overall)),
    metrics: {
      contactDetails: contactScore,
      standardHeadings: headings.score,
      keywordMatch: keywordScore,
      skillsMatch: skillsScore,
      experienceMatch: experienceScore,
      education: educationScore,
      formatting: formattingWithDates,
      dates: datesScore,
    },
    matchedKeywords: matchedKeywords.slice(0, 15),
    missingKeywords: missingKeywords.slice(0, 15),
    detectedSkills: resumeSkills.slice(0, 30),
    targetSkills: targetSkills.slice(0, 30),
    pageCount,
    wordCount: tokens(text).length,
    extractionOk,
    contactDetection: {
      email: hasEmail,
      phone: hasPhone,
      linkedIn: hasLinkedIn,
      github: hasGitHub,
      portfolioOrWebsite: hasPortfolio,
      embeddedLinks: normalizedLinks.slice(0, 12),
    },
    risks: unique(risks).slice(0, 10),
  };
}
