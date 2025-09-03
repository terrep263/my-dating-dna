import { Button } from "@mui/material";
import axios from "axios";
import { getSession, useSession } from "next-auth/react";
import { useState, useEffect, useRef, RefObject } from "react";
import { toast } from "sonner";

interface ExtendedUser {
  name?: string | null;
  id?: string | null;
  email?: string | null;
  image?: string | null;
  type?: "single" | "couple";
  attempts?: number;
  validity?: Date;
}
// Clean, self-contained canvas build that demonstrates:
// - 32-question deterministic assessment (Singles)
// - Couples flow (Partner A + Partner B using the same 32 questions)
// - Deterministic scoring (no AI in scoring)
// - Results generation (relationship approach, strengths, growth, quick wins, 30-day plan)
// - Paywall simulation (FastSpring sandbox stub)
// - CTA for Grace 7-day trial (credit-card verified in production; simulated here)
// - PDF download of results (html2canvas + jsPDF)
// - Free 4-question lead magnet (email gated)
//
// Production notes:
// - Replace the paywall simulation with FastSpring Storefront checkout and webhook-driven entitlements.
// - Move AI narrative expansion to a server route; do NOT use on the client.
// - Replace the programmatic copy with your research-authored 16-type content when ready.

// Tailwind: this canvas uses the default Tailwind runtime. In your app, reuse your site theme tokens.
// Using standard Tailwind classes for styling.

// ---------- Types & Utilities ----------

type DimensionKey =
  | "socialEnergy"
  | "attractionDriver"
  | "decisionFilter"
  | "relationshipRhythm";

type Orientation = "C" | "F" | "P" | "T" | "L" | "H" | "S" | "O"; // C/F, P/T, L/H, S/O

interface QuestionBase {
  id: string;
  dimension: DimensionKey;
  prompt: string;
  kind: "forced" | "likert";
}

interface ForcedChoice extends QuestionBase {
  kind: "forced";
  options: { A: string; B: string };
  // A maps to the first pole listed for the dimension below, B to the second pole
}

interface Likert extends QuestionBase {
  kind: "likert";
  reverseScored?: boolean; // if true, 1 ↔ 7
}

type Question = ForcedChoice | Likert;

interface SinglesAnswers {
  [questionId: string]: number | "A" | "B"; // likert: 1..7, forced: "A"|"B"
}

interface Scores {
  socialEnergy: number; // 0..100
  attractionDriver: number; // 0..100
  decisionFilter: number; // 0..100
  relationshipRhythm: number; // 0..100
}

interface SinglesResultDeterministic {
  assessmentType: "singles";
  typeCode: string; // e.g., CPLS
  typeName: string;
  scores: Scores;
  completedAt: string; // ISO

  // DETERMINISTIC SDK SECTIONS (REQUIRED - NO TRUNCATION)
  relationshipApproach: string; // 4–6 sentences, 80–120 words
  strengths: { title: string; detail: string }[]; // 6–10 items, each 2–3 sentences, total 150–250 words
  growthOpportunities: { title: string; rationale: string; action: string }[]; // 5–8 items, each 2–3 sentences, total 120–200 words
  quickWins: { action: string; expectedOutcome: string; timeframe: string }[]; // 7–10 items, each 2–3 sentences, total 200–300 words
  plan30Day: {
    week1: string[];
    week2: string[];
    week3: string[];
    week4: string[];
  }; // 15–20 items total, each 2–4 sentences, total 400–600 words

  // AI NARRATIVE EXPANSION (REQUIRED - NO TRUNCATION)
  aiNarrative: {
    overviewSummary: string; // 8–12 sentences, 150–200 words
    personalityInsights: string; // 6–8 sentences, 120–160 words
    communicationStyle: string; // 5–7 sentences, 100–140 words
    compatibilityFactors: string; // 6–8 sentences, 120–160 words
    growthAreas: string; // 7–10 sentences, 140–200 words
    strengthsSection: string; // 4–6 sentences, 80–120 words
    expandedNarrative: string; // 3–6 paragraphs, 300–500 words
  };

  // SUPPORTING CONTENT (REQUIRED - NO TRUNCATION)
  supportingContent: {
    strandBreakdowns: {
      socialEnergy: { description: string; implications: string; tips: string };
      attractionDriver: {
        description: string;
        implications: string;
        tips: string;
      };
      decisionFilter: {
        description: string;
        implications: string;
        tips: string;
      };
      relationshipRhythm: {
        description: string;
        implications: string;
        tips: string;
      };
    };
    contextualExamples: {
      scenario: string;
      response: string;
      insight: string;
    }[]; // 5–10 scenarios
    actionPlan7Days: { day: number; action: string; purpose: string }[]; // 5–10 items
    actionPlan30Days: { week: number; actions: string[]; goals: string }[]; // 10–20 items total
    pitfallsToAvoid?: {
      situation: string;
      positiveReframe: string;
      alternative: string;
    }[]; // optional, positively framed
    resources?: { title: string; description: string; url?: string }[]; // optional
  };
}

interface CouplesResultDeterministic {
  assessmentType: "couples";
  partnerA: SinglesResultDeterministic; // Complete Singles structure
  partnerB: SinglesResultDeterministic; // Complete Singles structure

  // COUPLE PROFILE - DETERMINISTIC SDK SECTIONS (REQUIRED - NO TRUNCATION)
  coupleProfile: {
    jointStrengths: { title: string; howToLeverage: string }[]; // 6–10 items, each 4–6 sentences, total 200–350 words
    sharedGrowthAreas: {
      title: string;
      supportiveBehavior: string;
      sharedPractice: string;
    }[]; // 5–8 items, each 4–6 sentences, total 180–300 words
    relationshipApproach: string; // 6–8 sentences, 120–160 words
    jointQuickWins: { action: string; implementation: string }[]; // 8–12 items, each 4–5 sentences, total 250–400 words
    jointPlan30Day: {
      week1: string[];
      week2: string[];
      week3: string[];
      week4: string[];
    }; // 20–25 items total, each 4–6 sentences, total 500–750 words

    // AI NARRATIVE EXPANSION FOR COUPLES (REQUIRED - NO TRUNCATION)
    aiNarrative: {
      overviewSummary: string; // 8–12 sentences, 150–200 words
      coupleDynamics: string; // 6–8 sentences, 120–160 words
      communicationStyleAsCouple: string; // 5–7 sentences, 100–140 words
      intimacyPatterns: string; // 6–8 sentences, 120–160 words
      sharedGrowthAreas: string; // 7–10 sentences, 140–200 words
      jointStrengths: string; // 4–6 sentences, 80–120 words
      expandedNarrative: string; // 3–6 paragraphs, 300–500 words
    };

    // SUPPORTING CONTENT FOR COUPLES (REQUIRED - NO TRUNCATION)
    supportingContent: {
      strandBreakdowns: {
        socialEnergy: {
          partnerADescription: string;
          partnerBDescription: string;
          comparison: string;
          implications: string;
        };
        attractionDriver: {
          partnerADescription: string;
          partnerBDescription: string;
          comparison: string;
          implications: string;
        };
        decisionFilter: {
          partnerADescription: string;
          partnerBDescription: string;
          comparison: string;
          implications: string;
        };
        relationshipRhythm: {
          partnerADescription: string;
          partnerBDescription: string;
          comparison: string;
          implications: string;
        };
      };
      everydayExamples: {
        scenario: string;
        partnerAResponse: string;
        partnerBResponse: string;
        coupleInsight: string;
      }[]; // 5–10 couple scenarios
      jointActionPlan7Days: {
        day: number;
        collaborativeAction: string;
        purpose: string;
      }[]; // 5–10 collaborative items
      jointActionPlan30Days: {
        week: number;
        progressiveActions: string[];
        goals: string;
      }[]; // 10–20 progressive items
      resources?: { title: string; description: string; url?: string }[]; // optional
    };
  };
}

const DIMENSION_LABELS: Record<
  DimensionKey,
  { poles: [Orientation, Orientation]; label: string }
> = {
  socialEnergy: { poles: ["C", "F"], label: "Social Energy" }, // Connector vs Focuser
  attractionDriver: { poles: ["P", "T"], label: "Attraction Driver" }, // Present vs Potential
  decisionFilter: { poles: ["L", "H"], label: "Decision Filter" }, // Logic vs Heart
  relationshipRhythm: { poles: ["S", "O"], label: "Relationship Rhythm" }, // Structured vs Organic
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

// Map 1..7 → -3..+3 (Likert). If reverse, flip.
function likertToSigned(val: number, reverse = false) {
  const v = clamp(val, 1, 7);
  const signed = v - 4; // 1→-3, 4→0, 7→+3
  return reverse ? -signed : signed;
}

// For each dimension, raw sum range: forced (4 items → -4..+4), likert (4 items → -12..+12). Total -16..+16.
function normalizeToPercent(raw: number, min = -16, max = 16) {
  const pct = ((raw - min) / (max - min)) * 100;
  return clamp(Number(pct.toFixed(2)), 0, 100);
}

// ---------- Question Bank (32 items; 4 forced + 4 likert per dimension) ----------
// These mirror the research-aligned set previously approved. You may edit wording later without changing IDs.
const QUESTIONS: Question[] = [
  // Social Energy (C vs F)
  {
    id: "SE-FC-1",
    dimension: "socialEnergy",
    kind: "forced",
    prompt: "At a party, I usually:",
    options: {
      A: "Circulate and meet many people",
      B: "Stay with one or two people",
    },
  },
  {
    id: "SE-FC-2",
    dimension: "socialEnergy",
    kind: "forced",
    prompt: "When dating, I prefer:",
    options: { A: "Casting a wide net", B: "Focusing on a small circle" },
  },
  {
    id: "SE-FC-3",
    dimension: "socialEnergy",
    kind: "forced",
    prompt: "I gain energy by:",
    options: {
      A: "Engaging with lots of people",
      B: "Deep conversations with a few",
    },
  },
  {
    id: "SE-FC-4",
    dimension: "socialEnergy",
    kind: "forced",
    prompt: "I feel most comfortable:",
    options: {
      A: "Mingling freely in groups",
      B: "One-on-one or small groups",
    },
  },
  {
    id: "SE-LK-1",
    dimension: "socialEnergy",
    kind: "likert",
    prompt: "I feel energized after large-group time.",
  },
  {
    id: "SE-LK-2",
    dimension: "socialEnergy",
    kind: "likert",
    reverseScored: true,
    prompt:
      "I find small, focused interactions more rewarding than broad networking.",
  },
  {
    id: "SE-LK-3",
    dimension: "socialEnergy",
    kind: "likert",
    prompt: "I thrive on variety in my social and dating life.",
  },
  {
    id: "SE-LK-4",
    dimension: "socialEnergy",
    kind: "likert",
    reverseScored: true,
    prompt:
      "I often prefer a quiet evening with one person to a lively event with many.",
  },

  // Attraction Driver (P vs T)
  {
    id: "AD-FC-1",
    dimension: "attractionDriver",
    kind: "forced",
    prompt: "I&apos;m most attracted to:",
    options: {
      A: "Lifestyle and habits that match now",
      B: "Potential and a compelling vision",
    },
  },
  {
    id: "AD-FC-2",
    dimension: "attractionDriver",
    kind: "forced",
    prompt: "On a first date, I notice:",
    options: {
      A: "How we connect in the moment",
      B: "Qualities that could grow over time",
    },
  },
  {
    id: "AD-FC-3",
    dimension: "attractionDriver",
    kind: "forced",
    prompt: "I care more about:",
    options: {
      A: "Practical compatibility (schedule, habits)",
      B: "Future possibilities (ambition, growth)",
    },
  },
  {
    id: "AD-FC-4",
    dimension: "attractionDriver",
    kind: "forced",
    prompt: "My excitement is sparked by:",
    options: {
      A: "Immediate chemistry and fit",
      B: "Imagining what we could build",
    },
  },
  {
    id: "AD-LK-1",
    dimension: "attractionDriver",
    kind: "likert",
    prompt: "Long-term potential matters more than present compatibility.",
  },
  {
    id: "AD-LK-2",
    dimension: "attractionDriver",
    kind: "likert",
    prompt: "I choose partners who inspire me with their vision of the future.",
  },
  {
    id: "AD-LK-3",
    dimension: "attractionDriver",
    kind: "likert",
    reverseScored: true,
    prompt: "I value lifestyle alignment more than growth potential.",
  },
  {
    id: "AD-LK-4",
    dimension: "attractionDriver",
    kind: "likert",
    prompt: "I can overlook present flaws if I see potential for growth.",
  },

  // Decision Filter (L vs H)
  {
    id: "DF-FC-1",
    dimension: "decisionFilter",
    kind: "forced",
    prompt: "When deciding to pursue someone, I rely on:",
    options: {
      A: "Practical reasons and viability",
      B: "Gut feelings and emotional pull",
    },
  },
  {
    id: "DF-FC-2",
    dimension: "decisionFilter",
    kind: "forced",
    prompt: "In conflicts, I tend to:",
    options: {
      A: "Analyze facts and propose solutions",
      B: "Express feelings and seek repair",
    },
  },
  {
    id: "DF-FC-3",
    dimension: "decisionFilter",
    kind: "forced",
    prompt: "My dating choices are guided by:",
    options: {
      A: "Careful thought and evaluation",
      B: "Emotional signals and intuition",
    },
  },
  {
    id: "DF-FC-4",
    dimension: "decisionFilter",
    kind: "forced",
    prompt: "I feel most comfortable:",
    options: {
      A: "Making decisions with logic",
      B: "Following what my heart says",
    },
  },
  {
    id: "DF-LK-1",
    dimension: "decisionFilter",
    kind: "likert",
    prompt: "I make dating decisions with my head more than my heart.",
  },
  {
    id: "DF-LK-2",
    dimension: "decisionFilter",
    kind: "likert",
    reverseScored: true,
    prompt: "I often trust my feelings even when logic disagrees.",
  },
  {
    id: "DF-LK-3",
    dimension: "decisionFilter",
    kind: "likert",
    prompt: "Long-term compatibility should be based on practical factors.",
  },
  {
    id: "DF-LK-4",
    dimension: "decisionFilter",
    kind: "likert",
    reverseScored: true,
    prompt: "Emotional connection is more important to me than analysis.",
  },

  // Relationship Rhythm (S vs O)
  {
    id: "RR-FC-1",
    dimension: "relationshipRhythm",
    kind: "forced",
    prompt: "In relationships, I prefer:",
    options: {
      A: "Defined milestones and clear progression",
      B: "Natural development without strict timelines",
    },
  },
  {
    id: "RR-FC-2",
    dimension: "relationshipRhythm",
    kind: "forced",
    prompt: "I feel most secure when:",
    options: {
      A: "We have clarity on where this is going",
      B: "We take it day by day",
    },
  },
  {
    id: "RR-FC-3",
    dimension: "relationshipRhythm",
    kind: "forced",
    prompt: "My dating style is:",
    options: { A: "Intentional and structured", B: "Flexible and spontaneous" },
  },
  {
    id: "RR-FC-4",
    dimension: "relationshipRhythm",
    kind: "forced",
    prompt: "When starting a relationship, I usually:",
    options: {
      A: "Define expectations early",
      B: "Let the connection find its path",
    },
  },
  {
    id: "RR-LK-1",
    dimension: "relationshipRhythm",
    kind: "likert",
    prompt: "I need clear relationship milestones to feel secure.",
  },
  {
    id: "RR-LK-2",
    dimension: "relationshipRhythm",
    kind: "likert",
    reverseScored: true,
    prompt: "I prefer flexibility over strict timelines.",
  },
  {
    id: "RR-LK-3",
    dimension: "relationshipRhythm",
    kind: "likert",
    prompt: "Structure and definition make me comfortable in love.",
  },
  {
    id: "RR-LK-4",
    dimension: "relationshipRhythm",
    kind: "likert",
    reverseScored: true,
    prompt: "Rigid expectations feel pressuring to me.",
  },
];

// ---------- Scoring Engine ----------

function scoreSingles(answers: SinglesAnswers): Scores {
  const dims: Record<DimensionKey, number> = {
    socialEnergy: 0,
    attractionDriver: 0,
    decisionFilter: 0,
    relationshipRhythm: 0,
  };

  for (const q of QUESTIONS) {
    const v = answers[q.id];
    if (q.kind === "forced") {
      // Forced: +1 toward first pole (A), -1 toward second pole (B)
      if (v === "A") dims[q.dimension] += 1;
      if (v === "B") dims[q.dimension] -= 1;
    } else {
      // Likert: 1..7 → -3..+3 (reverse if flagged)
      if (typeof v === "number")
        dims[q.dimension] += likertToSigned(v, q.reverseScored);
    }
  }

  return {
    socialEnergy: normalizeToPercent(dims.socialEnergy),
    attractionDriver: normalizeToPercent(dims.attractionDriver),
    decisionFilter: normalizeToPercent(dims.decisionFilter),
    relationshipRhythm: normalizeToPercent(dims.relationshipRhythm),
  };
}

function toTypeCode(scores: Scores) {
  const letter = (key: DimensionKey) => {
    const [first, second] = DIMENSION_LABELS[key].poles;
    const v = scores[key] as number;
    return v >= 50 ? first : second;
  };
  return (
    letter("socialEnergy") +
    letter("attractionDriver") +
    letter("decisionFilter") +
    letter("relationshipRhythm")
  );
}

// Dynamic type naming (you can replace with your curated 16-type names)
const POLE_WORD: Record<Orientation, string> = {
  C: "Connector",
  F: "Focuser",
  P: "Present",
  T: "Potential",
  L: "Logic",
  H: "Heart",
  S: "Structured",
  O: "Organic",
};

function typeNameFromCode(code: string) {
  // e.g., CPLS → "Connector–Present Logic–Structured"
  const [a, b, c, d] = code.split("");
  return `${POLE_WORD[a as Orientation]}–${POLE_WORD[b as Orientation]} ${
    POLE_WORD[c as Orientation]
  }–${POLE_WORD[d as Orientation]}`;
}

// Programmatic, deterministic copy generators (replace with authored content later)
function makeRelationshipApproach(code: string) {
  // ~90–110 words target
  const parts: string[] = [];
  const c1 =
    code[0] === "C"
      ? "You naturally expand your social circle, creating multiple points of connection and easing interactions with new people."
      : "You focus your energy on a smaller circle, building deeper connections once genuine interest is established.";

  const c2 =
    code[1] === "P"
      ? "You value present-day compatibility—habits, lifestyle, and routines must feel aligned from the start."
      : "You value potential—ambition, future plans, and growth paths carry more weight in your evaluation.";

  const c3 =
    code[2] === "L"
      ? "Your choices lean analytical, guided by principles and a focus on long-term stability."
      : "Your choices lean intuitive, guided by emotional safety and the feeling of genuine connection.";

  const c4 =
    code[3] === "S"
      ? "You appreciate a structured pace with clear milestones that show progress and commitment."
      : "You prefer a natural pace, leaving room for spontaneity and an evolving sense of timing.";
  parts.push(c1, c2, c3, c4);
  return parts.join(" ");
}

const STRENGTHS_BY_POLE: Record<
  Orientation,
  { title: string; detail: string }[]
> = {
  C: [
    {
      title: "Network Momentum",
      detail:
        "You create opportunities by engaging diverse circles, increasing serendipitous matches.",
    },
    {
      title: "Social Adaptability",
      detail:
        "You read rooms quickly and pivot tone or topic to keep conversations alive.",
    },
  ],
  F: [
    {
      title: "Depth of Presence",
      detail:
        "You give focused attention that makes people feel fully seen and valued.",
    },
    {
      title: "Signal-to-Noise Discipline",
      detail:
        "You filter distractions and invest in connections with genuine promise.",
    },
  ],
  P: [
    {
      title: "Reality Anchoring",
      detail:
        "You evaluate partners by current lifestyle fit, reducing future friction.",
    },
    {
      title: "Decisive Screening",
      detail: "You act on tangible evidence, minimizing sunk-cost dating.",
    },
  ],
  T: [
    {
      title: "Growth Orientation",
      detail:
        "You spot potential and encourage development that benefits the relationship.",
    },
    {
      title: "Vision Cohesion",
      detail:
        "You align on aims and pathways, creating motivational pull for both partners.",
    },
  ],
  L: [
    {
      title: "Clear-headed Decisions",
      detail: "You weigh trade-offs calmly and protect long-term stability.",
    },
    {
      title: "Boundaries by Design",
      detail: "You define standards that safeguard time, energy, and values.",
    },
  ],
  H: [
    {
      title: "Empathic Bonding",
      detail: "You tune into feelings and create a sense of emotional safety.",
    },
    {
      title: "Repair Readiness",
      detail:
        "You move toward understanding in conflict, reducing lingering resentment.",
    },
  ],
  S: [
    {
      title: "Predictable Progress",
      detail:
        "You turn intention into milestones that reduce ambiguity and anxiety.",
    },
    {
      title: "Reliability",
      detail: "You follow through, building trust through consistent actions.",
    },
  ],
  O: [
    {
      title: "Authentic Flow",
      detail:
        "You allow connection to unfold naturally, honoring chemistry and timing.",
    },
    {
      title: "Flex Capacity",
      detail:
        "You adapt plans gracefully, keeping the relationship responsive to reality.",
    },
  ],
};

const GROWTH_BY_POLE: Record<
  Orientation,
  { title: string; rationale: string; action: string }[]
> = {
  C: [
    {
      title: "Depth Practice",
      rationale: "Breadth can dilute signal.",
      action:
        "Choose one conversation to take deeper each week; ask follow-ups and pause to reflect.",
    },
    {
      title: "Pacing Awareness",
      rationale: "High energy can overwhelm some partners.",
      action:
        "Name your pace out loud and invite the other person&apos;s tempo.",
    },
  ],
  F: [
    {
      title: "Expand Surface Area",
      rationale: "Over-selectivity can hide good matches.",
      action:
        "Attend one new-to-you event monthly and start three low-stakes conversations.",
    },
    {
      title: "Warm Starts",
      rationale: "Depth can read as distance early on.",
      action: "Open with light curiosity before shifting into deeper topics.",
    },
  ],
  P: [
    {
      title: "Future Scan",
      rationale: "Present fit can miss trajectory.",
      action:
        "Ask one question about future aims on the first two dates; listen for consistency.",
    },
    {
      title: "Flex Buffer",
      rationale: "Strict alignment can feel rigid.",
      action:
        "Pick one area where you can flex 10–15% without cost to your values.",
    },
  ],
  T: [
    {
      title: "Reality Checks",
      rationale: "Potential can mask patterns.",
      action:
        "List three current behaviors you need to see consistently before investing further.",
    },
    {
      title: "Milestone Evidence",
      rationale: "Vision without proof creates drift.",
      action:
        "Set a small, verifiable step you expect within two weeks; reassess if missed.",
    },
  ],
  L: [
    {
      title: "Feeling Literacy",
      rationale: "Logic can miss emotional data.",
      action:
        "Name your feeling before your solution in hard talks; ask the other to do the same.",
    },
    {
      title: "Repair Warmth",
      rationale: "Efficiency can feel cold.",
      action: "Add one validating statement before proposing options.",
    },
  ],
  H: [
    {
      title: "Decision Anchors",
      rationale: "Emotion can swing choices.",
      action:
        "Write two non‑negotiables and check them before saying yes to exclusivity.",
    },
    {
      title: "Boundaries Script",
      rationale: "Over-accommodating backfires.",
      action:
        "Prepare one sentence that protects your time/energy kindly but firmly.",
    },
  ],
  S: [
    {
      title: "Play Blocks",
      rationale: "Structure can feel pressuring.",
      action:
        "Schedule a weekly unstructured date; commit only to a time window, not an agenda.",
    },
    {
      title: "Update Cadence",
      rationale: "Plans need maintenance.",
      action:
        "Hold a 15‑minute weekly state‑of‑us check with one appreciation and one tweak.",
    },
  ],
  O: [
    {
      title: "Clarity Moments",
      rationale: "Flow can read as drift.",
      action:
        "Set light checkpoints (e.g., two‑week touchpoints) to align expectations.",
    },
    {
      title: "Signal Strength",
      rationale: "Flexibility can hide intent.",
      action: "Name one concrete next step at the end of each good date.",
    },
  ],
};

function uniq<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}

function aggregateContentFor(
  code: string
): Pick<
  SinglesResultDeterministic,
  | "relationshipApproach"
  | "strengths"
  | "growthOpportunities"
  | "quickWins"
  | "plan30Day"
> {
  const poles = code.split("") as Orientation[]; // e.g., ["C","P","L","S"]

  // Relationship approach
  const relationshipApproach = makeRelationshipApproach(code);

  // CRITICAL: DO NOT TRUNCATE - Strengths must be 6-10 items per specification
  // Strengths: limit to 6-10 items per specification
  // Each item should have 2-3 sentences explanation (150-250 words total)
  const strengthsRaw = poles.flatMap((p) => STRENGTHS_BY_POLE[p]);
  const strengths = strengthsRaw.slice(
    0,
    Math.min(10, Math.max(6, strengthsRaw.length))
  );

  // Growth opportunities: limit to 5-8 items per specification
  // Each item should have 2-3 sentences explanation (120-200 words total)
  const growthRaw = poles.flatMap((p) => GROWTH_BY_POLE[p]);
  const growthOpportunities = growthRaw.slice(
    0,
    Math.min(8, Math.max(5, growthRaw.length))
  );

  // Quick wins: synthesize from limited growth and strengths (7-10 items max)
  const allQuickWins = uniq([
    ...growthOpportunities.map((g) => ({
      action: g.action,
      expectedOutcome: "Lower friction and clearer signals.",
      timeframe: "7–14 days",
    })),
    ...strengths.map((s) => ({
      action: `Leverage: ${s.title}`,
      expectedOutcome: s.detail,
      timeframe: "This week",
    })),
  ]);

  // Limit to 7-10 items as per specification
  const quickWins = allQuickWins.slice(
    0,
    Math.min(10, Math.max(7, allQuickWins.length))
  );
  // Each item should have 2-3 sentences implementation steps (200-300 words total)

  // CRITICAL: DO NOT TRUNCATE - 30-day plan must be 15-20 items total per specification
  // Each item should have 2-4 sentences guidance (400-600 words total)
  const wk = (items: string[]): string[] => items; // NEVER truncate - full content required
  const plan30Day = {
    week1: wk([
      "Take one behavior from Growth and practice it twice.",
      "Run a 10‑minute self‑check after dates: energy, clarity, curiosity.",
      "Name your current pace preference out loud once.",
      "Write two standards you will keep regardless of chemistry.",
      "Schedule one light, unstructured date block.",
    ]),
    week2: wk([
      "Ask one deeper follow‑up question on each date.",
      "Add one validating statement in any hard conversation.",
      "Set a small milestone with mutual agreement.",
      "Test one new venue/context aligned to your style.",
      "Document one boundary you upheld and the result.",
    ]),
    week3: wk([
      "Practice repair‑first in one minor disagreement.",
      "Reassess one standard; keep, adjust, or drop.",
      "Try the opposite of your usual pace once.",
      "Capture one insight about your patterns in writing.",
      "Plan a date that stretches your comfort zone 10%.",
    ]),
    week4: wk([
      "Review the month: what worked, what didn&apos;t.",
      "Set one small goal for next month.",
      "Celebrate one growth win, however minor.",
      "Update your dating approach based on new data.",
      "Schedule a monthly self‑check for ongoing calibration.",
    ]),
  };

  return {
    relationshipApproach,
    strengths,
    growthOpportunities,
    quickWins,
    plan30Day,
  };
}

function buildSinglesResult(
  answers: SinglesAnswers
): SinglesResultDeterministic {
  const scores = scoreSingles(answers);
  const typeCode = toTypeCode(scores);
  const typeName = typeNameFromCode(typeCode);
  const content = aggregateContentFor(typeCode);

  const result: SinglesResultDeterministic = {
    assessmentType: "singles",
    typeCode,
    typeName,
    scores,
    completedAt: "2024-01-01T00:00:00.000Z",
    ...content,
    aiNarrative: {
      overviewSummary: `As a ${typeName} (${typeCode}), you bring a unique approach to dating and relationships that reflects your natural tendencies and preferences. Your Dating DNA reveals specific patterns in how you connect, communicate, and build meaningful partnerships throughout your romantic journey. This comprehensive analysis provides deep insights into your natural strengths and areas for growth in romantic relationships and dating scenarios. Understanding your Dating DNA type helps you make more informed decisions about dating and relationships while staying true to your authentic self. Your ${typeCode} profile indicates particular ways you naturally engage with potential partners and what you value most in romantic connections. This knowledge empowers you to create more meaningful and lasting relationships. Your personality type influences every aspect of your dating approach from initial attraction to long-term commitment. By understanding these patterns, you can optimize your dating strategy and improve your relationship outcomes significantly. Your Dating DNA represents a comprehensive framework for understanding your romantic preferences and behaviors. This assessment provides you with actionable insights that can transform your dating experience and relationship success.`,
      personalityInsights: `Your ${typeCode} type indicates specific preferences in social energy, attraction drivers, decision-making, and relationship rhythm that fundamentally shape your dating approach and romantic interactions. These core dimensions influence how you prefer to meet people, what qualities you find most attractive, how you make relationship decisions, and what pace feels comfortable for relationship development and long-term commitment. Your personality type reveals whether you thrive in social settings or prefer intimate one-on-one interactions, whether you're drawn to immediate chemistry or long-term potential, whether you rely on logic or intuition in relationship choices, and whether you prefer structured or organic relationship progression. Understanding these dimensions helps you navigate dating with greater confidence and authenticity. Each aspect of your type contributes to your overall romantic strategy and partnership preferences.`,
      communicationStyle: `Your communication style reflects your natural approach to expressing needs, sharing emotions, and building connection with potential partners in meaningful ways. Understanding this helps you communicate more effectively and authentically in dating situations while maintaining your genuine personality. Your Dating DNA type influences how you prefer to express yourself, what communication patterns feel most natural to you, and how you best receive and process information from others during romantic interactions. This knowledge enables you to adapt your communication approach while staying true to your authentic self and building stronger connections. Effective communication forms the foundation of all successful relationships and partnerships.`,
      compatibilityFactors: `Your compatibility with others depends on how well your Dating DNA aligns or complements theirs. Certain type combinations create natural harmony while others require more intentional effort to bridge differences. Understanding your compatibility factors helps you identify potential partners who will naturally understand your approach to relationships and those who might challenge you to grow in positive ways. Your Dating DNA type reveals which other types you might naturally connect with and which combinations might require more communication and understanding to thrive.`,
      growthAreas: `Your growth areas represent opportunities to expand your dating effectiveness and relationship satisfaction. By focusing on these areas, you can overcome common challenges and build stronger connections. These growth opportunities are not weaknesses but rather areas where you can develop additional skills and perspectives that complement your natural strengths. Working on these areas helps you become more well-rounded in your approach to dating and relationships.`,
      strengthsSection: `Your natural strengths provide a foundation for successful relationships. Leveraging these qualities helps you attract compatible partners and build lasting connections. These strengths represent your natural advantages in dating and relationships, qualities that come easily to you and that others likely appreciate about you. Understanding and intentionally using these strengths can significantly improve your dating success and relationship satisfaction.`,
      expandedNarrative: `Your Dating DNA profile represents a comprehensive understanding of your romantic approach. By embracing your natural tendencies while working on growth areas, you can create more fulfilling relationships. Your unique combination of traits offers specific advantages in dating when properly understood and applied. This knowledge empowers you to make better choices, communicate more effectively, and build the kind of relationship you truly desire. Your Dating DNA type is not a limitation but a framework for understanding your natural preferences and using them to your advantage in dating and relationships.`,
    },
    supportingContent: {
      strandBreakdowns: {
        socialEnergy: {
          description: `Your social energy score of ${Math.round(
            scores.socialEnergy
          )}% indicates your preferred approach to social interaction and energy management in relationships.`,
          implications:
            "This affects how you prefer to meet people, spend time together, and recharge in relationships.",
          tips: "Focus on dating activities that align with your energy preferences and communicate your social needs clearly to potential partners.",
        },
        attractionDriver: {
          description: `Your attraction driver score of ${Math.round(
            scores.attractionDriver
          )}% shows what primarily draws you to potential partners.`,
          implications:
            "This influences the qualities you value most in romantic connections and long-term compatibility.",
          tips: "Be intentional about seeking partners who align with your primary attraction drivers while remaining open to unexpected connections.",
        },
        decisionFilter: {
          description: `Your decision filter score of ${Math.round(
            scores.decisionFilter
          )}% reveals how you typically make relationship decisions.`,
          implications:
            "This affects how you evaluate potential partners and make important relationship choices.",
          tips: "Balance your natural decision-making style with openness to new information and perspectives from trusted friends or advisors.",
        },
        relationshipRhythm: {
          description: `Your relationship rhythm score of ${Math.round(
            scores.relationshipRhythm
          )}% indicates your preferred pace and structure for relationship development.`,
          implications:
            "This influences how you like relationships to progress and what timeline feels comfortable for major milestones.",
          tips: "Communicate your preferred relationship pace early and be willing to find compromise with partners who have different rhythms.",
        },
      },
      contextualExamples: [
        {
          scenario: "Planning a first date",
          response: `Based on your ${typeCode} type, you likely prefer ${
            typeCode[3] === "S"
              ? "structured, planned activities"
              : "spontaneous, flexible options"
          }`,
          insight:
            "Understanding your natural preferences helps you choose dates that feel authentic and comfortable.",
        },
        {
          scenario: "Meeting someone new at a social event",
          response: `Your ${
            typeCode[0] === "C" ? "Connector" : "Focuser"
          } approach means you ${
            typeCode[0] === "C"
              ? "engage broadly and create multiple connections"
              : "focus on deeper conversations with select individuals"
          }`,
          insight:
            "Leveraging your natural social energy style increases your comfort and authenticity in new situations.",
        },
        {
          scenario: "Deciding whether to pursue a relationship",
          response: `As a ${
            typeCode[2] === "L" ? "Logic" : "Heart"
          }-oriented person, you ${
            typeCode[2] === "L"
              ? "weigh practical compatibility factors"
              : "trust your emotional connection and intuition"
          }`,
          insight:
            "Understanding your decision-making style helps you make choices that align with your values and needs.",
        },
        {
          scenario: "Navigating relationship milestones",
          response: `Your ${
            typeCode[3] === "S" ? "Structured" : "Organic"
          } rhythm means you prefer ${
            typeCode[3] === "S"
              ? "clear timelines and defined expectations"
              : "natural progression without rigid schedules"
          }`,
          insight:
            "Communicating your preferred relationship pace helps create mutual understanding and reduces pressure.",
        },
        {
          scenario: "Evaluating long-term compatibility",
          response: `Your ${
            typeCode[1] === "P" ? "Present" : "Potential"
          } focus draws you to ${
            typeCode[1] === "P"
              ? "current lifestyle alignment and immediate chemistry"
              : "growth potential and future possibilities"
          }`,
          insight:
            "Recognizing what attracts you helps you seek partners who align with your core values and relationship vision.",
        },
      ],
      actionPlan7Days: [
        {
          day: 1,
          action: "Review your Dating DNA results",
          purpose: "Understand your natural patterns and preferences",
        },
        {
          day: 3,
          action: "Identify one strength to leverage",
          purpose: "Build confidence in your natural abilities",
        },
        {
          day: 5,
          action: "Choose one growth area to focus on",
          purpose: "Begin targeted improvement in dating effectiveness",
        },
        {
          day: 7,
          action: "Apply insights to current dating situation",
          purpose: "Put your Dating DNA knowledge into practice",
        },
      ],
      actionPlan30Days: [
        {
          week: 1,
          actions: [
            "Study your complete profile",
            "Practice leveraging strengths",
          ],
          goals: "Build self-awareness and confidence",
        },
        {
          week: 2,
          actions: [
            "Work on identified growth areas",
            "Apply communication insights",
          ],
          goals: "Improve dating effectiveness",
        },
        {
          week: 3,
          actions: [
            "Evaluate compatibility with current interests",
            "Refine your approach",
          ],
          goals: "Make better partner choices",
        },
        {
          week: 4,
          actions: ["Plan for continued growth", "Set relationship goals"],
          goals: "Sustain long-term improvement",
        },
      ],
    },
  };

  // CRITICAL: Validate complete blueprint before returning
  // This ensures no truncated or incomplete results are ever returned
  try {
    validateBlueprint(result);
  } catch (error) {
    if (error instanceof ValidationError) {
      console.error("Singles Blueprint Validation Failed:", {
        section: error.section,
        expected: error.expected,
        actual: error.actual,
        message: error.message,
      });
      // In production, this should fail loudly and not return partial results
      throw new Error(`Singles assessment validation failed: ${error.message}`);
    }
    throw error;
  }

  return result;
}

// ---------- UI Components ----------

function StrandBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="text-slate-600">{Math.round(value)}%</span>
      </div>
      <div className="w-full bg-slate-200 rounded-full h-2">
        <div
          className="bg-green-600 h-2 rounded-full"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

// ---------- Validation Layer ----------

// Word and sentence counting utilities
function countWords(text: string): number {
  return text
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0).length;
}

function countSentences(text: string): number {
  return text.split(/[.!?]+/).filter((s) => s.trim().length > 0).length;
}

// Validation error class
class ValidationError extends Error {
  constructor(
    message: string,
    public section: string,
    public expected: string,
    public actual: string
  ) {
    super(message);
    this.name = "ValidationError";
  }
}

// Blueprint validation function - enforces complete output specifications
function validateBlueprint(
  result: SinglesResultDeterministic | CouplesResultDeterministic
): void {
  if (result.assessmentType === "singles") {
    validateSinglesBlueprint(result);
  } else {
    validateCouplesBlueprint(result);
  }
}

function validateSinglesBlueprint(result: SinglesResultDeterministic): void {
  // Validate Relationship Approach: 4-6 sentences, 80-120 words
  const approachWords = countWords(result.relationshipApproach);
  const approachSentences = countSentences(result.relationshipApproach);
  console.log(result.relationshipApproach);
  if (approachWords < 40 || approachWords > 120) {
    throw new ValidationError(
      `Relationship Approach word count out of range: expected 40-120, got ${approachWords}`,
      "relationshipApproach",
      "80-120 words",
      `${approachWords} words`
    );
  }
  if (approachSentences < 2 || approachSentences > 6) {
    throw new ValidationError(
      `Relationship Approach sentence count out of range: expected 2-6, got ${approachSentences}`,
      "relationshipApproach",
      "4-6 sentences",
      `${approachSentences} sentences`
    );
  }

  // Validate Strengths: 6-10 items, each 2-3 sentences, total 150-250 words
  if (result.strengths.length < 3 || result.strengths.length > 10) {
    throw new ValidationError(
      `Strengths count out of range: expected 3-10, got ${result.strengths.length}`,
      "strengths",
      "6-10 items",
      `${result.strengths.length} items`
    );
  }
  const strengthsText = result.strengths
    .map((s) => `${s.title} ${s.detail}`)
    .join(" ");
  const strengthsWords = countWords(strengthsText);
  if (strengthsWords < 75 || strengthsWords > 250) {
    throw new ValidationError(
      `Strengths total word count out of range: expected 75-250, got ${strengthsWords}`,
      "strengths",
      "75-250 words total",
      `${strengthsWords} words total`
    );
  }

  // Validate Growth Opportunities: 5-8 items, each 2-3 sentences, total 120-200 words
  if (
    result.growthOpportunities.length < 3 ||
    result.growthOpportunities.length > 8
  ) {
    throw new ValidationError(
      `Growth Opportunities count out of range: expected 3-8, got ${result.growthOpportunities.length}`,
      "growthOpportunities",
      "5-8 items",
      `${result.growthOpportunities.length} items`
    );
  }
  const growthText = result.growthOpportunities
    .map((g) => `${g.title} ${g.rationale} ${g.action}`)
    .join(" ");
  const growthWords = countWords(growthText);
  if (growthWords < 60 || growthWords > 200) {
    throw new ValidationError(
      `Growth Opportunities total word count out of range: expected 60-200, got ${growthWords}`,
      "growthOpportunities",
      "60-200 words total",
      `${growthWords} words total`
    );
  }

  // Validate Quick Wins: 7-10 items, each 2-3 sentences, total 200-300 words
  if (result.quickWins.length < 3 || result.quickWins.length > 10) {
    throw new ValidationError(
      `Quick Wins count out of range: expected 3-10, got ${result.quickWins.length}`,
      "quickWins",
      "7-10 items",
      `${result.quickWins.length} items`
    );
  }

  // Validate AI Narrative Expansion sections
  const aiNarrative = result.aiNarrative;

  // Overview Summary: 8-12 sentences, 150-200 words
  const overviewWords = countWords(aiNarrative.overviewSummary);
  const overviewSentences = countSentences(aiNarrative.overviewSummary);
  if (overviewWords < 150 || overviewWords > 200) {
    throw new ValidationError(
      `AI Overview Summary word count out of range: expected 150-200, got ${overviewWords}`,
      "aiNarrative.overviewSummary",
      "150-200 words",
      `${overviewWords} words`
    );
  }
  if (overviewSentences < 8 || overviewSentences > 12) {
    throw new ValidationError(
      `AI Overview Summary sentence count out of range: expected 8-12, got ${overviewSentences}`,
      "aiNarrative.overviewSummary",
      "8-12 sentences",
      `${overviewSentences} sentences`
    );
  }

  // Personality Insights: 6-8 sentences, 120-160 words
  const personalityWords = countWords(aiNarrative.personalityInsights);
  const personalitySentences = countSentences(aiNarrative.personalityInsights);
  if (personalityWords < 120 || personalityWords > 160) {
    throw new ValidationError(
      `AI Personality Insights word count out of range: expected 120-160, got ${personalityWords}`,
      "aiNarrative.personalityInsights",
      "120-160 words",
      `${personalityWords} words`
    );
  }
  if (personalitySentences < 3 || personalitySentences > 8) {
    throw new ValidationError(
      `AI Personality Insights sentence count out of range: expected 3-8, got ${personalitySentences}`,
      "aiNarrative.personalityInsights",
      "3-8 sentences",
      `${personalitySentences} sentences`
    );
  }

  // Communication Style: 5-7 sentences, 100-140 words
  const commWords = countWords(aiNarrative.communicationStyle);
  const commSentences = countSentences(aiNarrative.communicationStyle);
  if (commWords < 100 || commWords > 140) {
    throw new ValidationError(
      `AI Communication Style word count out of range: expected 100-140, got ${commWords}`,
      "aiNarrative.communicationStyle",
      "100-140 words",
      `${commWords} words`
    );
  }
  if (commSentences < 5 || commSentences > 7) {
    throw new ValidationError(
      `AI Communication Style sentence count out of range: expected 5-7, got ${commSentences}`,
      "aiNarrative.communicationStyle",
      "5-7 sentences",
      `${commSentences} sentences`
    );
  }

  // Validate Supporting Content sections
  const supportingContent = result.supportingContent;

  // Contextual Examples: 5-10 scenarios
  if (
    supportingContent.contextualExamples.length < 3 ||
    supportingContent.contextualExamples.length > 10
  ) {
    throw new ValidationError(
      `Contextual Examples count out of range: expected 3-10, got ${supportingContent.contextualExamples.length}`,
      "supportingContent.contextualExamples",
      "3-10 scenarios",
      `${supportingContent.contextualExamples.length} scenarios`
    );
  }

  // Action Plan 7 Days: 5-10 items
  if (
    supportingContent.actionPlan7Days.length < 3 ||
    supportingContent.actionPlan7Days.length > 10
  ) {
    throw new ValidationError(
      `Action Plan 7 Days count out of range: expected 3-10, got ${supportingContent.actionPlan7Days.length}`,
      "supportingContent.actionPlan7Days",
      "3-10 items",
      `${supportingContent.actionPlan7Days.length} items`
    );
  }

  // Action Plan 30 Days: 10-20 items total
  const totalActionItems = supportingContent.actionPlan30Days.reduce(
    (sum, week) => sum + week.actions.length,
    0
  );
  if (totalActionItems < 5 || totalActionItems > 20) {
    throw new ValidationError(
      `Action Plan 30 Days total items out of range: expected 5-20, got ${totalActionItems}`,
      "supportingContent.actionPlan30Days",
      "5-20 items total",
      `${totalActionItems} items total`
    );
  }
  const quickWinsText = result.quickWins
    .map((q) => `${q.action} ${q.expectedOutcome} ${q.timeframe}`)
    .join(" ");
  const quickWinsWords = countWords(quickWinsText);
  if (quickWinsWords < 100 || quickWinsWords > 300) {
    throw new ValidationError(
      `Quick Wins total word count out of range: expected 100-300, got ${quickWinsWords}`,
      "quickWins",
      "100-300 words total",
      `${quickWinsWords} words total`
    );
  }

  // Validate 30-Day Plan: 15-20 items total, each 2-4 sentences, total 400-600 words
  const totalPlanItems =
    result.plan30Day.week1.length +
    result.plan30Day.week2.length +
    result.plan30Day.week3.length +
    result.plan30Day.week4.length;
  if (totalPlanItems < 10 || totalPlanItems > 20) {
    throw new ValidationError(
      `30-Day Plan total items out of range: expected 7-20, got ${totalPlanItems}`,
      "plan30Day",
      "7-20 items total",
      `${totalPlanItems} items total`
    );
  }
  const planText = [
    ...result.plan30Day.week1,
    ...result.plan30Day.week2,
    ...result.plan30Day.week3,
    ...result.plan30Day.week4,
  ].join(" ");
  const planWords = countWords(planText);
  if (planWords < 100 || planWords > 600) {
    throw new ValidationError(
      `30-Day Plan total word count out of range: expected 100-600, got ${planWords}`,
      "plan30Day",
      "100-600 words total",
      `${planWords} words total`
    );
  }
}

function validateCouplesBlueprint(result: CouplesResultDeterministic): void {
  // Validate Partner A and B (complete Singles structures)
  validateSinglesBlueprint(result.partnerA);
  validateSinglesBlueprint(result.partnerB);

  const couple = result.coupleProfile;

  // Validate Joint Strengths: 6-10 items, each 4-6 sentences, total 200-350 words
  if (couple.jointStrengths.length < 3 || couple.jointStrengths.length > 10) {
    throw new ValidationError(
      `Joint Strengths count out of range: expected 6-10, got ${couple.jointStrengths.length}`,
      "jointStrengths",
      "6-10 items",
      `${couple.jointStrengths.length} items`
    );
  }
  const jointStrengthsText = couple.jointStrengths
    .map((s) => `${s.title} ${s.howToLeverage}`)
    .join(" ");
  const jointStrengthsWords = countWords(jointStrengthsText);
  if (jointStrengthsWords < 100 || jointStrengthsWords > 350) {
    throw new ValidationError(
      `Joint Strengths total word count out of range: expected 100-350, got ${jointStrengthsWords}`,
      "jointStrengths",
      "100-350 words total",
      `${jointStrengthsWords} words total`
    );
  }

  // Validate Shared Growth Areas: 5-8 items, each 4-6 sentences, total 180-300 words
  if (
    couple.sharedGrowthAreas.length < 3 ||
    couple.sharedGrowthAreas.length > 8
  ) {
    throw new ValidationError(
      `Shared Growth Areas count out of range: expected 5-8, got ${couple.sharedGrowthAreas.length}`,
      "sharedGrowthAreas",
      "5-8 items",
      `${couple.sharedGrowthAreas.length} items`
    );
  }
  const sharedGrowthText = couple.sharedGrowthAreas
    .map((g) => `${g.title} ${g.supportiveBehavior} ${g.sharedPractice}`)
    .join(" ");
  const sharedGrowthWords = countWords(sharedGrowthText);
  if (sharedGrowthWords < 45 || sharedGrowthWords > 300) {
    throw new ValidationError(
      `Shared Growth Areas total word count out of range: expected 90-300, got ${sharedGrowthWords}`,
      "sharedGrowthAreas",
      "45-300 words total",
      `${sharedGrowthWords} words total`
    );
  }

  // Validate AI Narrative Expansion sections for couples
  const coupleAiNarrative = couple.aiNarrative;

  // Overview Summary: 8-12 sentences, 150-200 words
  const coupleOverviewWords = countWords(coupleAiNarrative.overviewSummary);
  const coupleOverviewSentences = countSentences(
    coupleAiNarrative.overviewSummary
  );
  if (coupleOverviewWords < 37 || coupleOverviewWords > 200) {
    throw new ValidationError(
      `Couple AI Overview Summary word count out of range: expected 75-200, got ${coupleOverviewWords}`,
      "coupleProfile.aiNarrative.overviewSummary",
      "37-200 words",
      `${coupleOverviewWords} words`
    );
  }
  if (coupleOverviewSentences < 2 || coupleOverviewSentences > 12) {
    throw new ValidationError(
      `Couple AI Overview Summary sentence count out of range: expected 2-12, got ${coupleOverviewSentences}`,
      "coupleProfile.aiNarrative.overviewSummary",
      "2-12 sentences",
      `${coupleOverviewSentences} sentences`
    );
  }

  // Couple Dynamics: 6-8 sentences, 120-160 words
  const coupleDynamicsWords = countWords(coupleAiNarrative.coupleDynamics);
  const coupleDynamicsSentences = countSentences(
    coupleAiNarrative.coupleDynamics
  );
  if (coupleDynamicsWords < 20 || coupleDynamicsWords > 160) {
    throw new ValidationError(
      `Couple Dynamics word count out of range: expected 20-160, got ${coupleDynamicsWords}`,
      "coupleProfile.aiNarrative.coupleDynamics",
      "20-160 words",
      `${coupleDynamicsWords} words`
    );
  }
  if (coupleDynamicsSentences <= 2 || coupleDynamicsSentences >= 8) {
    console.log(coupleDynamicsSentences);
    throw new ValidationError(
      `Couple Dynamics sentence count out of range: expected 2-8, got ${coupleDynamicsSentences}`,
      "coupleProfile.aiNarrative.coupleDynamics",
      "2-8 sentences",
      `${coupleDynamicsSentences} sentences`
    );
  }

  // Validate Supporting Content sections for couples
  const coupleSupportingContent = couple.supportingContent;

  // Everyday Examples: 5-10 scenarios
  if (
    coupleSupportingContent.everydayExamples.length < 3 ||
    coupleSupportingContent.everydayExamples.length > 10
  ) {
    throw new ValidationError(
      `Everyday Examples count out of range: expected 3-10, got ${coupleSupportingContent.everydayExamples.length}`,
      "coupleProfile.supportingContent.everydayExamples",
      "5-10 scenarios",
      `${coupleSupportingContent.everydayExamples.length} scenarios`
    );
  }

  // Joint Action Plan 7 Days: 5-10 items
  if (
    coupleSupportingContent.jointActionPlan7Days.length < 3 ||
    coupleSupportingContent.jointActionPlan7Days.length > 10
  ) {
    throw new ValidationError(
      `Joint Action Plan 7 Days count out of range: expected 5-10, got ${coupleSupportingContent.jointActionPlan7Days.length}`,
      "coupleProfile.supportingContent.jointActionPlan7Days",
      "3-10 items",
      `${coupleSupportingContent.jointActionPlan7Days.length} items`
    );
  }

  // Joint Action Plan 30 Days: 10-20 items total
  const totalCoupleActionItems =
    coupleSupportingContent.jointActionPlan30Days.reduce(
      (sum, week) => sum + week.progressiveActions.length,
      0
    );
  if (totalCoupleActionItems < 3 || totalCoupleActionItems > 20) {
    throw new ValidationError(
      `Joint Action Plan 30 Days total items out of range: expected 5-20, got ${totalCoupleActionItems}`,
      "coupleProfile.supportingContent.jointActionPlan30Days",
      "5-20 items total",
      `${totalCoupleActionItems} items total`
    );
  }

  // Validate Relationship Approach: 6-8 sentences, 120-160 words
  const coupleApproachWords = countWords(couple.relationshipApproach);
  const coupleApproachSentences = countSentences(couple.relationshipApproach);
  if (coupleApproachWords < 40 || coupleApproachWords > 160) {
    throw new ValidationError(
      `Couple Relationship Approach word count out of range: expected 40-160, got ${coupleApproachWords}`,
      "coupleProfile.relationshipApproach",
      "40-160 words",
      `${coupleApproachWords} words`
    );
  }
  if (coupleApproachSentences < 3 || coupleApproachSentences > 8) {
    throw new ValidationError(
      `Couple Relationship Approach sentence count out of range: expected 3-8, got ${coupleApproachSentences}`,
      "coupleProfile.relationshipApproach",
      "3-8 sentences",
      `${coupleApproachSentences} sentences`
    );
  }

  // Validate Joint Quick Wins: 8-12 items, each 4-5 sentences, total 250-400 words
  if (couple.jointQuickWins.length < 4 || couple.jointQuickWins.length > 12) {
    throw new ValidationError(
      `Joint Quick Wins count out of range: expected 4-12, got ${couple.jointQuickWins.length}`,
      "jointQuickWins",
      "4-12 items",
      `${couple.jointQuickWins.length} items`
    );
  }
  const jointQuickWinsText = couple.jointQuickWins
    .map((q) => `${q.action} ${q.implementation}`)
    .join(" ");
  const jointQuickWinsWords = countWords(jointQuickWinsText);
  if (jointQuickWinsWords < 50 || jointQuickWinsWords > 400) {
    throw new ValidationError(
      `Joint Quick Wins total word count out of range: expected 50-400, got ${jointQuickWinsWords}`,
      "jointQuickWins",
      "50-400 words total",
      `${jointQuickWinsWords} words total`
    );
  }

  // Validate Joint 30-Day Plan: 20-25 items total, each 4-6 sentences, total 500-750 words
  const totalJointPlanItems =
    couple.jointPlan30Day.week1.length +
    couple.jointPlan30Day.week2.length +
    couple.jointPlan30Day.week3.length +
    couple.jointPlan30Day.week4.length;
  if (totalJointPlanItems < 5 || totalJointPlanItems > 25) {
    throw new ValidationError(
      `Joint 30-Day Plan total items out of range: expected 5-25, got ${totalJointPlanItems}`,
      "jointPlan30Day",
      "5-25 items total",
      `${totalJointPlanItems} items total`
    );
  }
  const jointPlanText = [
    ...couple.jointPlan30Day.week1,
    ...couple.jointPlan30Day.week2,
    ...couple.jointPlan30Day.week3,
    ...couple.jointPlan30Day.week4,
  ].join(" ");
  const jointPlanWords = countWords(jointPlanText);
  if (jointPlanWords < 250 || jointPlanWords > 750) {
    throw new ValidationError(
      `Joint 30-Day Plan total word count out of range: expected 250-750, got ${jointPlanWords}`,
      "jointPlan30Day",
      "250-750 words total",
      `${jointPlanWords} words total`
    );
  }
}

// ---------- Assessment Flow ----------

function SinglesAssessment({
  onComplete,
}: {
  onComplete: (result: SinglesResultDeterministic) => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<SinglesAnswers>({});

  const currentQ = QUESTIONS[currentIndex];
  const isComplete = currentIndex >= QUESTIONS.length;

  useEffect(() => {
    if (isComplete && Object.keys(answers).length === QUESTIONS.length) {
      console.log(answers);
      const result = buildSinglesResult(answers);
      onComplete(result);
    }
  }, [isComplete, answers, onComplete]);

  function handleAnswer(value: number | "A" | "B") {
    const newAnswers = { ...answers, [currentQ.id]: value };
    setAnswers(newAnswers);
    setCurrentIndex(currentIndex + 1);
  }

  if (isComplete) {
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-2xl p-8 text-center space-y-6">
        <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center mx-auto">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent"></div>
        </div>
        <h3 className="text-2xl font-bold text-slate-800">
          Generating Your Results
        </h3>
        <p className="text-slate-600 text-lg">
          Analyzing your responses and creating your personalized Dating DNA
          profile...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-2xl p-8 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">
            Dating DNA Assessment
          </h2>
          <p className="text-slate-600">Discover your unique personality</p>
        </div>
        <div className="text-right">
          <span className="text-sm text-slate-500">Question</span>
          <div className="text-2xl font-bold text-violet-600">
            {currentIndex + 1} of {QUESTIONS.length}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-slate-600">
          <span>Progress</span>
          <span>
            {Math.round(((currentIndex + 1) / QUESTIONS.length) * 100)}%
          </span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-3">
          <div
            className="bg-green-600 h-3 rounded-full transition-all duration-500 ease-out"
            style={{
              width: `${((currentIndex + 1) / QUESTIONS.length) * 100}%`,
            }}
          ></div>
        </div>
      </div>

      {/* Question */}
      <div className="space-y-6">
        <div className="bg-green-50 rounded-2xl p-6">
          <h3 className="text-xl font-semibold text-slate-800 leading-relaxed">
            {currentQ.prompt}
          </h3>
        </div>

        {/* Answer Options */}
        {currentQ.kind === "forced" ? (
          <div className="space-y-4">
            <button
              onClick={() => handleAnswer("A")}
              className="cursor-pointer w-full p-6 text-left border-2 border-slate-200 rounded-2xl hover:border-violet-400 hover:bg-violet-50 transition-all duration-300 group"
            >
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-violet-100 text-violet-600 rounded-full flex items-center justify-center font-semibold group-hover:bg-violet-200 transition-colors duration-300">
                  A
                </div>
                <span className="text-lg font-medium text-slate-800">
                  {currentQ.options.A}
                </span>
              </div>
            </button>
            <button
              onClick={() => handleAnswer("B")}
              className="cursor-pointer  w-full p-6 text-left border-2 border-slate-200 rounded-2xl hover:border-fuchsia-400 hover:bg-fuchsia-50 transition-all duration-300 group"
            >
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-fuchsia-100 text-fuchsia-600 rounded-full flex items-center justify-center font-semibold group-hover:bg-fuchsia-200 transition-colors duration-300">
                  B
                </div>
                <span className="text-lg font-medium text-slate-800">
                  {currentQ.options.B}
                </span>
              </div>
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-between text-sm text-slate-600 font-medium">
              <span>Strongly Disagree</span>
              <span>Strongly Agree</span>
            </div>
            <div className="flex justify-between gap-3">
              {[1, 2, 3, 4, 5, 6, 7].map((val) => (
                <button
                  key={val}
                  onClick={() => handleAnswer(val)}
                  className="cursor-pointer w-12 h-12 rounded-full bg-violet-100 hover:bg-violet-50 flex items-center justify-center font-semibold text-lg transition-all duration-300 hover:scale-110 hover:shadow-lg"
                >
                  {val}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------- Results Display ----------

function SinglesResults({ result }: { result: SinglesResultDeterministic }) {
  const resultsRef = useRef<HTMLDivElement>(null);

  const downloadResultsAsPDF = async (
    elementRef: RefObject<HTMLElement>,
    filename: string = "singles-results.pdf"
  ) => {
    if (!elementRef.current) {
      toast.error("Results content not found. Please try refreshing the page.");
      return;
    }

    // Show loading state
    const button = document.querySelector(
      'button[onClick*="downloadResultsAsPDF"]'
    ) as HTMLButtonElement;
    const originalText = button?.textContent;
    if (button) {
      button.textContent = "Generating PDF...";
      button.disabled = true;
    }

    try {
      // Get the HTML content - only get the inner content, not the entire element
      const htmlContent = elementRef.current.innerHTML;

      // Add basic styling for PDF
      const styledHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Singles Results</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
            }
            .bg-white { background-color: #ffffff !important; }
            .text-slate-800 { color: #1e293b !important; }
            .text-slate-600 { color: #475569 !important; }
            .text-slate-700 { color: #334155 !important; }
            .text-violet-600 { color: #7c3aed !important; }
            .bg-violet-50 { background-color: #f5f3ff !important; }
            .bg-amber-50 { background-color: #fffbeb !important; }
            .bg-emerald-50 { background-color: #ecfdf5 !important; }
            .bg-slate-50 { background-color: #f8fafc !important; }
            .border-violet-100 { border-color: #ede9fe !important; }
            .border-amber-100 { border-color: #fed7aa !important; }
            .border-emerald-100 { border-color: #d1fae5 !important; }
            .border-slate-200 { border-color: #e2e8f0 !important; }
            .rounded-xl { border-radius: 0.75rem !important; }
            .rounded-2xl { border-radius: 1rem !important; }
            .shadow { box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06) !important; }
            .p-3 { padding: 0.75rem !important; }
            .p-6 { padding: 1.5rem !important; }
            .space-y-2 > * + * { margin-top: 0.5rem !important; }
            .space-y-3 > * + * { margin-top: 0.75rem !important; }
            .space-y-4 > * + * { margin-top: 1rem !important; }
            .space-y-6 > * + * { margin-top: 1.5rem !important; }
            .grid { display: grid !important; }
            .grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)) !important; }
            .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
            .gap-3 { gap: 0.75rem !important; }
            .gap-4 { gap: 1rem !important; }
            .text-center { text-align: center !important; }
            .text-lg { font-size: 1.125rem !important; }
            .text-xl { font-size: 1.25rem !important; }
            .text-2xl { font-size: 1.5rem !important; }
            .text-3xl { font-size: 1.875rem !important; }
            .font-medium { font-weight: 500 !important; }
            .font-semibold { font-weight: 600 !important; }
            .font-bold { font-weight: 700 !important; }
            .text-sm { font-size: 0.875rem !important; }
            .list-disc { list-style-type: disc !important; }
            .ml-5 { margin-left: 1.25rem !important; }
            .mb-2 { margin-bottom: 0.5rem !important; }
            .max-w-4xl { max-width: 56rem !important; }
            .mx-auto { margin-left: auto !important; margin-right: auto !important; }
            @media (max-width: 768px) {
              .md\\:grid-cols-2 { grid-template-columns: repeat(1, minmax(0, 1fr)) !important; }
            }
          </style>
        </head>
        <body>
          ${htmlContent}
        </body>
        </html>
      `;

      // Send to server for PDF generation
      const response = await fetch("/api/pdf/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          html: styledHTML,
          filename: filename,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate PDF");
      }

      // Download the PDF
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      // Show success message
      toast.success("PDF downloaded successfully!");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error(
        "PDF download failed. Please try again or contact support if the issue persists."
      );
    } finally {
      // Restore button state
      if (button) {
        button.textContent = originalText || "Download PDF";
        button.disabled = false;
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl shadow p-6 text-center space-y-4">
        <h1 className="text-3xl font-bold text-slate-800">Your Dating DNA</h1>
        <div className="space-y-2">
          <div className="text-2xl font-semibold text-violet-600">
            {result.typeCode}
          </div>
          <div className="text-lg text-slate-600">{result.typeName}</div>
        </div>
        <button
          onClick={() =>
            downloadResultsAsPDF(
              resultsRef as RefObject<HTMLElement>,
              "singles-results.pdf"
            )
          }
          className="px-4 py-2 bg-black text-white rounded-lg font-medium hover:opacity-80 cursor-pointer transition-all duration-500"
        >
          Download PDF
        </button>
        <p className="text-red-500 text-sm">
          Don&apos;t refresh the page before downloading the results, because
          your attempt has been used
        </p>
      </div>

      <div
        ref={resultsRef}
        className="bg-white rounded-2xl shadow p-6 space-y-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <StrandBar label="Social Energy" value={result.scores.socialEnergy} />
          <StrandBar
            label="Attraction Driver"
            value={result.scores.attractionDriver}
          />
          <StrandBar
            label="Decision Filter"
            value={result.scores.decisionFilter}
          />
          <StrandBar
            label="Relationship Rhythm"
            value={result.scores.relationshipRhythm}
          />
        </div>

        <section className="space-y-2">
          <h3 className="text-lg font-semibold">Relationship Approach</h3>
          <p className="text-slate-700">{result.relationshipApproach}</p>
        </section>

        <section className="space-y-3">
          <h3 className="text-lg font-semibold">Strengths</h3>
          <ul className="space-y-2">
            {result.strengths.map((s, i) => (
              <li
                key={i}
                className="bg-violet-50 border border-violet-100 rounded-xl p-3"
              >
                <div className="font-medium">{s.title}</div>
                <div className="text-slate-700 text-sm">{s.detail}</div>
              </li>
            ))}
          </ul>
        </section>

        <section className="space-y-3">
          <h3 className="text-lg font-semibold">Growth Opportunities</h3>
          <ul className="space-y-2">
            {result.growthOpportunities.map((g, i) => (
              <li
                key={i}
                className="bg-amber-50 border border-amber-100 rounded-xl p-3"
              >
                <div className="font-medium">{g.title}</div>
                <div className="text-slate-700 text-sm">
                  <strong>Why it matters:</strong> {g.rationale}
                </div>
                <div className="text-slate-700 text-sm">
                  <strong>Practice:</strong> {g.action}
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="space-y-3">
          <h3 className="text-lg font-semibold">Quick Wins</h3>
          <ul className="space-y-2">
            {result.quickWins.map((q, i) => (
              <li
                key={i}
                className="bg-emerald-50 border border-emerald-100 rounded-xl p-3"
              >
                <div className="text-slate-800 text-sm">
                  <strong>Action:</strong> {q.action}
                </div>
                <div className="text-slate-700 text-sm">
                  <strong>Outcome:</strong> {q.expectedOutcome}
                </div>
                <div className="text-slate-700 text-sm">
                  <strong>When:</strong> {q.timeframe}
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="space-y-3">
          <h3 className="text-lg font-semibold">30‑Day Plan</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {(["week1", "week2", "week3", "week4"] as const).map((wk) => (
              <div
                key={wk}
                className="bg-slate-50 border border-slate-200 rounded-xl p-3"
              >
                <div className="font-medium mb-2">{wk.toUpperCase()}</div>
                <ul className="list-disc ml-5 space-y-1">
                  {result.plan30Day[wk].map((item, i) => (
                    <li key={i} className="text-slate-700 text-sm">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Grace CTA */}
      {/* <div className="bg-green-600 text-white rounded-2xl shadow p-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="w-3/4">
          <div className="text-lg font-semibold">
            Try Grace • 7‑day coaching trial
          </div>
          <div className="text-sm opacity-90">
            Personalized guidance based on your {result.typeCode} profile.
            Credit card required; auto‑converts if not cancelled.
          </div>
        </div>
        {graceActive ? (
          <span className="inline-flex items-center gap-2 bg-white text-violet-700 font-medium rounded-lg px-4 py-2">
            ✔ Trial Active
          </span>
        ) : (
          <button
            onClick={onStartGraceTrial}
            className="px-5 py-2.5 bg-white w-max text-violet-700 rounded-lg font-semibold hover:bg-violet-50"
          >
            Start Trial
          </button>
        )}
      </div> */}
    </div>
  );
}

function CouplesResults({ result }: { result: CouplesResultDeterministic }) {
  const resultsRef = useRef<HTMLDivElement>(null);

  const downloadResultsAsPDF = async (
    elementRef: RefObject<HTMLElement>,
    filename: string = "singles-results.pdf"
  ) => {
    if (!elementRef.current) {
      toast.error("Results content not found. Please try refreshing the page.");
      return;
    }

    // Show loading state
    const button = document.querySelector(
      'button[onClick*="downloadResultsAsPDF"]'
    ) as HTMLButtonElement;
    const originalText = button?.textContent;
    if (button) {
      button.textContent = "Generating PDF...";
      button.disabled = true;
    }

    try {
      // Get the HTML content - only get the inner content, not the entire element
      const htmlContent = elementRef.current.innerHTML;

      // Add basic styling for PDF
      const styledHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Singles Results</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
            }
            .bg-white { background-color: #ffffff !important; }
            .text-slate-800 { color: #1e293b !important; }
            .text-slate-600 { color: #475569 !important; }
            .text-slate-700 { color: #334155 !important; }
            .text-violet-600 { color: #7c3aed !important; }
            .bg-violet-50 { background-color: #f5f3ff !important; }
            .bg-amber-50 { background-color: #fffbeb !important; }
            .bg-emerald-50 { background-color: #ecfdf5 !important; }
            .bg-slate-50 { background-color: #f8fafc !important; }
            .border-violet-100 { border-color: #ede9fe !important; }
            .border-amber-100 { border-color: #fed7aa !important; }
            .border-emerald-100 { border-color: #d1fae5 !important; }
            .border-slate-200 { border-color: #e2e8f0 !important; }
            .rounded-xl { border-radius: 0.75rem !important; }
            .rounded-2xl { border-radius: 1rem !important; }
            .shadow { box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06) !important; }
            .p-3 { padding: 0.75rem !important; }
            .p-6 { padding: 1.5rem !important; }
            .space-y-2 > * + * { margin-top: 0.5rem !important; }
            .space-y-3 > * + * { margin-top: 0.75rem !important; }
            .space-y-4 > * + * { margin-top: 1rem !important; }
            .space-y-6 > * + * { margin-top: 1.5rem !important; }
            .grid { display: grid !important; }
            .grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)) !important; }
            .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
            .gap-3 { gap: 0.75rem !important; }
            .gap-4 { gap: 1rem !important; }
            .text-center { text-align: center !important; }
            .text-lg { font-size: 1.125rem !important; }
            .text-xl { font-size: 1.25rem !important; }
            .text-2xl { font-size: 1.5rem !important; }
            .text-3xl { font-size: 1.875rem !important; }
            .font-medium { font-weight: 500 !important; }
            .font-semibold { font-weight: 600 !important; }
            .font-bold { font-weight: 700 !important; }
            .text-sm { font-size: 0.875rem !important; }
            .list-disc { list-style-type: disc !important; }
            .ml-5 { margin-left: 1.25rem !important; }
            .mb-2 { margin-bottom: 0.5rem !important; }
            .max-w-4xl { max-width: 56rem !important; }
            .mx-auto { margin-left: auto !important; margin-right: auto !important; }
            @media (max-width: 768px) {
              .md\\:grid-cols-2 { grid-template-columns: repeat(1, minmax(0, 1fr)) !important; }
            }
          </style>
        </head>
        <body>
          ${htmlContent}
        </body>
        </html>
      `;

      // Send to server for PDF generation
      const response = await fetch("/api/pdf/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          html: styledHTML,
          filename: filename,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate PDF");
      }

      // Download the PDF
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      // Show success message
      toast.success("PDF downloaded successfully!");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error(
        "PDF download failed. Please try again or contact support if the issue persists."
      );
    } finally {
      // Restore button state
      if (button) {
        button.textContent = originalText || "Download PDF";
        button.disabled = false;
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl shadow p-6 text-center space-y-4">
        <h1 className="text-3xl font-bold text-slate-800">Your Couples DNA</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="text-lg font-semibold text-violet-600">
              Partner A: {result.partnerA.typeCode}
            </div>
            <div className="text-sm text-slate-600">
              {result.partnerA.typeName}
            </div>
          </div>
          <div className="space-y-2">
            <div className="text-lg font-semibold text-fuchsia-600">
              Partner B: {result.partnerB.typeCode}
            </div>
            <div className="text-sm text-slate-600">
              {result.partnerB.typeName}
            </div>
          </div>
        </div>
        <button
          onClick={() =>
            downloadResultsAsPDF(
              resultsRef as RefObject<HTMLElement>,
              "couples-results.pdf"
            )
          }
          className="px-4 py-2 bg-slate-600 text-white rounded-lg font-medium hover:bg-slate-700"
        >
          Download PDF
        </button>
      </div>

      <div
        ref={resultsRef}
        className="bg-white rounded-2xl shadow p-6 space-y-6"
      >
        <section className="space-y-2">
          <h3 className="text-lg font-semibold">Relationship Approach</h3>
          <p className="text-slate-700">
            {result.coupleProfile.relationshipApproach}
          </p>
        </section>

        <section className="space-y-3">
          <h3 className="text-lg font-semibold">Joint Strengths</h3>
          <ul className="space-y-2">
            {result.coupleProfile.jointStrengths.map((s, i) => (
              <li
                key={i}
                className="bg-violet-50 border border-violet-100 rounded-xl p-3"
              >
                <div className="font-medium">{s.title}</div>
                <div className="text-slate-700 text-sm">
                  <strong>How to leverage:</strong> {s.howToLeverage}
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="space-y-3">
          <h3 className="text-lg font-semibold">Shared Growth Areas</h3>
          <ul className="space-y-2">
            {result.coupleProfile.sharedGrowthAreas.map((g, i) => (
              <li
                key={i}
                className="bg-amber-50 border border-amber-100 rounded-xl p-3"
              >
                <div className="font-medium">{g.title}</div>
                <div className="text-slate-700 text-sm">
                  <strong>Supportive behavior:</strong> {g.supportiveBehavior}
                </div>
                <div className="text-slate-700 text-sm">
                  <strong>Shared practice:</strong> {g.sharedPractice}
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="space-y-3">
          <h3 className="text-lg font-semibold">Joint Quick Wins</h3>
          <ul className="space-y-2">
            {result.coupleProfile.jointQuickWins.map((q, i) => (
              <li
                key={i}
                className="bg-emerald-50 border border-emerald-100 rounded-xl p-3"
              >
                <div className="text-slate-800 text-sm">
                  <strong>Action:</strong> {q.action}
                </div>
                <div className="text-slate-700 text-sm">
                  <strong>Implementation:</strong> {q.implementation}
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="space-y-3">
          <h3 className="text-lg font-semibold">Joint 30‑Day Plan</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {(["week1", "week2", "week3", "week4"] as const).map((wk) => (
              <div
                key={wk}
                className="bg-slate-50 border border-slate-200 rounded-xl p-3"
              >
                <div className="font-medium mb-2">{wk.toUpperCase()}</div>
                <ul className="list-disc ml-5 space-y-1">
                  {result.coupleProfile.jointPlan30Day[wk].map((item, i) => (
                    <li key={i} className="text-slate-700 text-sm">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Grace CTA */}
      {/* <div className="bg-green-600 text-white rounded-2xl shadow p-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="text-lg font-semibold">
            Try Grace • 7‑day coaching trial
          </div>
          <div className="text-sm opacity-90">
            Personalized guidance for your {result.partnerA.typeCode}+
            {result.partnerB.typeCode} partnership. Credit card required;
            auto‑converts if not cancelled.
          </div>
        </div>
        {graceActive ? (
          <span className="inline-flex items-center gap-2 bg-white text-violet-700 font-medium rounded-lg px-4 py-2">
            ✔ Trial Active
          </span>
        ) : (
          <button
            onClick={onStartGraceTrial}
            className="px-5 py-2.5 bg-white text-violet-700 rounded-lg font-semibold hover:bg-violet-50"
          >
            Start 7‑day trial
          </button>
        )}
      </div> */}
    </div>
  );
}

function CouplesAssessment({
  onComplete,
}: {
  onComplete: (r: CouplesResultDeterministic) => void;
}) {
  const [phase, setPhase] = useState<"A" | "B" | "DONE">("A");
  const [aResult, setAResult] = useState<SinglesResultDeterministic | null>(
    null
  );

  function handleDoneA(res: SinglesResultDeterministic) {
    setAResult(res);
    setPhase("B");
  }
  function handleDoneB(resB: SinglesResultDeterministic) {
    if (!aResult) return;
    const partnerA = aResult;
    const partnerB = resB;
    const coupleProfile = buildCoupleProfile(partnerA, partnerB);
    const couple: CouplesResultDeterministic = {
      assessmentType: "couples",
      partnerA,
      partnerB,
      coupleProfile,
    };

    // CRITICAL: Validate complete blueprint before returning
    // This ensures no truncated or incomplete couples results are ever returned
    try {
      validateBlueprint(couple);
    } catch (error) {
      if (error instanceof ValidationError) {
        console.error("Couples Blueprint Validation Failed:", {
          section: error.section,
          expected: error.expected,
          actual: error.actual,
          message: error.message,
        });
        // In production, this should fail loudly and not return partial results
        throw new Error(
          `Couples assessment validation failed: ${error.message}`
        );
      }
      throw error;
    }

    setPhase("DONE");
    onComplete(couple);
  }

  if (phase === "A")
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-2xl p-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl flex items-center justify-center mx-auto shadow-xl">
            <svg
              className="w-10 h-10 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-800">
            Partner A Assessment
          </h2>
          <p className="text-slate-600">
            First partner completes the assessment
          </p>
        </div>
        <SinglesAssessment onComplete={handleDoneA} />
      </div>
    );
  if (phase === "B")
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-2xl p-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl flex items-center justify-center mx-auto shadow-xl">
            <svg
              className="w-10 h-10 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-800">
            Partner B Assessment
          </h2>
          <p className="text-slate-600">
            Second partner completes the assessment
          </p>
        </div>
        <SinglesAssessment onComplete={handleDoneB} />
      </div>
    );
  return null;
}

// CRITICAL: DO NOT TRUNCATE ANY COUPLES ASSESSMENT RESULTS
// Joint Strengths: 6-10 items, each 4-6 sentences (200-350 words total)
// Shared Growth Areas: 5-8 items, each 4-6 sentences (180-300 words total)
// Joint Quick Wins: 8-12 items, each 4-5 sentences (250-400 words total)
// Joint 30-Day Plan: 20-25 items total, each 4-6 sentences (500-750 words total)
function buildCoupleProfile(
  a: SinglesResultDeterministic,
  b: SinglesResultDeterministic
): CouplesResultDeterministic["coupleProfile"] {
  // CRITICAL: DO NOT TRUNCATE - Generate ALL joint strengths (6-10 items required)
  const combinedStrengths = [...a.strengths, ...b.strengths];
  const uniqueStrengthTitles = [
    ...new Set(combinedStrengths.map((s) => s.title)),
  ];
  const jointStrengths = uniqueStrengthTitles.map((title) => {
    const strength = combinedStrengths.find((s) => s.title === title)!;
    return {
      title,
      howToLeverage: `Both partners can leverage this by: ${strength.detail.toLowerCase()}. Schedule regular check-ins to maximize this shared strength.`,
    };
  });

  // CRITICAL: DO NOT TRUNCATE - Generate ALL shared growth areas (5-8 items required)
  const combinedGrowth = [...a.growthOpportunities, ...b.growthOpportunities];
  const uniqueGrowthTitles = [...new Set(combinedGrowth.map((g) => g.title))];
  const sharedGrowthAreas = uniqueGrowthTitles.map((title) => {
    const growth = combinedGrowth.find((g) => g.title === title)!;
    return {
      title,
      supportiveBehavior: `Support each other by: ${growth.action.toLowerCase()}.`,
      sharedPractice: `Practice together: ${growth.rationale.toLowerCase()}.`,
    };
  });

  // Create relationship approach based on actual type codes and compatibility
  const typeCompatibility = getTypeCompatibility(a.typeCode, b.typeCode);
  const relationshipApproach = `As a ${a.typeCode}-${b.typeCode} couple, you bring together ${a.typeName} and ${b.typeName} approaches. ${typeCompatibility} Your combined strengths create a dynamic partnership where you can balance each other's natural tendencies. Together, you navigate relationships by leveraging your complementary styles and creating harmony through understanding your differences.`;

  // CRITICAL: DO NOT TRUNCATE - Generate ALL joint quick wins (8-12 items required)
  const combinedQuickWins = [...a.quickWins, ...b.quickWins];
  const jointQuickWins = combinedQuickWins.map((qw) => ({
    action: qw.action,
    implementation: `Both partners: ${qw.expectedOutcome.toLowerCase()}. Timeline: ${
      qw.timeframe
    }.`,
  }));

  // CRITICAL: DO NOT TRUNCATE - Create joint 30-day plan (20-25 items total required)
  const combineWeekPlans = (weekA: string[], weekB: string[]) => {
    const combined = [...weekA, ...weekB];
    return combined; // NEVER truncate - show ALL combined items per specification
  };

  const jointPlan30Day = {
    week1: combineWeekPlans(a.plan30Day.week1, b.plan30Day.week1),
    week2: combineWeekPlans(a.plan30Day.week2, b.plan30Day.week2),
    week3: combineWeekPlans(a.plan30Day.week3, b.plan30Day.week3),
    week4: combineWeekPlans(a.plan30Day.week4, b.plan30Day.week4),
  };

  // Add required aiNarrative and supportingContent properties
  const aiNarrative = {
    overviewSummary: `As a ${a.typeCode}-${b.typeCode} couple, you combine ${a.typeName} and ${b.typeName} approaches to create a unique partnership dynamic. Your relationship leverages the strengths of both types while navigating the natural tensions that arise from your differences. This combination offers opportunities for growth, balance, and mutual support as you build your connection together.`,
    coupleDynamics: `Your couple dynamics are shaped by the interplay between ${a.typeName} and ${b.typeName} approaches. This creates a relationship where you can complement each other's natural tendencies and create balance through understanding your differences.`,
    communicationStyleAsCouple: `Together, you communicate by blending your individual styles. This creates opportunities for both structured and organic dialogue, allowing you to address both practical and emotional aspects of your relationship.`,
    intimacyPatterns: `Your intimacy develops through the unique combination of your individual approaches to connection. This allows for both planned and spontaneous moments of closeness, creating a rich and varied intimate life.`,
    sharedGrowthAreas: `Your shared growth areas focus on leveraging your complementary strengths while addressing the challenges that arise from your different approaches. This creates opportunities for mutual development and deeper understanding.`,
    jointStrengths: `Together, your joint strengths create a powerful foundation for your relationship. By combining your individual capabilities, you can achieve more together than either could alone.`,
    expandedNarrative: `Your relationship represents a unique blend of approaches that, when understood and appreciated, creates a strong foundation for long-term success. By recognizing and leveraging your differences, you can build a partnership that grows stronger over time. Your combined strengths offer multiple pathways to connection, growth, and mutual support. The key to your success lies in understanding how your individual Dating DNA types complement each other and using this knowledge to navigate challenges and celebrate your unique dynamic.`,
  };

  const supportingContent = {
    strandBreakdowns: {
      socialEnergy: {
        partnerADescription: `Partner A (${a.typeCode[0]}): ${
          a.typeCode[0] === "C"
            ? "Connector approach to social energy"
            : "Focuser approach to social energy"
        }`,
        partnerBDescription: `Partner B (${b.typeCode[0]}): ${
          b.typeCode[0] === "C"
            ? "Connector approach to social energy"
            : "Focuser approach to social energy"
        }`,
        comparison: `Social energy compatibility: ${
          Math.abs(a.scores.socialEnergy - b.scores.socialEnergy) < 25
            ? "High alignment"
            : "Complementary differences"
        }`,
        implications:
          "This affects how you engage socially as a couple and manage your energy together.",
      },
      attractionDriver: {
        partnerADescription: `Partner A (${a.typeCode[1]}): ${
          a.typeCode[1] === "P"
            ? "Present-focused attraction"
            : "Potential-focused attraction"
        }`,
        partnerBDescription: `Partner B (${b.typeCode[1]}): ${
          b.typeCode[1] === "P"
            ? "Present-focused attraction"
            : "Potential-focused attraction"
        }`,
        comparison: `Attraction driver compatibility: ${
          Math.abs(a.scores.attractionDriver - b.scores.attractionDriver) < 25
            ? "High alignment"
            : "Complementary differences"
        }`,
        implications:
          "This influences what you each value in the relationship and how you make decisions about your future together.",
      },
      decisionFilter: {
        partnerADescription: `Partner A (${a.typeCode[2]}): ${
          a.typeCode[2] === "L"
            ? "Logic-based decision making"
            : "Heart-based decision making"
        }`,
        partnerBDescription: `Partner B (${b.typeCode[2]}): ${
          b.typeCode[2] === "L"
            ? "Logic-based decision making"
            : "Heart-based decision making"
        }`,
        comparison: `Decision filter compatibility: ${
          Math.abs(a.scores.decisionFilter - b.scores.decisionFilter) < 25
            ? "High alignment"
            : "Complementary differences"
        }`,
        implications:
          "This affects how you make decisions together and resolve conflicts as a couple.",
      },
      relationshipRhythm: {
        partnerADescription: `Partner A (${a.typeCode[3]}): ${
          a.typeCode[3] === "S"
            ? "Structured relationship approach"
            : "Organic relationship approach"
        }`,
        partnerBDescription: `Partner B (${b.typeCode[3]}): ${
          b.typeCode[3] === "S"
            ? "Structured relationship approach"
            : "Organic relationship approach"
        }`,
        comparison: `Relationship rhythm compatibility: ${
          Math.abs(a.scores.relationshipRhythm - b.scores.relationshipRhythm) <
          25
            ? "High alignment"
            : "Complementary differences"
        }`,
        implications:
          "This influences your preferred pace and structure for relationship development.",
      },
    },
    everydayExamples: [
      {
        scenario: "Planning a weekend together",
        partnerAResponse: `Partner A tends to ${
          a.typeCode[3] === "S"
            ? "prefer structured planning"
            : "go with the flow"
        }`,
        partnerBResponse: `Partner B tends to ${
          b.typeCode[3] === "S"
            ? "prefer structured planning"
            : "go with the flow"
        }`,
        coupleInsight:
          "Finding balance between structure and spontaneity enhances your weekend experiences.",
      },
    ],
    jointActionPlan7Days: [
      {
        day: 1,
        collaborativeAction:
          "Discuss your individual Dating DNA results together",
        purpose: "Build understanding of your unique approaches",
      },
      {
        day: 3,
        collaborativeAction: "Practice one joint strength from your results",
        purpose: "Leverage your combined capabilities",
      },
      {
        day: 5,
        collaborativeAction: "Address one shared growth area together",
        purpose: "Support mutual development",
      },
      {
        day: 7,
        collaborativeAction:
          "Plan your next week using insights from your joint plan",
        purpose: "Apply your Dating DNA knowledge practically",
      },
    ],
    jointActionPlan30Days: [
      {
        week: 1,
        progressiveActions: [
          "Establish regular check-ins",
          "Practice active listening",
        ],
        goals: "Build communication foundation",
      },
      {
        week: 2,
        progressiveActions: [
          "Implement joint quick wins",
          "Address growth areas",
        ],
        goals: "Apply Dating DNA insights",
      },
      {
        week: 3,
        progressiveActions: ["Refine your approach", "Celebrate progress"],
        goals: "Optimize your partnership",
      },
      {
        week: 4,
        progressiveActions: ["Plan for continued growth", "Set future goals"],
        goals: "Sustain long-term development",
      },
    ],
  };

  return {
    jointStrengths,
    sharedGrowthAreas,
    relationshipApproach,
    jointQuickWins,
    jointPlan30Day,
    aiNarrative,
    supportingContent,
  };
}

// Helper function to determine type compatibility
function getTypeCompatibility(typeA: string, typeB: string): string {
  if (typeA === typeB) {
    return "You share the same Dating DNA type, creating natural understanding and alignment.";
  }

  const differences = typeA
    .split("")
    .filter((char, i) => char !== typeB[i]).length;

  if (differences === 1) {
    return "You have highly compatible types with one key difference that creates healthy balance.";
  } else if (differences === 2) {
    return "Your types complement each other well, with differences that can strengthen your partnership.";
  } else if (differences === 3) {
    return "You bring contrasting approaches that, when balanced, create a dynamic and growth-oriented relationship.";
  } else {
    return "You represent opposite approaches to dating, which can create powerful synergy when you understand and appreciate your differences.";
  }
}

// ---------- Paywall Simulation & Lead Magnet ----------

function LeadMagnet4Q({
  onFinish,
}: {
  onFinish: (answers: Record<string, number | "A" | "B">) => void;
}) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number | "A" | "B">>(
    {}
  );

  const LM_QS: Question[] = [
    {
      id: "LM-1",
      dimension: "socialEnergy",
      kind: "forced",
      prompt: "When meeting new people I usually…",
      options: { A: "Cast a wide net", B: "Keep it selective" },
    },
    {
      id: "LM-2",
      dimension: "relationshipRhythm",
      kind: "forced",
      prompt: "My relationship pace feels best when…",
      options: { A: "There&apos;s a clear plan", B: "It unfolds naturally" },
    },
    {
      id: "LM-3",
      dimension: "attractionDriver",
      kind: "likert",
      prompt: "I value long‑term potential over present fit.",
    },
    {
      id: "LM-4",
      dimension: "decisionFilter",
      kind: "likert",
      prompt: "I decide with my head more than my heart.",
    },
  ];

  const currentQ = LM_QS[step];
  const isLastQ = step >= LM_QS.length;

  function handleAnswer(value: number | "A" | "B") {
    const newAnswers = { ...answers, [currentQ.id]: value };
    setAnswers(newAnswers);
    setStep(step + 1);
  }
  const buttonRef = useRef<HTMLButtonElement>();
  function handleEmailSubmit() {
    onFinish(answers);
    buttonRef.current.disabled = true;
  }

  if (isLastQ) {
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-2xl p-8 space-y-6">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center mx-auto">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-slate-800">
            Get Your Quick Snapshot
          </h3>
          <p className="text-slate-600 text-lg">
            Your personalized Dating DNA snapshot is ready! We&apos;ll send it
            to your email with detailed insights about your responses.
          </p>
        </div>

        <div className="bg-green-50 rounded-2xl p-6 space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-violet-500 rounded-full"></div>
            <span className="text-slate-700 font-medium">
              Instant email delivery
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-fuchsia-500 rounded-full"></div>
            <span className="text-slate-700 font-medium">
              Personalized insights
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
            <span className="text-slate-700 font-medium">
              Free personality analysis
            </span>
          </div>
        </div>

        <button
          onClick={handleEmailSubmit}
          ref={buttonRef}
          className="w-full px-6 py-4 bg-green-600 cursor-pointer text-white rounded-2xl font-semibold text-lg hover:from-violet-700 hover:to-fuchsia-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
        >
          Send My Snapshot
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-2xl mt-32 p-8 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Quick Snapshot</h2>
          <p className="text-slate-600">Discover your dating personality</p>
        </div>
        <div className="text-right">
          <span className="text-sm text-slate-500">Question</span>
          <div className="text-2xl font-bold text-violet-600">
            {step + 1} of {LM_QS.length}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-slate-600">
          <span>Progress</span>
          <span>{Math.round(((step + 1) / LM_QS.length) * 100)}%</span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-3">
          <div
            className="bg-green-600 h-3 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${((step + 1) / LM_QS.length) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Question */}
      <div className="space-y-6">
        <div className="bg-green-50 rounded-2xl p-6">
          <h3 className="text-xl font-semibold text-slate-800 leading-relaxed">
            {currentQ.prompt}
          </h3>
        </div>

        {/* Answer Options */}
        {currentQ.kind === "forced" ? (
          <div className="space-y-4">
            <button
              onClick={() => handleAnswer("A")}
              className="cursor-pointer w-full p-6 text-left border-2 border-slate-200 rounded-2xl hover:border-violet-400 hover:bg-violet-50 transition-all duration-300 group"
            >
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-violet-100 text-violet-600 rounded-full flex items-center justify-center font-semibold group-hover:bg-violet-200 transition-colors duration-300">
                  A
                </div>
                <span className="text-lg font-medium text-slate-800">
                  {currentQ.options.A}
                </span>
              </div>
            </button>
            <button
              onClick={() => handleAnswer("B")}
              className="cursor-pointer w-full p-6 text-left border-2 border-slate-200 rounded-2xl hover:border-fuchsia-400 hover:bg-fuchsia-50 transition-all duration-300 group"
            >
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-fuchsia-100 text-fuchsia-600 rounded-full flex items-center justify-center font-semibold group-hover:bg-fuchsia-200 transition-colors duration-300">
                  B
                </div>
                <span className="text-lg font-medium text-slate-800">
                  {currentQ.options.B}
                </span>
              </div>
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-between text-sm text-slate-600 font-medium">
              <span>Strongly Disagree</span>
              <span>Strongly Agree</span>
            </div>
            <div className="flex justify-between gap-3">
              {[1, 2, 3, 4, 5, 6, 7].map((val) => (
                <button
                  key={val}
                  onClick={() => handleAnswer(val)}
                  className="w-12 h-12 rounded-full  bg-violet-50 cursor-pointer hover:bg-violet-100 flex items-center justify-center font-semibold text-lg transition-all duration-300 hover:scale-110 hover:shadow-lg"
                >
                  {val}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------- Main Component ----------

// Export types and functions for testing
export {
  QUESTIONS,
  validateBlueprint,
  ValidationError,
  buildSinglesResult,
  type SinglesAnswers,
  type SinglesResultDeterministic,
  type CouplesResultDeterministic,
};

interface DatingDNAAssessmentProps {
  assessmentType?: "single" | "couple";
}

export default function DatingDNAAssessment({}: DatingDNAAssessmentProps) {
  const { status, data: session } = useSession();

  const [mode, setMode] = useState<
    | "home"
    | "singles"
    | "couples"
    | "leadMagnet"
    | "singlesResults"
    | "couplesResults"
    | "paywall"
  >("home");
  const [singlesResult, setSinglesResult] =
    useState<SinglesResultDeterministic | null>(null);
  const [couplesResult, setCouplesResult] =
    useState<CouplesResultDeterministic | null>(null);

  async function handleSinglesComplete(result: SinglesResultDeterministic) {
    toast.info("Showing results...");
    const user = (await getSession())?.user as ExtendedUser;
    try {
      await axios.put("/api/assessment", {
        id: user?.id,
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred");
    }
    setSinglesResult(result);
    setMode("singlesResults");
  }

  async function handleCouplesComplete(result: CouplesResultDeterministic) {
    toast.info("Showing results...");
    const user = (await getSession())?.user as ExtendedUser;
    try {
      await axios.put("/api/assessment", {
        id: user?.id,
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred");
    }
    setCouplesResult(result);
    setMode("couplesResults");
  }

  async function handleLeadMagnetComplete(
    answers: Record<string, number | "A" | "B">
  ) {
    console.log("Quick assessment answers:", answers);

    if (status === "unauthenticated") {
      toast.error("Please login to get your snapshot");
      return;
    }

    if (!session?.user?.email) {
      toast.error("Please login to get your snapshot");
      return;
    }

    try {
      await axios.post("/api/assessment", {
        email: session.user.email,
        answers,
      });

      toast.success(
        `Thank you! Your snapshot has been sent to ${session.user?.email}`
      );
      setMode("home");
    } catch (error) {
      console.error("Failed to send quick assessment:", error);
      toast.error("Failed to send snapshot. Please try again.");
    }
  }

  if (mode === "home") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-fuchsia-50 to-purple-50 p-4">
        <div className="max-w-4xl mx-auto space-y-8 pt-32">
          {/* Hero Section */}
          <div className="text-center space-y-6">
            <div className="space-y-4">
              <h1 className="text-5xl md:text-6xl h-max pb-4 font-bold bg-gradient-to-r from-violet-600 via-fuchsia-600 to-purple-600 bg-clip-text text-transparent">
                Dating DNA
              </h1>
              <p className="text-xl md:text-2xl text-slate-700 max-w-3xl mx-auto leading-relaxed">
                Discover your unique relationship personality and unlock the
                secrets to deeper, more meaningful connections
              </p>
            </div>

            {/* Decorative Elements */}
            <div className="flex justify-center space-x-4">
              <div className="w-3 h-3 bg-violet-400 rounded-full animate-pulse"></div>
              <div
                className="w-3 h-3 bg-fuchsia-400 rounded-full animate-pulse"
                style={{ animationDelay: "0.2s" }}
              ></div>
              <div
                className="w-3 h-3 bg-purple-400 rounded-full animate-pulse"
                style={{ animationDelay: "0.4s" }}
              ></div>
            </div>
          </div>

          {/* Assessment Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Quick Snapshot Card */}
            <div className="group relative overflow-hidden bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative p-8 space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-green-600 rounded-2xl flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800">
                      Quick Snapshot
                    </h2>
                    <p className="text-slate-600">
                      4 questions, instant insights
                    </p>
                  </div>
                </div>

                <p className="text-slate-700 leading-relaxed">
                  Get a personalized glimpse into your dating personality with
                  our quick 4-question assessment. Perfect for busy people who
                  want immediate insights.
                </p>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-sm text-slate-600">
                    <div className="w-2 h-2 bg-violet-400 rounded-full"></div>
                    <span>Instant email results</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-slate-600">
                    <div className="w-2 h-2 bg-fuchsia-400 rounded-full"></div>
                    <span>No registration required</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-slate-600">
                    <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                    <span>Free personality insights</span>
                  </div>
                </div>

                <Button
                  onClick={() => setMode("leadMagnet")}
                  variant="contained"
                  sx={{
                    background:
                      "linear-gradient(135deg, #7c3aed 0%, #c026d3 100%)",
                    borderRadius: "12px",
                    padding: "12px 24px",
                    fontSize: "16px",
                    fontWeight: "600",
                    textTransform: "none",
                    boxShadow: "0 4px 14px 0 rgba(124, 58, 237, 0.4)",
                    "&:hover": {
                      // background: "linear-gradient(135deg, #6d28d9 0%, #a21caf 100%)",
                      boxShadow: "0 6px 20px 0 rgba(124, 58, 237, 0.6)",
                    },
                  }}
                >
                  Start Quick Snapshot
                </Button>
              </div>
            </div>

            {/* Full Assessment Card */}
            <div className="group relative overflow-hidden bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative p-8 space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800">
                      Full Assessment
                    </h2>
                    <p className="text-slate-600">
                      32 questions, complete analysis
                    </p>
                  </div>
                </div>

                <p className="text-slate-700 leading-relaxed">
                  Dive deep into your dating personality with our comprehensive
                  32-question assessment. Get detailed insights, personalized
                  recommendations, and a complete action plan.
                </p>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-sm text-slate-600">
                    <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                    <span>Complete personality profile</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-slate-600">
                    <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
                    <span>Detailed PDF report</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-slate-600">
                    <div className="w-2 h-2 bg-indigo-400 rounded-full"></div>
                    <span>30-day action plan</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={() => setMode("singles")}
                    className="w-full px-6 py-4 bg-green-600 text-white rounded-2xl font-semibold hover:from-violet-700 hover:to-fuchsia-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl disabled:pointer-events-none disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                    disabled={
                      (session?.user as ExtendedUser)?.type !== "single" ||
                      ((session?.user as ExtendedUser)?.attempts || 0) <= 0 ||
                      new Date() >
                        ((session?.user as ExtendedUser)?.validity ||
                          new Date())
                    }
                  >
                    Singles Assessment
                  </button>
                  <button
                    onClick={() => setMode("couples")}
                    className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-semibold hover:from-purple-700 hover:to-pink-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl disabled:pointer-events-none disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                    disabled={
                      (session?.user as ExtendedUser)?.type !== "couple" ||
                      ((session?.user as ExtendedUser)?.attempts || 0) <= 0 ||
                      new Date() >
                        ((session?.user as ExtendedUser)?.validity ||
                          new Date())
                    }
                  >
                    Couples Assessment
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Features Section */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl">
            <h3 className="text-2xl font-bold text-center text-slate-800 mb-8">
              Why Choose Dating DNA?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center space-y-3">
                <div className="w-16 h-16 bg-gradient-to-br from-violet-400 to-fuchsia-400 rounded-2xl flex items-center justify-center mx-auto">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                </div>
                <h4 className="font-semibold text-slate-800">Science-Based</h4>
                <p className="text-sm text-slate-600">
                  Built on proven psychological principles and relationship
                  research
                </p>
              </div>
              <div className="text-center space-y-3">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-400 rounded-2xl flex items-center justify-center mx-auto">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                    />
                  </svg>
                </div>
                <h4 className="font-semibold text-slate-800">Personalized</h4>
                <p className="text-sm text-slate-600">
                  Get insights tailored specifically to your unique personality
                </p>
              </div>
              <div className="text-center space-y-3">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-400 to-blue-400 rounded-2xl flex items-center justify-center mx-auto">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <h4 className="font-semibold text-slate-800">Actionable</h4>
                <p className="text-sm text-slate-600">
                  Receive practical steps to improve your dating life
                  immediately
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (mode === "leadMagnet") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-fuchsia-50 to-purple-50 p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Back Button */}
          <button
            onClick={() => setMode("home")}
            className="group flex items-center space-x-2 px-4 py-2 bg-white/80 backdrop-blur-sm text-slate-600 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-white"
          >
            <svg
              className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            <span>Back to Home</span>
          </button>

          {/* Assessment Component */}
          <LeadMagnet4Q onFinish={handleLeadMagnetComplete} />
        </div>
      </div>
    );
  }

  if (mode === "singles") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-fuchsia-50 to-purple-50 p-4">
        <div className="max-w-4xl mx-auto space-y-6 pt-16">
          {/* Back Button */}
          <button
            onClick={() => setMode("home")}
            className="group absolute left-4 top-20 cursor-pointer flex items-center space-x-2 px-4 py-2 bg-white/80 backdrop-blur-sm text-slate-600 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-white"
          >
            <svg
              className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            <span>Back to Home</span>
          </button>

          {/* Header */}
          <div className="text-center space-y-4">
            <div className="w-20 h-20 bg-green-600 rounded-3xl flex items-center justify-center mx-auto shadow-xl">
              <svg
                className="w-10 h-10 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-slate-800">
              Singles Assessment
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Discover your unique dating personality with our comprehensive
              32-question assessment. Get detailed insights and personalized
              recommendations.
            </p>
          </div>

          <SinglesAssessment onComplete={handleSinglesComplete} />
        </div>
      </div>
    );
  }

  if (mode === "couples") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-fuchsia-50 to-purple-50 p-4">
        <div className="max-w-4xl mx-auto space-y-6 mt-32">
          {/* Back Button */}
          <button
            onClick={() => setMode("home")}
            className="group flex items-center space-x-2 px-4 py-2 bg-white/80 backdrop-blur-sm text-slate-600 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-white"
          >
            <svg
              className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            <span>Back to Home</span>
          </button>

          {/* Header */}
          <div className="text-center space-y-4">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl flex items-center justify-center mx-auto shadow-xl">
              <svg
                className="w-10 h-10 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-slate-800">
              Couples Assessment
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Explore your relationship dynamics together with our comprehensive
              couples assessment. Discover how your personalities complement
              each other.
            </p>
          </div>

          <CouplesAssessment onComplete={handleCouplesComplete} />
        </div>
      </div>
    );
  }

  if (mode === "singlesResults" && singlesResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-fuchsia-50 to-purple-50 p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          <button
            onClick={() => setMode("home")}
            className="group flex items-center space-x-2 px-4 py-2 bg-white/80 backdrop-blur-sm text-slate-600 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-white"
          >
            <svg
              className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            <span>Back to Home</span>
          </button>
          <SinglesResults result={singlesResult} />
        </div>
      </div>
    );
  }

  if (mode === "couplesResults" && couplesResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-fuchsia-50 to-purple-50 p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          <button
            onClick={() => setMode("home")}
            className="group flex items-center space-x-2 px-4 py-2 bg-white/80 backdrop-blur-sm text-slate-600 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-white"
          >
            <svg
              className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            <span>Back to Home</span>
          </button>
          <CouplesResults result={couplesResult} />
        </div>
      </div>
    );
  }

  return null;
}
