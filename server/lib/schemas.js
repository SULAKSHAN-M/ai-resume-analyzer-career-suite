const tipSchema = {
  type: "object",
  properties: {
    type: { type: "string", enum: ["good", "improve"] },
    tip: { type: "string" },
    explanation: { type: "string" },
  },
  required: ["type", "tip"],
};

const categorySchema = {
  type: "object",
  properties: {
    score: { type: "number", minimum: 0, maximum: 100 },
    tips: { type: "array", items: tipSchema },
  },
  required: ["score", "tips"],
};

const sectionSchema = {
  type: "object",
  properties: {
    section: { type: "string" },
    score: { type: "number", minimum: 0, maximum: 100 },
    detected: { type: "boolean" },
    strengths: { type: "array", items: { type: "string" } },
    issues: { type: "array", items: { type: "string" } },
    suggestions: { type: "array", items: { type: "string" } },
    improvedVersion: { type: "string" },
  },
  required: ["section", "score", "detected", "strengths", "issues", "suggestions", "improvedVersion"],
};

export function reviewSchema(withJobMatch) {
  const properties = {
    overallScore: { type: "number", minimum: 0, maximum: 100 },
    summary: { type: "string" },
    ATS: categorySchema,
    toneAndStyle: categorySchema,
    content: categorySchema,
    structure: categorySchema,
    skills: categorySchema,
    topFixes: { type: "array", items: { type: "string" } },
    suggestedRoles: { type: "array", items: { type: "string" } },
    skillGap: {
      type: "object",
      properties: {
        existingSkills: { type: "array", items: { type: "string" } },
        requestedSkills: { type: "array", items: { type: "string" } },
        missingSkills: { type: "array", items: { type: "string" } },
        weakSkills: { type: "array", items: { type: "string" } },
        recommendedNextSkills: { type: "array", items: { type: "string" } },
        learningSuggestions: { type: "array", items: { type: "string" } },
      },
      required: [
        "existingSkills",
        "requestedSkills",
        "missingSkills",
        "weakSkills",
        "recommendedNextSkills",
        "learningSuggestions",
      ],
    },
    sectionAnalysis: { type: "array", items: sectionSchema },
  };

  const required = [
    "overallScore",
    "summary",
    "ATS",
    "toneAndStyle",
    "content",
    "structure",
    "skills",
    "topFixes",
    "suggestedRoles",
    "skillGap",
    "sectionAnalysis",
  ];

  if (withJobMatch) {
    properties.jobMatch = {
      type: "object",
      properties: {
        score: { type: "number", minimum: 0, maximum: 100 },
        summary: { type: "string" },
        matchedKeywords: { type: "array", items: { type: "string" } },
        missingKeywords: { type: "array", items: { type: "string" } },
        tips: { type: "array", items: tipSchema },
      },
      required: ["score", "summary", "matchedKeywords", "missingKeywords", "tips"],
    };
    required.push("jobMatch");
  }

  return { type: "object", properties, required };
}

export const tailorSchema = {
  type: "object",
  properties: {
    versionLabel: { type: "string" },
    targetRole: { type: "string" },
    professionalSummary: { type: "string" },
    skillsToHighlight: { type: "array", items: { type: "string" } },
    experience: {
      type: "array",
      items: {
        type: "object",
        properties: {
          heading: { type: "string" },
          bullets: { type: "array", items: { type: "string" } },
        },
        required: ["heading", "bullets"],
      },
    },
    projects: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          bullets: { type: "array", items: { type: "string" } },
        },
        required: ["name", "bullets"],
      },
    },
    education: { type: "array", items: { type: "string" } },
    certifications: { type: "array", items: { type: "string" } },
    keywordsAdded: { type: "array", items: { type: "string" } },
    missingButNotClaimed: { type: "array", items: { type: "string" } },
    truthGuardNotes: { type: "array", items: { type: "string" } },
    plainTextResume: { type: "string" },
  },
  required: [
    "versionLabel",
    "targetRole",
    "professionalSummary",
    "skillsToHighlight",
    "experience",
    "projects",
    "education",
    "certifications",
    "keywordsAdded",
    "missingButNotClaimed",
    "truthGuardNotes",
    "plainTextResume",
  ],
};

export const coverLetterSchema = {
  type: "object",
  properties: {
    subject: { type: "string" },
    greeting: { type: "string" },
    body: { type: "string" },
    closing: { type: "string" },
    fullText: { type: "string" },
  },
  required: ["subject", "greeting", "body", "closing", "fullText"],
};

const interviewQuestionSchema = {
  type: "object",
  properties: {
    id: { type: "string" },
    category: { type: "string", enum: ["technical", "behavioral", "role", "company"] },
    question: { type: "string" },
    whyAsked: { type: "string" },
    answerStructure: { type: "array", items: { type: "string" } },
    evidenceToUse: { type: "array", items: { type: "string" } },
  },
  required: ["id", "category", "question", "whyAsked", "answerStructure", "evidenceToUse"],
};

export const interviewSchema = {
  type: "object",
  properties: {
    roleSummary: { type: "string" },
    focusAreas: { type: "array", items: { type: "string" } },
    questions: { type: "array", items: interviewQuestionSchema },
    questionsToAskEmployer: { type: "array", items: { type: "string" } },
    finalChecklist: { type: "array", items: { type: "string" } },
  },
  required: ["roleSummary", "focusAreas", "questions", "questionsToAskEmployer", "finalChecklist"],
};

export const answerAssessmentSchema = {
  type: "object",
  properties: {
    score: { type: "number", minimum: 0, maximum: 100 },
    verdict: { type: "string" },
    strengths: { type: "array", items: { type: "string" } },
    improvements: { type: "array", items: { type: "string" } },
    improvedAnswer: { type: "string" },
  },
  required: ["score", "verdict", "strengths", "improvements", "improvedAnswer"],
};
