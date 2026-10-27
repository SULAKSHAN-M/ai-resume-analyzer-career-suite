type TipType = "good" | "improve";

interface Tip {
  type: TipType;
  tip: string;
  explanation?: string;
}

interface FeedbackCategory {
  score: number;
  tips: Tip[];
}

interface AtsMetrics {
  score: number;
  metrics: {
    contactDetails: number;
    standardHeadings: number;
    keywordMatch: number;
    skillsMatch: number;
    experienceMatch: number;
    education: number;
    formatting: number;
    dates: number;
  };
  matchedKeywords: string[];
  missingKeywords: string[];
  detectedSkills: string[];
  targetSkills: string[];
  pageCount: number;
  wordCount: number;
  extractionOk: boolean;
  contactDetection?: {
    email: boolean;
    phone: boolean;
    linkedIn: boolean;
    github: boolean;
    portfolioOrWebsite: boolean;
    embeddedLinks: string[];
  };
  risks: string[];
}

interface SkillGap {
  existingSkills: string[];
  requestedSkills: string[];
  missingSkills: string[];
  weakSkills: string[];
  recommendedNextSkills: string[];
  learningSuggestions: string[];
}

interface ResumeSectionAnalysis {
  section: string;
  score: number;
  detected: boolean;
  strengths: string[];
  issues: string[];
  suggestions: string[];
  improvedVersion: string;
}

interface JobMatch {
  score: number;
  summary: string;
  matchedKeywords: string[];
  missingKeywords: string[];
  tips: Tip[];
}

interface Feedback {
  overallScore: number;
  summary: string;
  ATS: FeedbackCategory;
  toneAndStyle: FeedbackCategory;
  content: FeedbackCategory;
  structure: FeedbackCategory;
  skills: FeedbackCategory;
  atsMetrics?: AtsMetrics;
  skillGap?: SkillGap;
  sectionAnalysis?: ResumeSectionAnalysis[];
  jobMatch?: JobMatch;
  topFixes: string[];
  suggestedRoles: string[];
}

interface JobListing {
  id: string;
  title: string;
  company: string;
  location: string;
  snippet: string;
  description: string;
  salary: string;
  type: string;
  source: string;
  link: string;
  updated: string;
  query: string;
}

interface Resume {
  id: string;
  companyName: string;
  jobTitle: string;
  jobDescription: string;
  jobDescriptionFileName: string;
  fileName: string;
  createdAt: number;
  feedback: Feedback;
}

interface TailoredResume {
  versionLabel: string;
  targetRole: string;
  professionalSummary: string;
  skillsToHighlight: string[];
  experience: { heading: string; bullets: string[] }[];
  projects: { name: string; bullets: string[] }[];
  education: string[];
  certifications: string[];
  keywordsAdded: string[];
  missingButNotClaimed: string[];
  truthGuardNotes: string[];
  plainTextResume: string;
}

interface CoverLetter {
  subject: string;
  greeting: string;
  body: string;
  closing: string;
  fullText: string;
}

interface InterviewQuestion {
  id: string;
  category: "technical" | "behavioral" | "role" | "company";
  question: string;
  whyAsked: string;
  answerStructure: string[];
  evidenceToUse: string[];
}

interface InterviewPrep {
  roleSummary: string;
  focusAreas: string[];
  questions: InterviewQuestion[];
  questionsToAskEmployer: string[];
  finalChecklist: string[];
}

interface AnswerAssessment {
  score: number;
  verdict: string;
  strengths: string[];
  improvements: string[];
  improvedAnswer: string;
}

interface ApplicationRecord {
  id: string;
  resumeId: string | null;
  externalJobId: string;
  title: string;
  company: string;
  location: string;
  url: string;
  status: "Saved" | "Applied" | "Interview" | "Offer" | "Rejected";
  notes: string;
  nextAction: string;
  appliedAt: number | null;
  interviewAt: number | null;
  createdAt: number;
  updatedAt: number;
}

interface ResumeVersion {
  id: string;
  resumeId: string;
  label: string;
  targetJobId: string;
  targetJobTitle: string;
  targetCompany: string;
  content: TailoredResume;
  ats: AtsMetrics;
  createdAt: number;
}

interface CareerAnalytics {
  resumeReviews: number;
  resumeVersions: number;
  averageAtsScore: number;
  averageOverallScore: number;
  applicationsSubmitted: number;
  interviewsReceived: number;
  offers: number;
  statusCounts: Record<string, number>;
  trend: { createdAt: number; ats: number; overall: number }[];
  commonMissingSkills: { name: string; count: number }[];
  topTargetRoles: { name: string; count: number }[];
}
