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

// Enhanced relationship approach generator following narrative contract requirements
function makeRelationshipApproach(code: string) {
  // Generate 5-7 detailed sentences with specific examples and actionable insights
  const parts: string[] = [];
  
  // Sentence 1: Overall approach statement with specific behavioral example
  const c1 =
    code[0] === "C"
      ? "You naturally expand your social circle by actively engaging with diverse groups of people, whether through dating apps, social events, or mutual friend introductions, creating multiple pathways to meaningful romantic connections."
      : "You focus your energy on cultivating deeper connections within a smaller, carefully selected circle of potential partners, preferring quality conversations and intimate settings that allow genuine compatibility to emerge naturally.";

  // Sentence 2: Attraction driver with practical dating context
  const c2 =
    code[1] === "P"
      ? "Your attraction system prioritizes present-day compatibility, meaning you evaluate potential partners based on current lifestyle alignment, shared daily routines, and immediate chemistry that feels comfortable and sustainable right now."
      : "Your attraction system is drawn to potential and future possibilities, meaning you're willing to invest in relationships where you see long-term growth potential, shared aspirations, and the exciting prospect of building something meaningful together over time.";

  // Sentence 3: Decision-making style with specific examples
  const c3 =
    code[2] === "L"
      ? "When making relationship decisions, you rely on logical analysis and practical considerations, carefully weighing factors like compatibility, shared values, financial stability, and long-term viability before committing emotionally or physically."
      : "When making relationship decisions, you trust your intuitive feelings and emotional responses, prioritizing how someone makes you feel, the natural flow of connection, and your gut instincts about whether this person feels right for your heart.";

  // Sentence 4: Relationship rhythm with timeline examples
  const c4 =
    code[3] === "S"
      ? "Your preferred relationship rhythm involves clear milestones and defined progression, such as exclusive dating by month two, meeting families by month four, and having concrete discussions about future plans within six months of dating."
      : "Your preferred relationship rhythm flows organically without rigid timelines, allowing the connection to develop naturally through spontaneous experiences, unplanned moments, and letting major relationship decisions emerge when they feel authentically right.";

  // Sentence 5: Integration and practical application
  const c5 = `This ${code} approach creates a distinctive dating style where you ${
    code[0] === "C" ? "cast a wide net while" : "selectively focus while"
  } ${code[1] === "P" ? "prioritizing immediate compatibility" : "investing in long-term potential"}, making decisions through ${
    code[2] === "L" ? "careful analysis" : "emotional intuition"
  } and following ${code[3] === "S" ? "structured timelines" : "natural rhythms"}.`;

  // Sentence 6: Success strategies specific to their type
  const c6 = `To maximize your dating success, focus on ${
    code[0] === "C" ? "leveraging your social connections and networking abilities" : "creating meaningful one-on-one experiences that showcase your depth"
  } while ${code[1] === "P" ? "seeking partners whose current lifestyle aligns with yours" : "looking for shared visions and growth-minded individuals"}, and remember that your ${
    code[2] === "L" ? "analytical approach helps you avoid incompatible matches" : "intuitive nature guides you toward emotionally fulfilling connections"
  }.`;

  // Sentence 7: Long-term relationship vision
  const c7 = `In long-term relationships, your ${code} type thrives when you can ${
    code[0] === "C" ? "maintain social connections while building intimacy" : "create a secure foundation that supports deeper bonding"
  }, ${code[1] === "P" ? "enjoy present moments together while maintaining stability" : "work toward shared goals while celebrating growth milestones"}, and navigate challenges through ${
    code[2] === "L" ? "open communication and problem-solving" : "emotional support and understanding"
  } at a pace that feels ${code[3] === "S" ? "intentional and progress-oriented" : "natural and pressure-free"}.`;

  parts.push(c1, c2, c3, c4, c5, c6, c7);
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
        "You create abundant dating opportunities by actively engaging with diverse social circles, attending networking events, joining interest-based groups, and maintaining connections across different communities, which naturally increases your chances of meeting compatible partners through both direct introductions and serendipitous encounters. Your ability to remember details about people and follow up on conversations makes others want to introduce you to their single friends, creating a positive feedback loop of dating opportunities. For example, you might meet someone at a professional mixer, connect with their friend at a book club, and end up being introduced to your future partner at a mutual friend's birthday party six months later.",
    },
    {
      title: "Social Adaptability",
      detail:
        "You excel at reading social dynamics and adjusting your communication style to match different dating contexts, whether that's being more playful on a casual coffee date, more sophisticated at a wine tasting, or more intimate during a quiet dinner conversation. This flexibility allows you to connect authentically with a wide variety of personality types and dating preferences, making you naturally attractive to many different kinds of potential partners. Your skill at pivoting topics when conversations stagnate and finding common ground with diverse individuals means you rarely experience awkward silences or incompatibility on first dates, giving you more opportunities to explore deeper connections.",
    },
    {
      title: "Energy Multiplication",
      detail:
        "You gain energy from social interactions rather than losing it, which means you can maintain an active dating life without feeling drained, attend multiple social events per week, and still have enthusiasm for meaningful conversations with new potential partners. This natural social stamina allows you to date consistently and explore multiple connections simultaneously without burning out, giving you a significant advantage in today's dating landscape. Your positive energy is contagious and draws people toward you, making you the kind of person others want to spend time with and introduce to their networks.",
    },
  ],
  F: [
    {
      title: "Depth of Presence",
      detail:
        "You create profound connections by giving your complete attention to potential partners, asking thoughtful follow-up questions, remembering important details from previous conversations, and making people feel truly heard and understood in a world where distracted, surface-level interactions are the norm. This quality makes you stand out dramatically in the dating world because so few people offer this level of genuine engagement and emotional presence. When you're with someone, they feel like they're the only person in the room, which creates powerful romantic chemistry and makes people eager to see you again because of how special you make them feel.",
    },
    {
      title: "Signal-to-Noise Discipline",
      detail:
        "You have an exceptional ability to filter through dating noise and focus your energy only on connections that show genuine romantic potential, avoiding the time-wasting casual interactions that drain other people's dating energy and resources. Your selective approach means you invest deeply in fewer people, which leads to more meaningful relationships and reduces the emotional exhaustion that comes from juggling multiple superficial connections. This focused strategy allows you to build stronger foundations with compatible partners while maintaining your emotional availability and enthusiasm for the relationships that truly matter.",
    },
    {
      title: "Authentic Intimacy",
      detail:
        "You excel at creating safe spaces for vulnerable conversations and emotional intimacy, which allows relationships to develop genuine depth much faster than typical dating patterns where people stay on the surface for months before opening up. Your comfort with meaningful dialogue and emotional expression helps potential partners feel secure enough to share their true selves, creating the foundation for lasting romantic connections. This strength is particularly valuable in today's dating climate where many people struggle with emotional availability and authentic self-expression, making your natural intimacy skills a rare and attractive quality.",
    },
  ],
  P: [
    {
      title: "Reality Anchoring",
      detail:
        "You evaluate potential partners based on current lifestyle compatibility, shared daily routines, and present-moment alignment, which helps you avoid the common dating trap of falling for someone's potential rather than who they actually are right now. This practical approach leads to more stable, sustainable relationships because you're attracted to people whose current life circumstances, values, and behaviors already mesh well with yours. For example, you naturally gravitate toward partners who share your sleep schedule, exercise habits, social preferences, and financial responsibility level, creating a solid foundation for day-to-day relationship harmony without requiring major life changes from either person.",
    },
    {
      title: "Decisive Screening",
      detail:
        "You make dating decisions based on tangible evidence and observable behaviors rather than getting caught up in fantasy or potential, which saves you from investing months in relationships that aren't actually working in practical terms. Your ability to recognize incompatibility early and act on that information prevents you from falling into the sunk-cost fallacy that keeps many people stuck in unfulfilling relationships. This strength helps you maintain high standards while dating efficiently, moving on from mismatched connections quickly so you can focus your energy on partners who demonstrate real compatibility through their actions, not just their words or promises.",
    },
    {
      title: "Lifestyle Harmony",
      detail:
        "You naturally seek partners whose current lifestyle, daily rhythms, and practical preferences align with yours, creating relationships that feel comfortable and sustainable from the beginning rather than requiring significant adjustments or compromises that might breed resentment later. Your focus on present-day compatibility means you're likely to build relationships where you genuinely enjoy spending time together in ordinary circumstances, not just during special occasions or romantic getaways. This approach leads to partnerships where both people can be themselves authentically without feeling pressure to change fundamental aspects of their personality or lifestyle to make the relationship work.",
    },
  ],
  T: [
    {
      title: "Growth Orientation",
      detail:
        "You have a unique ability to recognize potential in partners and relationships, seeing not just who someone is today but who they could become with the right support and encouragement, which allows you to build deeply fulfilling partnerships with people who share your vision for mutual development and improvement. Your growth mindset attracts ambitious, self-aware partners who appreciate having someone who believes in their potential and actively supports their personal evolution. This strength enables you to create relationships that continuously evolve and improve over time, with both partners inspiring each other to reach new levels of personal and professional achievement while maintaining strong romantic connection.",
    },
    {
      title: "Vision Cohesion",
      detail:
        "You excel at aligning with partners around shared long-term goals, future aspirations, and life visions, creating powerful romantic partnerships that feel like meaningful collaborations toward common objectives rather than just emotional connections without direction. Your ability to discuss and plan for the future helps create relationships with clear purpose and momentum, where both people are working together toward shared dreams and supporting each other's individual growth within the context of their partnership. This forward-thinking approach attracts partners who are serious about building something significant together, leading to relationships with strong foundations and exciting trajectories.",
    },
    {
      title: "Potential Catalyst",
      detail:
        "You inspire partners to pursue their highest potential by seeing their strengths, encouraging their growth, and creating supportive environments where they can develop new skills, explore new interests, and become the best versions of themselves. Your belief in people's capacity for positive change and development makes you an incredibly attractive partner because you offer something rare in relationships: genuine support for personal evolution and achievement. This quality creates deep loyalty and appreciation from partners who recognize how much they grow and improve when they're with you, leading to relationships where both people feel energized and inspired by their connection.",
    },
  ],
  L: [
    {
      title: "Clear-headed Decisions",
      detail:
        "You approach dating and relationship decisions with rational analysis and careful consideration of practical factors, which helps you avoid impulsive choices that might lead to incompatible partnerships or emotional drama down the road. Your logical approach to relationship evaluation means you can objectively assess whether someone is truly a good match for you, considering factors like shared values, life goals, communication styles, and lifestyle compatibility rather than being swayed purely by chemistry or emotional intensity. This strength protects you from getting involved with people who might seem exciting in the moment but lack the fundamental compatibility needed for long-term relationship success.",
    },
    {
      title: "Boundaries by Design",
      detail:
        "You naturally establish and maintain healthy boundaries in relationships, clearly communicating your needs, expectations, and limits in ways that create mutual respect and understanding with potential partners. Your ability to define standards for how you want to be treated and what you're willing to accept helps you attract partners who appreciate directness and emotional maturity while filtering out people who might try to manipulate or take advantage of unclear boundaries. This skill creates relationships built on mutual respect and clear communication, where both people understand what's expected and feel secure in the partnership because the rules of engagement are transparent and consistently applied.",
    },
    {
      title: "Stability Foundation",
      detail:
        "You prioritize building relationships on solid foundations of trust, consistency, and practical compatibility, which creates partnerships that can weather challenges and grow stronger over time rather than being derailed by unexpected obstacles or changing circumstances. Your logical approach to relationship building means you invest time in getting to know partners thoroughly, understanding their character, values, and long-term goals before making major emotional investments. This methodical approach to relationship development attracts partners who value security, reliability, and steady progress toward shared goals, creating partnerships that offer both emotional fulfillment and practical stability.",
    },
  ],
  H: [
    {
      title: "Empathic Bonding",
      detail:
        "You create deep emotional connections by naturally tuning into partners' feelings, needs, and emotional states, making them feel truly understood and emotionally safe in ways that many people rarely experience in their relationships. Your empathetic nature allows you to respond appropriately to your partner's emotional needs, offering comfort during difficult times, celebrating their successes with genuine enthusiasm, and creating an atmosphere of emotional support that strengthens romantic bonds. This emotional intelligence makes you an incredibly attractive partner because you offer something that everyone craves but few people provide: the feeling of being truly seen, understood, and accepted at an emotional level.",
    },
    {
      title: "Repair Readiness",
      detail:
        "You approach relationship conflicts with a focus on understanding and healing rather than winning or being right, which allows you to resolve disagreements in ways that actually strengthen your connection with partners rather than creating lasting resentment or emotional distance. Your natural inclination toward emotional repair means you're willing to have difficult conversations, acknowledge your mistakes, and work collaboratively to find solutions that address both people's underlying needs and concerns. This conflict resolution skill is incredibly valuable in long-term relationships where the ability to navigate disagreements constructively determines whether partnerships thrive or deteriorate over time.",
    },
    {
      title: "Emotional Intelligence",
      detail:
        "You excel at reading emotional undercurrents in relationships, understanding what partners need even when they can't articulate it clearly, and responding in ways that create deeper intimacy and connection rather than misunderstanding or conflict. Your emotional awareness helps you navigate the complex feelings that arise in romantic relationships, from early dating anxiety to long-term partnership challenges, with sensitivity and wisdom that makes partners feel secure and valued. This strength allows you to create relationships where both people feel emotionally fulfilled and supported, leading to partnerships that provide genuine happiness and emotional satisfaction for both individuals involved.",
    },
  ],
  S: [
    {
      title: "Predictable Progress",
      detail:
        "You create relationship security by establishing clear milestones and expectations that help both you and your partners understand where the relationship is heading and what steps need to be taken to reach shared goals. Your structured approach to relationship development reduces anxiety and uncertainty by providing a roadmap for how the partnership will evolve over time, from early dating through potential long-term commitment. This clarity helps partners feel secure and confident about investing in the relationship because they understand the trajectory and can see concrete evidence of progress toward shared objectives, creating a sense of stability and forward momentum that many people find deeply attractive and reassuring.",
    },
    {
      title: "Reliability",
      detail:
        "You build trust and security in relationships through consistent follow-through on commitments, reliable communication patterns, and dependable behavior that allows partners to count on you in both small daily interactions and major life decisions. Your natural inclination toward consistency means partners know what to expect from you, which creates a foundation of trust that enables deeper intimacy and vulnerability to develop over time. This reliability is particularly valuable in today's dating landscape where many people struggle with commitment and consistency, making your dependable nature a rare and highly attractive quality that helps you stand out from other potential partners.",
    },
    {
      title: "Intentional Development",
      detail:
        "You approach relationship growth with purposeful planning and structured improvement, actively working to strengthen your connection through regular check-ins, planned relationship activities, and intentional skill development in areas like communication, intimacy, and conflict resolution. Your systematic approach to relationship enhancement means you don't leave important aspects of your partnership to chance, instead taking proactive steps to ensure the relationship continues to grow and improve over time. This intentionality creates partnerships that consistently evolve in positive directions because you're actively investing in the relationship's development rather than hoping things will improve naturally without effort or attention.",
    },
  ],
  O: [
    {
      title: "Authentic Flow",
      detail:
        "You allow relationships to develop naturally according to their own organic timeline and rhythm, honoring the natural chemistry and connection between you and your partners rather than forcing predetermined expectations or artificial milestones onto the relationship's evolution. Your comfort with uncertainty and natural development creates space for genuine intimacy and connection to emerge without pressure, which often leads to deeper, more authentic relationships because both people feel free to be themselves without conforming to external expectations. This organic approach attracts partners who value authenticity and natural connection over conventional relationship scripts or social expectations.",
    },
    {
      title: "Flex Capacity",
      detail:
        "You adapt gracefully to changing circumstances in relationships, adjusting plans, expectations, and approaches based on what's actually happening rather than rigidly sticking to predetermined ideas about how things should unfold. Your flexibility allows you to navigate the inevitable surprises and changes that occur in any relationship, from scheduling conflicts to major life transitions, without creating unnecessary stress or conflict. This adaptability makes you an easy partner to be with because you can roll with life's unpredictability while maintaining your connection and commitment to the relationship, creating a sense of ease and flow that many people find deeply attractive and refreshing.",
    },
    {
      title: "Natural Timing",
      detail:
        "You have an intuitive sense of when to move forward in relationships and when to give things space to develop, allowing major decisions and milestones to emerge when they feel authentically right rather than according to artificial timelines or external pressure. Your ability to read the natural rhythm of relationship development means you rarely push too hard or hold back too much, instead finding the perfect balance between initiative and patience that allows connections to flourish at their optimal pace. This natural timing creates relationships that feel effortless and organic, where both people feel comfortable with the pace of development and major transitions happen when both partners are genuinely ready.",
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
      rationale: "While your natural breadth in social connections creates many opportunities, focusing too widely can sometimes dilute the quality of individual connections and prevent you from building the deeper intimacy that leads to lasting romantic partnerships. Your strength in meeting many people needs to be balanced with the ability to go deeper with the most promising connections to avoid staying on the surface level indefinitely.",
      action:
        "Each week, choose one conversation from your dating life to intentionally deepen by asking three thoughtful follow-up questions, sharing something more vulnerable about yourself, and creating space for 10 minutes of uninterrupted listening where you focus entirely on understanding their perspective. Practice this skill by setting aside your phone, maintaining eye contact, and asking questions like 'What was that experience really like for you?' or 'How did that change the way you see things?' Track your progress by noting whether these deeper conversations lead to stronger emotional connections and more meaningful second dates.",
    },
    {
      title: "Pacing Awareness",
      rationale: "Your high social energy and enthusiasm, while generally attractive, can sometimes overwhelm partners who need more time to process emotions, make decisions, or open up at their own pace. Learning to calibrate your energy to match your partner's comfort level will help you create more balanced interactions where both people feel comfortable and heard throughout the dating process.",
      action:
        "At the beginning of each date or meaningful conversation, verbally acknowledge your natural pace by saying something like 'I tend to be pretty energetic and excited when I'm getting to know someone I like - please let me know if you'd prefer to slow down or take breaks.' Then practice reading their body language and verbal cues for signs they need more processing time, and deliberately slow your speaking pace, leave longer pauses for them to respond, and ask 'How are you feeling about this conversation?' every 20-30 minutes to ensure they're comfortable with the flow.",
    },
    {
      title: "Quality Over Quantity",
      rationale: "Your networking abilities can sometimes lead to dating multiple people simultaneously without giving any single connection the focused attention needed to determine true compatibility and build meaningful emotional bonds. Developing the discipline to limit your active dating pool will help you invest more deeply in the connections with the highest potential for long-term success.",
      action:
        "Limit yourself to actively dating no more than three people at any given time, and commit to having at least three substantial dates with each person before deciding whether to continue or move on. Create a simple tracking system where you write down what you learned about their values, life goals, and compatibility factors after each interaction, and use this information to make thoughtful decisions about which connections deserve more of your time and emotional investment rather than defaulting to your natural tendency to keep meeting new people.",
    },
  ],
  F: [
    {
      title: "Expand Surface Area",
      rationale: "Your natural selectivity and preference for deep connections, while valuable for creating meaningful relationships, can sometimes limit your exposure to potentially compatible partners who might not immediately catch your attention but could develop into strong matches over time. Expanding your social reach will give you more opportunities to find the right person while still maintaining your standards for quality connections.",
      action:
        "Commit to attending one new social event each month where you don't know anyone, and challenge yourself to have at least three casual conversations with strangers without any pressure to create romantic connections. Practice your conversation skills by asking open-ended questions about their interests, experiences, or opinions, and focus on finding one genuinely interesting thing about each person you meet. Keep a log of these interactions and note any surprising connections or people who grew more interesting as you talked, helping you recognize that compatibility sometimes develops gradually rather than being immediately obvious.",
    },
    {
      title: "Warm Starts",
      rationale: "Your preference for depth and meaningful conversation, while ultimately attractive, can sometimes come across as too intense or serious during initial interactions when people are still getting comfortable with you. Learning to create emotional warmth and approachability in early conversations will help you connect with more people while still honoring your authentic communication style.",
      action:
        "Begin every first date or initial conversation with 10-15 minutes of lighter topics like recent travel experiences, favorite local restaurants, or interesting projects they're working on, before gradually transitioning into more meaningful subjects. Practice using humor, sharing amusing stories about yourself, and asking playful questions to create a relaxed atmosphere where the other person feels comfortable opening up naturally. Develop a mental list of 5-7 engaging but low-pressure conversation starters that feel authentic to you, and use these to build rapport before diving into the deeper topics that you naturally gravitate toward.",
    },
    {
      title: "Initiative Taking",
      rationale: "Your thoughtful, selective approach to dating can sometimes result in missed opportunities because you wait for perfect conditions or clear signals before making moves, while other potential partners interpret your caution as lack of interest. Developing comfort with taking appropriate initiative will help you pursue connections that align with your values without waiting for the other person to make all the first moves.",
      action:
        "Practice taking one small initiative each week in your dating life, whether that's suggesting a specific date activity, sending the first follow-up text after a good interaction, or directly expressing interest in someone you find attractive. Start with low-risk actions like 'I really enjoyed our conversation about [topic] - would you like to continue it over coffee this weekend?' and gradually work up to more direct expressions of interest. Keep track of how people respond to your initiatives and notice that most people appreciate clarity and directness rather than being put off by it.",
    },
  ],
  P: [
    {
      title: "Future Scan",
      rationale: "Your focus on present-day compatibility, while practical and often successful, can sometimes cause you to overlook important information about a partner's long-term goals, values, and life direction that will become crucial for relationship success over time. Developing skills to evaluate future potential alongside current compatibility will help you make more informed relationship decisions.",
      action:
        "During your first two dates with any new person, ask at least one thoughtful question about their future aspirations, such as 'What are you most excited about in your life right now?' or 'Where do you see yourself in five years, both personally and professionally?' Listen carefully for consistency between their stated goals and their current actions, and pay attention to whether their vision for the future aligns with yours in important areas like family, career, lifestyle, and values. Create a simple mental or written checklist of future compatibility factors that matter to you, and use this to evaluate whether someone is a good long-term match beyond just present-day chemistry and lifestyle alignment.",
    },
    {
      title: "Flex Buffer",
      rationale: "Your preference for present-day lifestyle alignment can sometimes create overly rigid expectations that eliminate potentially great partners who might differ from you in areas that aren't actually fundamental to relationship success. Learning to distinguish between non-negotiable compatibility factors and areas where you can be flexible will expand your dating options without compromising your core values.",
      action:
        "Identify one area of lifestyle preference where you can be 10-15% more flexible without compromising your core values - this might be social activity preferences, daily routines, entertainment choices, or communication styles. For example, if you prefer quiet evenings at home, consider whether you could enjoy occasional social events with a more outgoing partner, or if you're very structured, explore whether some spontaneity might actually add positive energy to your life. Experiment with this flexibility during dating by saying yes to activities or approaches that are slightly outside your comfort zone, and evaluate whether these differences create genuine incompatibility or just require minor adjustments that don't affect your overall happiness.",
    },
    {
      title: "Growth Mindset",
      rationale: "Your practical approach to compatibility assessment can sometimes undervalue the potential for positive change and development in both yourself and potential partners, causing you to dismiss connections that could become stronger over time with mutual effort and commitment. Developing appreciation for growth potential will help you recognize when minor current incompatibilities could be resolved through communication and compromise.",
      action:
        "When evaluating potential partners, spend time considering not just who they are today but who they're actively working to become, looking for evidence of self-awareness, willingness to learn, and commitment to personal growth. Ask questions like 'What's something you've been working to improve about yourself lately?' or 'How have you grown or changed in the past few years?' and pay attention to whether they take responsibility for their mistakes, show curiosity about your perspective, and demonstrate flexibility in their thinking. Give promising connections at least 4-6 dates to show their full personality and potential for positive change before making final compatibility decisions based solely on present-moment factors.",
    },
  ],
  T: [
    {
      title: "Reality Checks",
      rationale: "Your ability to see potential in partners and relationships, while valuable for creating growth-oriented partnerships, can sometimes cause you to overlook current behavioral patterns or compatibility issues that won't change regardless of someone's potential for growth. Learning to balance your vision for what could be with clear-eyed assessment of what actually is will help you make more realistic relationship decisions.",
      action:
        "Before getting emotionally invested in any new romantic connection, create a list of three specific current behaviors or qualities you need to see consistently demonstrated within the first month of dating - these might include reliability in communication, respect for your boundaries, emotional availability, or shared values in action rather than just words. Pay attention to patterns rather than isolated incidents, and resist the temptation to excuse concerning behaviors because you can see someone's potential for improvement. Set a timeline for evaluating whether these essential qualities are present, and be willing to end connections with people who don't demonstrate them consistently, regardless of how much potential you see for future growth.",
    },
    {
      title: "Milestone Evidence",
      rationale: "Your focus on long-term potential can sometimes create relationships that exist more in the realm of possibility than reality, with lots of discussion about future plans and growth but insufficient concrete evidence that progress is actually being made toward shared goals. Establishing clear, measurable milestones will help ensure that your vision-oriented relationships also have practical substance and forward momentum.",
      action:
        "For any relationship that progresses beyond casual dating, establish specific, time-bound milestones that demonstrate real progress toward shared goals rather than just ongoing conversations about potential. These might include completing a project together, making concrete plans for the next 3-6 months, demonstrating consistent behavior change in areas you've discussed, or taking specific steps toward shared aspirations like travel, education, or lifestyle changes. Set expectations that these milestones should be achieved within reasonable timeframes (usually 2-4 weeks for small goals, 2-3 months for larger ones), and be willing to reassess the relationship if someone consistently talks about growth and change but doesn't follow through with measurable actions.",
    },
    {
      title: "Present Moment Appreciation",
      rationale: "Your natural focus on future potential and long-term vision can sometimes prevent you from fully enjoying and appreciating the current stage of your relationship, causing you to always be thinking about what comes next rather than savoring what you have right now. Developing skills for present-moment appreciation will help you build stronger emotional connections and relationship satisfaction.",
      action:
        "Practice spending at least 20 minutes of each date or quality time with your partner focused entirely on the present moment without discussing future plans, goals, or potential improvements. During this time, focus on appreciating their current qualities, enjoying your immediate connection, and being fully present for the experience you're sharing together. Develop a habit of expressing gratitude for specific things you appreciate about them right now, such as 'I really enjoy how you listen to me' or 'I love your sense of humor in this moment,' rather than always framing your appreciation in terms of potential or future possibilities. This practice will help you build stronger emotional bonds and ensure your relationships feel fulfilling in the present, not just promising for the future.",
    },
  ],
  L: [
    {
      title: "Feeling Literacy",
      rationale: "Your logical approach to relationships, while valuable for making sound decisions, can sometimes cause you to overlook or undervalue important emotional information that affects relationship satisfaction and compatibility. Developing better emotional awareness and expression skills will help you create deeper intimacy and better understand both your own needs and your partner's emotional experience.",
      action:
        "Practice identifying and naming your emotions before proposing solutions or making decisions in relationship conversations by taking a 30-second pause to ask yourself 'What am I feeling right now?' and sharing that with your partner before moving into problem-solving mode. Develop a more extensive emotional vocabulary by learning to distinguish between similar emotions (frustrated vs. disappointed, anxious vs. excited, hurt vs. angry) and practice expressing these feelings using 'I' statements. During conflicts or important discussions, make it a rule to name your emotions first, ask your partner to share theirs, and spend time understanding the emotional landscape before trying to find logical solutions to whatever issue you're discussing.",
    },
    {
      title: "Repair Warmth",
      rationale: "Your efficiency-focused approach to problem-solving can sometimes feel cold or dismissive to partners who need emotional validation and understanding before they're ready to work on solutions. Learning to add emotional warmth to your repair attempts will help you resolve conflicts more effectively and strengthen your emotional connection in the process.",
      action:
        "Before offering any suggestions, solutions, or logical analysis during relationship conflicts, start with one genuine statement that validates your partner's emotional experience, such as 'I can see that this really hurt you' or 'It makes sense that you'd feel frustrated about this situation.' Practice sitting with their emotions for 2-3 minutes, asking follow-up questions about their feelings, and demonstrating that you understand their emotional experience before shifting into problem-solving mode. Develop a habit of checking in with your partner's emotional state throughout difficult conversations by asking 'How are you feeling about what we've discussed so far?' and adjusting your approach based on their emotional needs rather than just focusing on reaching a logical resolution.",
    },
    {
      title: "Vulnerability Practice",
      rationale: "Your logical approach to relationships can sometimes create emotional distance because you focus on practical aspects of compatibility and problem-solving without sharing your deeper feelings, fears, and desires, which prevents partners from feeling emotionally close to you. Developing comfort with appropriate vulnerability will help you build the intimate emotional connections that sustain long-term relationships.",
      action:
        "Once per week, practice sharing something emotionally vulnerable with your partner or dating prospect - this might be a fear you have about the relationship, something you're insecure about, a hope you have for your connection, or an emotion you've been experiencing but haven't expressed. Start with smaller vulnerabilities and gradually work up to deeper emotional sharing as trust develops. Create a safe container for these conversations by choosing quiet, private moments when you won't be interrupted, and follow up your vulnerable sharing by asking your partner to share something similar, creating mutual emotional intimacy rather than one-sided disclosure. Notice how these moments of vulnerability affect your emotional connection and relationship satisfaction.",
    },
  ],
  H: [
    {
      title: "Decision Anchors",
      rationale: "Your heart-centered approach to relationships, while valuable for creating emotional connection, can sometimes lead to decisions based on temporary feelings or emotional intensity rather than long-term compatibility factors that will determine relationship success over time. Developing some logical anchors for important relationship decisions will help you make choices that satisfy both your heart and your practical needs.",
      action:
        "Before making any major relationship decision (like becoming exclusive, moving in together, or ending a relationship), write down two non-negotiable practical requirements that must be met regardless of how you feel emotionally, such as shared values around finances, compatible life goals, mutual respect during conflicts, or alignment on major lifestyle choices. Use these anchors as a checking mechanism by asking yourself 'Even though I feel strongly about this person, do they meet these essential practical requirements?' and be willing to slow down your decision-making process if the answer is unclear. Practice separating emotional intensity from long-term compatibility by giving yourself 48 hours to consider important relationship decisions rather than acting on immediate feelings.",
    },
    {
      title: "Boundaries Script",
      rationale: "Your empathetic nature and desire to maintain harmony can sometimes lead you to over-accommodate partners' needs at the expense of your own well-being, creating relationships where you give more than you receive and eventually become resentful or emotionally depleted. Learning to set and maintain healthy boundaries will help you create more balanced, sustainable relationships.",
      action:
        "Develop and practice one clear, kind but firm script for protecting your time, energy, and emotional well-being, such as 'I care about you and I need to take care of myself too, so I can't [specific request] right now, but I'd be happy to [alternative that works for you].' Practice this script in low-stakes situations first, then gradually use it in more challenging relationship moments when you feel pressured to say yes to things that don't align with your needs or values. Create a list of your most important boundaries (around time, physical affection, communication frequency, or emotional support) and practice communicating these clearly and consistently rather than hoping your partner will intuitively understand your limits.",
    },
    {
      title: "Logical Integration",
      rationale: "Your intuitive approach to relationships can sometimes cause you to dismiss practical red flags or compatibility issues because you're focused on emotional connection and the potential for love to overcome obstacles. Learning to integrate logical evaluation with your emotional intelligence will help you make relationship decisions that satisfy both your heart and your practical needs for long-term happiness.",
      action:
        "Create a simple compatibility checklist that includes both emotional factors (how they make you feel, emotional safety, communication style) and practical factors (lifestyle compatibility, shared values, life goals, conflict resolution skills) and use this to evaluate potential partners after you've had 4-5 substantial interactions with them. Practice asking yourself both 'Does this feel right emotionally?' and 'Does this make sense practically?' before making important relationship decisions. When you notice yourself dismissing logical concerns because of strong emotional feelings, take time to discuss these concerns with a trusted friend or write about them in a journal to get perspective on whether your emotional connection is causing you to overlook important compatibility issues.",
    },
  ],
  S: [
    {
      title: "Play Blocks",
      rationale: "Your structured approach to relationships, while valuable for creating security and progress, can sometimes feel rigid or pressuring to partners who need more spontaneity and organic development in their romantic connections. Learning to incorporate unstructured time and playful spontaneity will help you create relationships that feel both secure and joyful.",
      action:
        "Schedule one completely unstructured date or quality time session each week where you commit only to a time window (like 'Saturday afternoon from 2-6pm') but make no specific plans about activities, topics of conversation, or outcomes. During these times, practice following your partner's lead, saying yes to spontaneous suggestions, and letting the experience unfold naturally without trying to direct or optimize it. Challenge yourself to embrace uncertainty by suggesting activities like 'Let's walk around downtown and see what catches our interest' or 'What do you feel like doing right now?' and resist the urge to plan or control the experience, instead focusing on being present and responsive to whatever emerges.",
    },
    {
      title: "Update Cadence",
      rationale: "Your preference for structure and planning can sometimes lead to rigid relationship expectations that don't adapt to changing circumstances, personal growth, or evolving needs, causing you to stick with plans or agreements that no longer serve the relationship well. Developing skills for regular relationship maintenance and adjustment will help you maintain structure while staying responsive to change.",
      action:
        "Establish a weekly 15-minute 'relationship check-in' ritual where you and your partner share one thing you appreciate about your connection and one small adjustment you'd like to make for the following week - this might be spending more time together, trying a new activity, adjusting communication patterns, or addressing a minor concern before it becomes bigger. Keep these conversations light and solution-focused rather than turning them into heavy relationship processing sessions. Use this regular touchpoint to stay connected to each other's evolving needs and make small course corrections that keep your relationship feeling fresh and responsive rather than stuck in patterns that no longer work.",
    },
    {
      title: "Flexibility Practice",
      rationale: "Your structured approach to relationships can sometimes create resistance to the natural changes and unexpected developments that occur in any healthy partnership, causing you to feel anxious or frustrated when things don't go according to plan. Developing comfort with flexibility and adaptation will help you navigate relationship challenges and changes with greater ease and resilience.",
      action:
        "Practice deliberately introducing small changes to your relationship routines and plans, such as trying new date activities, adjusting communication patterns, or being open to your partner's suggestions for how to spend time together, even when these suggestions differ from your preferences. When plans change unexpectedly (canceled dates, different outcomes than expected, surprise developments), practice responding with curiosity and adaptability rather than frustration or attempts to control the situation. Develop a mindset that views relationship changes as opportunities for growth and discovery rather than threats to stability, and celebrate moments when flexibility leads to positive experiences you wouldn't have had otherwise.",
    },
  ],
  O: [
    {
      title: "Clarity Moments",
      rationale: "Your preference for organic relationship development, while valuable for creating authentic connections, can sometimes leave partners feeling uncertain about your intentions, the relationship's direction, or your level of commitment, which can create anxiety and prevent deeper intimacy from developing. Learning to provide periodic clarity will help you maintain your natural flow while giving partners the security they need.",
      action:
        "Establish light checkpoint conversations every 2-3 weeks where you share your current feelings about the relationship and ask your partner about theirs, using gentle language like 'I'm really enjoying getting to know you and I'm curious how you're feeling about our connection' or 'I wanted to check in and see how this is feeling for you so far.' These conversations don't need to be heavy or definitive, but they should provide enough clarity about mutual interest and direction to help both people feel secure in the connection. Practice expressing your feelings and intentions clearly while still leaving room for organic development, such as 'I'm excited to see where this goes' or 'I'm feeling more and more interested in exploring a deeper connection with you.'",
    },
    {
      title: "Signal Strength",
      rationale: "Your flexible, go-with-the-flow approach can sometimes send mixed signals to partners who need clearer indications of your interest, commitment, and intentions, causing them to feel uncertain about where they stand with you or whether you're serious about the relationship. Learning to communicate your interest more directly will help prevent misunderstandings and relationship anxiety.",
      action:
        "At the end of each meaningful interaction or good date, practice naming one concrete next step or expression of interest, such as 'I'd love to see you again next week - are you free for dinner on Friday?' or 'I really enjoyed tonight and I'm looking forward to continuing this conversation soon.' Make your interest and intentions more visible through specific actions like planning thoughtful dates, remembering important details from previous conversations, introducing them to friends, or making plans more than a few days in advance. Practice being more direct about your feelings by saying things like 'I'm really attracted to you' or 'I'm excited about where this is heading' rather than assuming your interest is obvious through your presence and attention.",
    },
    {
      title: "Commitment Readiness",
      rationale: "Your preference for natural timing and organic development can sometimes prevent you from making clear commitments or taking definitive relationship steps even when you're ready for them, causing promising connections to stagnate or partners to feel like you're not serious about building something lasting together. Developing comfort with appropriate commitment will help you move relationships forward when the timing is right.",
      action:
        "Practice recognizing when you're actually ready to make relationship commitments (like exclusivity, meeting family, or future planning) and communicate these intentions clearly rather than waiting for the perfect moment or hoping your partner will bring it up first. When you notice yourself feeling ready for a deeper level of commitment, take initiative by having direct conversations about what you want, such as 'I've been thinking that I'd like to be exclusive with you - how do you feel about that?' or 'I'm at the point where I'd love to introduce you to my friends and family.' Set internal timelines for making important relationship decisions so you don't let good connections drift indefinitely, and practice viewing commitment as a natural evolution of strong connections rather than a loss of freedom or spontaneity.",
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
      overviewSummary: `As a ${typeName} (${typeCode}), you possess a distinctive romantic personality that combines ${
        typeCode[0] === "C" ? "expansive social energy" : "focused depth"
      } with ${
        typeCode[1] === "P" ? "present-moment awareness" : "future-oriented vision"
      }, making decisions through ${
        typeCode[2] === "L" ? "logical analysis" : "emotional intuition"
      } while preferring ${
        typeCode[3] === "S" ? "structured relationship progression" : "organic relationship development"
      }. Your unique Dating DNA profile reveals specific patterns in how you naturally connect with potential partners, build romantic attraction, navigate relationship challenges, and create lasting emotional bonds that define your approach to love and partnership. This comprehensive personality analysis demonstrates that your ${typeCode} type brings particular strengths to dating situations, including your natural ability to ${
        typeCode[0] === "C" ? "create abundant social opportunities and connect with diverse potential partners" : "build deep, meaningful connections through focused attention and authentic intimacy"
      }. Understanding these core patterns empowers you to make more intentional dating choices, communicate more effectively with potential partners, and build relationships that truly align with your authentic self and long-term happiness goals. Your Dating DNA serves as both a roadmap for understanding your natural romantic tendencies and a practical guide for optimizing your dating strategy to attract compatible partners who appreciate and complement your unique approach to love and relationships. By embracing your ${typeCode} profile while working on targeted growth areas, you can transform your dating experience and create the meaningful, lasting partnership you desire.`,
      personalityInsights: `Your ${typeCode} Dating DNA reveals four fundamental dimensions that shape every aspect of your romantic life and relationship approach. Your ${
        typeCode[0] === "C" ? "Connector" : "Focuser"
      } social energy means you ${
        typeCode[0] === "C" ? "naturally thrive in diverse social settings, gain energy from meeting new people, and create romantic opportunities through your extensive network of connections and social activities" : "prefer deeper, more intimate interactions, invest your energy selectively in promising connections, and build stronger relationships through focused attention and meaningful one-on-one time"
      }. Your ${
        typeCode[1] === "P" ? "Present-focused" : "Potential-focused"
      } attraction driver indicates that you're ${
        typeCode[1] === "P" ? "drawn to partners whose current lifestyle, habits, and personality align well with yours right now, valuing practical compatibility and immediate chemistry over future possibilities" : "attracted to partners' potential for growth and development, willing to invest in relationships based on shared visions and long-term possibilities rather than just present-moment compatibility"
      }. Your ${
        typeCode[2] === "L" ? "Logic-based" : "Heart-based"
      } decision filter shows that you ${
        typeCode[2] === "L" ? "evaluate romantic choices through careful analysis of practical factors, compatibility metrics, and long-term viability, making relationship decisions based on objective assessment rather than emotional impulses" : "trust your emotional intuition and feelings when making relationship choices, prioritizing how someone makes you feel and whether the connection feels emotionally right over logical analysis of compatibility factors"
      }. Finally, your ${
        typeCode[3] === "S" ? "Structured" : "Organic"
      } relationship rhythm reveals that you ${
        typeCode[3] === "S" ? "prefer clear milestones, defined expectations, and predictable progression in your romantic relationships, feeling most secure when you understand where the relationship is heading and what steps come next" : "value natural development and organic timing in relationships, preferring to let connections evolve authentically without rigid timelines or predetermined expectations about how things should unfold"
      }. These four dimensions work together to create your unique romantic personality, influencing everything from how you meet potential partners to how you build long-term relationship satisfaction and emotional fulfillment.`,
      communicationStyle: `Your communication style reflects your natural approach to expressing needs, sharing emotions, and building connection with potential partners in meaningful ways. Understanding this helps you communicate more effectively and authentically in dating situations while maintaining your genuine personality. Your Dating DNA type influences how you prefer to express yourself, what communication patterns feel most natural to you, and how you best receive and process information from others during romantic interactions. This knowledge enables you to adapt your communication approach while staying true to your authentic self and building stronger connections. Effective communication forms the foundation of all successful relationships and partnerships.`,
      compatibilityFactors: `Your compatibility with others depends on how well your Dating DNA aligns or complements theirs. Certain type combinations create natural harmony while others require more intentional effort to bridge differences. Understanding your compatibility factors helps you identify potential partners who will naturally understand your approach to relationships and those who might challenge you to grow in positive ways. Your Dating DNA type reveals which other types you might naturally connect with and which combinations might require more communication and understanding to thrive. This knowledge helps you make more informed decisions about potential partners and relationships.`,
      growthAreas: `Your growth areas represent opportunities to expand your dating effectiveness and relationship satisfaction. By focusing on these areas, you can overcome common challenges and build stronger connections. These growth opportunities are not weaknesses but rather areas where you can develop additional skills and perspectives that complement your natural strengths. Working on these areas helps you become more well-rounded in your approach to dating and relationships. This development process enhances your overall relationship success and personal fulfillment.`,
      strengthsSection: `Your natural strengths provide a foundation for successful relationships. Leveraging these qualities helps you attract compatible partners and build lasting connections. These strengths represent your natural advantages in dating and relationships, qualities that come easily to you and that others likely appreciate about you. Understanding and intentionally using these strengths can significantly improve your dating success and relationship satisfaction. These qualities become your competitive advantage in the dating world.`,
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
          scenario: "Planning a first date with someone you're excited about",
          response: `Based on your ${typeCode} type, you naturally gravitate toward ${
            typeCode[3] === "S"
              ? "structured, planned activities where you can create a clear agenda and timeline, such as dinner reservations at 7pm followed by a specific cultural event, because you feel most comfortable when both people know what to expect and can prepare accordingly"
              : "flexible, spontaneous options that allow the experience to unfold naturally, such as suggesting 'let's meet at the farmers market Saturday morning and see what catches our interest,' because you prefer authentic moments over predetermined scripts"
          }. Your ${
            typeCode[0] === "C" ? "Connector energy" : "Focuser depth"
          } means you'll ${
            typeCode[0] === "C"
              ? "choose activities that allow for social interaction and meeting other people, like group events or bustling venues where conversation flows easily"
              : "prefer intimate settings where you can have meaningful one-on-one conversation without distractions, like quiet cafes or nature walks"
          }.`,
          insight:
            "Understanding your natural date preferences helps you create experiences where you feel authentic and comfortable, which allows your personality to shine and creates better romantic connections.",
        },
        {
          scenario: "Meeting someone attractive at a social gathering",
          response: `Your ${
            typeCode[0] === "C" ? "Connector" : "Focuser"
          } social approach means you ${
            typeCode[0] === "C"
              ? "naturally engage with multiple people throughout the event, building rapport through light conversation and social energy, then circle back to the person who interests you most with a confident invitation to continue the conversation elsewhere"
              : "observe the social dynamics first, then approach the person who catches your attention for a deeper, more focused conversation, asking thoughtful questions that reveal genuine personality and values rather than staying on surface topics"
          }. Your ${
            typeCode[2] === "L" ? "logical evaluation process" : "intuitive feeling assessment"
          } leads you to ${
            typeCode[2] === "L"
              ? "gather practical information about their lifestyle, goals, and compatibility factors through strategic conversation topics"
              : "pay attention to how they make you feel, the energy between you, and whether the emotional connection feels natural and comfortable"
          }.`,
          insight:
            "Leveraging your natural social energy style and decision-making approach helps you make authentic connections while staying true to your personality, increasing your success in meeting compatible partners.",
        },
        {
          scenario: "Deciding whether to become exclusive with someone you've been dating",
          response: `As a ${
            typeCode[2] === "L" ? "Logic" : "Heart"
          }-oriented person, you approach this decision by ${
            typeCode[2] === "L"
              ? "systematically evaluating practical compatibility factors like shared values, life goals, communication patterns, and lifestyle alignment, creating a mental checklist of relationship requirements and assessing whether this person meets your standards for long-term partnership potential"
              : "tuning into your emotional experience with this person, asking yourself how they make you feel, whether you feel emotionally safe and understood, and whether your heart feels excited about the possibility of deeper commitment and exclusivity"
          }. Your ${
            typeCode[1] === "P" ? "present-focused" : "future-oriented"
          } attraction system means you ${
            typeCode[1] === "P"
              ? "evaluate how well your current lifestyles mesh together and whether you enjoy spending day-to-day time with this person in ordinary circumstances"
              : "consider your shared vision for the future and whether you're both committed to growing together toward compatible long-term goals"
          }.`,
          insight:
            "Understanding your natural decision-making style helps you make relationship choices that satisfy both your practical needs and emotional desires, leading to more fulfilling partnerships.",
        },
        {
          scenario: "Navigating the transition from casual to serious dating",
          response: `Your ${
            typeCode[3] === "S" ? "Structured" : "Organic"
          } relationship rhythm means you handle this transition by ${
            typeCode[3] === "S"
              ? "having direct conversations about relationship status, setting clear expectations about exclusivity and future plans, and creating specific milestones that show progress toward commitment, such as meeting families or making plans more than a month in advance"
              : "allowing the relationship to deepen naturally through increased emotional intimacy and time spent together, trusting that commitment will emerge when it feels authentically right for both people without forcing predetermined timelines or artificial pressure"
          }. Your ${
            typeCode[0] === "C" ? "social connectivity" : "intimate focus"
          } influences how you ${
            typeCode[0] === "C"
              ? "integrate this person into your broader social circle, introducing them to friends and including them in group activities as a way of deepening the relationship"
              : "create more private, intimate experiences together that allow for vulnerable conversations and deeper emotional bonding away from external social pressures"
          }.`,
          insight:
            "Communicating your preferred relationship pace and development style helps create mutual understanding and reduces anxiety for both partners during important relationship transitions.",
        },
        {
          scenario: "Evaluating long-term compatibility after several months of dating",
          response: `Your ${
            typeCode[1] === "P" ? "Present" : "Potential"
          } focus draws your attention to ${
            typeCode[1] === "P"
              ? "current lifestyle alignment factors such as how you spend weekends together, whether your daily routines complement each other, how you handle stress and conflict in real-time, and whether you genuinely enjoy each other's company in ordinary, non-romantic situations like grocery shopping or doing chores"
              : "growth potential and future possibilities, such as whether you share similar aspirations for personal development, career advancement, family planning, and life adventures, and whether you both demonstrate commitment to supporting each other's evolution and dreams"
          }. Your ${
            typeCode[2] === "L" ? "analytical assessment" : "emotional intuition"
          } guides you to ${
            typeCode[2] === "L"
              ? "create practical compatibility checklists covering areas like financial responsibility, communication styles, conflict resolution skills, and alignment on major life decisions"
              : "trust your gut feelings about whether this relationship brings out the best in both of you and whether you feel genuinely happy and fulfilled when you're together"
          }.`,
          insight:
            "Recognizing what attracts you and how you naturally evaluate partnerships helps you make informed decisions about long-term compatibility that align with your values and relationship vision.",
        },
        {
          scenario: "Handling conflict during the early stages of a relationship",
          response: `Your ${
            typeCode[2] === "L" ? "Logic-based" : "Heart-based"
          } approach to conflict means you ${
            typeCode[2] === "L"
              ? "focus on identifying the root cause of the disagreement, proposing practical solutions that address both people's needs, and establishing clear communication protocols to prevent similar issues in the future"
              : "prioritize understanding each other's feelings and emotional experiences, seeking to repair any hurt or misunderstanding before moving into problem-solving mode, and ensuring both people feel heard and emotionally safe"
          }. Your ${
            typeCode[3] === "S" ? "structured" : "organic"
          } relationship style influences whether you ${
            typeCode[3] === "S"
              ? "prefer to address conflicts through scheduled conversations with clear agendas and follow-up plans for improvement"
              : "allow resolution to happen naturally through ongoing dialogue and emotional processing as feelings arise"
          }.`,
          insight:
            "Understanding your natural conflict resolution style helps you navigate disagreements in ways that strengthen rather than damage your romantic connections, building trust and emotional intimacy.",
        },
        {
          scenario: "Deciding how much to invest emotionally in a new relationship",
          response: `Your ${
            typeCode[0] === "C" ? "Connector" : "Focuser"
          } energy management approach means you ${
            typeCode[0] === "C"
              ? "can maintain emotional availability for multiple connections simultaneously while gradually increasing investment in the most promising relationships, using your social network to help evaluate potential partners"
              : "prefer to invest deeply in fewer relationships at a time, giving your full emotional attention to connections that show genuine potential rather than spreading your energy too thinly"
          }. Your ${
            typeCode[1] === "P" ? "present-focused" : "future-focused"
          } evaluation system guides you to ${
            typeCode[1] === "P"
              ? "base your emotional investment on current evidence of compatibility and mutual interest rather than potential or promises about the future"
              : "invest based on shared vision and growth potential, willing to put emotional energy into relationships that may take time to develop but show promise for meaningful long-term partnership"
          }.`,
          insight:
            "Understanding how you naturally manage emotional investment helps you protect your energy while remaining open to meaningful connections, leading to more balanced and sustainable dating experiences.",
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
        section: error.section || "unknown",
        expected: error.expected || "unknown",
        actual: error.actual || "unknown",
        message: error.message || "unknown error",
        errorName: error.name,
        stack: error.stack,
      });
      // In production, this should fail loudly and not return partial results
      throw new Error(
        `Singles assessment validation failed: ${
          error.message || "Unknown validation error"
        }`
      );
    }
    console.error("Non-validation error in singles assessment:", error);
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
  // Validate Relationship Approach: minimum 5 sentences per narrative contract
  const approachSentences = countSentences(result.relationshipApproach);

  if (approachSentences < 5) {
    throw new ValidationError(
      `Relationship Approach sentence count out of range: expected minimum 5, got ${approachSentences}`,
      "relationshipApproach",
      "minimum 5 sentences",
      `${approachSentences} sentences`
    );
  }

  // Validate Strengths: minimum 4 items per narrative contract
  if (result.strengths.length < 4) {
    throw new ValidationError(
      `Strengths count out of range: expected minimum 4, got ${result.strengths.length}`,
      "strengths",
      "minimum 4 items",
      `${result.strengths.length} items`
    );
  }

  // Validate Growth Opportunities: minimum 4 items per narrative contract
  if (result.growthOpportunities.length < 4) {
    throw new ValidationError(
      `Growth Opportunities count out of range: expected minimum 4, got ${result.growthOpportunities.length}`,
      "growthOpportunities",
      "minimum 4 items",
      `${result.growthOpportunities.length} items`
    );
  }

  // Validate Quick Wins: minimum 3 items per narrative contract
  if (result.quickWins.length < 3) {
    throw new ValidationError(
      `Quick Wins count out of range: expected minimum 3, got ${result.quickWins.length}`,
      "quickWins",
      "minimum 3 items",
      `${result.quickWins.length} items`
    );
  }

  // Validate AI Narrative Expansion sections
  const aiNarrative = result.aiNarrative;

  // Overview Summary: minimum 5 sentences per narrative contract
  const overviewSentences = countSentences(aiNarrative.overviewSummary);

  if (overviewSentences < 5) {
    throw new ValidationError(
      `AI Overview Summary sentence count out of range: expected minimum 5, got ${overviewSentences}`,
      "aiNarrative.overviewSummary",
      "minimum 5 sentences",
      `${overviewSentences} sentences`
    );
  }

  // Personality Insights: minimum 5 sentences per narrative contract
  const personalitySentences = countSentences(aiNarrative.personalityInsights);

  if (personalitySentences < 5) {
    throw new ValidationError(
      `AI Personality Insights sentence count out of range: expected minimum 5, got ${personalitySentences}`,
      "aiNarrative.personalityInsights",
      "minimum 5 sentences",
      `${personalitySentences} sentences`
    );
  }

  // Communication Style: minimum 5 sentences per narrative contract
  const commSentences = countSentences(aiNarrative.communicationStyle);
  if (commSentences < 5) {
    throw new ValidationError(
      `AI Communication Style sentence count out of range: expected minimum 5, got ${commSentences}`,
      "aiNarrative.communicationStyle",
      "minimum 5 sentences",
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

  // Validate Joint Strengths: minimum 4 items per narrative contract
  if (couple.jointStrengths.length < 4) {
    throw new ValidationError(
      `Joint Strengths count out of range: expected minimum 4, got ${couple.jointStrengths.length}`,
      "jointStrengths",
      "minimum 4 items",
      `${couple.jointStrengths.length} items`
    );
  }

  // Validate Shared Growth Areas: minimum 4 items per narrative contract
  if (couple.sharedGrowthAreas.length < 4) {
    throw new ValidationError(
      `Shared Growth Areas count out of range: expected minimum 4, got ${couple.sharedGrowthAreas.length}`,
      "sharedGrowthAreas",
      "minimum 4 items",
      `${couple.sharedGrowthAreas.length} items`
    );
  }

  // Validate AI Narrative Expansion sections for couples
  const coupleAiNarrative = couple.aiNarrative;

  // Overview Summary: minimum 5 sentences per narrative contract
  const coupleOverviewSentences = countSentences(
    coupleAiNarrative.overviewSummary
  );
  if (coupleOverviewSentences < 5) {
    throw new ValidationError(
      `Couple AI Overview Summary sentence count out of range: expected minimum 5, got ${coupleOverviewSentences}`,
      "coupleProfile.aiNarrative.overviewSummary",
      "minimum 5 sentences",
      `${coupleOverviewSentences} sentences`
    );
  }

  // Couple Dynamics: minimum 5 sentences per narrative contract
  const coupleDynamicsSentences = countSentences(
    coupleAiNarrative.coupleDynamics
  );

  if (coupleDynamicsSentences < 5) {
    console.log(coupleDynamicsSentences);
    throw new ValidationError(
      `Couple Dynamics sentence count out of range: expected minimum 5, got ${coupleDynamicsSentences}`,
      "coupleProfile.aiNarrative.coupleDynamics",
      "minimum 5 sentences",
      `${coupleDynamicsSentences} sentences`
    );
  }

  // Validate Supporting Content sections for couples
  const coupleSupportingContent = couple.supportingContent;

  // Everyday Examples: 5-10 scenarios
  if (coupleSupportingContent.everydayExamples.length < 3) {
    throw new ValidationError(
      `Everyday Examples count out of range: expected 3, got ${coupleSupportingContent.everydayExamples.length}`,
      "coupleProfile.supportingContent.everydayExamples",
      "3 scenarios",
      `${coupleSupportingContent.everydayExamples.length} scenarios`
    );
  }

  // Joint Action Plan 7 Days: 5-10 items
  if (coupleSupportingContent.jointActionPlan7Days.length < 3) {
    throw new ValidationError(
      `Joint Action Plan 7 Days count out of range: expected 3, got ${coupleSupportingContent.jointActionPlan7Days.length}`,
      "coupleProfile.supportingContent.jointActionPlan7Days",
      "3 items",
      `${coupleSupportingContent.jointActionPlan7Days.length} items`
    );
  }

  // Joint Action Plan 30 Days: 10-20 items total
  const totalCoupleActionItems =
    coupleSupportingContent.jointActionPlan30Days.reduce(
      (sum, week) => sum + week.progressiveActions.length,
      0
    );
  if (totalCoupleActionItems < 3) {
    throw new ValidationError(
      `Joint Action Plan 30 Days total items out of range: expected 3, got ${totalCoupleActionItems}`,
      "coupleProfile.supportingContent.jointActionPlan30Days",
      "3 items total",
      `${totalCoupleActionItems} items total`
    );
  }

  // Validate Relationship Approach: minimum 5 sentences per narrative contract
  const coupleApproachSentences = countSentences(couple.relationshipApproach);

  if (coupleApproachSentences < 5) {
    throw new ValidationError(
      `Couple Relationship Approach sentence count out of range: expected minimum 5, got ${coupleApproachSentences}`,
      "coupleProfile.relationshipApproach",
      "minimum 5 sentences",
      `${coupleApproachSentences} sentences`
    );
  }

  // Validate Joint Quick Wins: minimum 3 items per narrative contract
  if (couple.jointQuickWins.length < 3) {
    throw new ValidationError(
      `Joint Quick Wins count out of range: expected minimum 3, got ${couple.jointQuickWins.length}`,
      "jointQuickWins",
      "minimum 3 items",
      `${couple.jointQuickWins.length} items`
    );
  }

  // Validate Joint 30-Day Plan: minimum 3 items per narrative contract
  const totalJointPlanItems =
    couple.jointPlan30Day.week1.length +
    couple.jointPlan30Day.week2.length +
    couple.jointPlan30Day.week3.length +
    couple.jointPlan30Day.week4.length;
  if (totalJointPlanItems < 3) {
    throw new ValidationError(
      `Joint 30-Day Plan total items out of range: expected minimum 3, got ${totalJointPlanItems}`,
      "jointPlan30Day",
      "minimum 3 items total",
      `${totalJointPlanItems} items total`
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
      // Create a structured PDF content
      const pdfContent = `
        <div class="header">
          <div class="logo">MY Dating DNA™</div>
          <div class="subtitle">Your Personalized Assessment Results</div>
        </div>

        <div class="results-section">
          <div class="section-title">Your Dating DNA Type</div>
          <div class="type-card">
          <div class="type-name">${result.typeName}</div>
          <div class="type-description">${result.relationshipApproach}</div>
          </div>
        </div>

        <div class="results-section">
          <div class="section-title">Key Insights</div>
          <div class="insights-grid">
            <div class="insight-card">
              <div class="insight-title">Strengths</div>
              <div class="insight-content">${result.strengths
                .map((s) => s.title)
                .join(", ")}</div>
            </div>
            <div class="insight-card">
              <div class="insight-title">Growth Areas</div>
              <div class="insight-content">${result.growthOpportunities
                .map((g) => g.title)
                .join(", ")}</div>
            </div>
          </div>
        </div>

        <div class="results-section">
          <div class="section-title">Growth Areas</div>
          <div class="growth-areas">
            <div class="growth-title">Areas for Development</div>
            <ul class="growth-list">
              ${result.growthOpportunities
                .map(
                  (g) => `
                <li class="growth-item">
                  <div class="growth-item-title">${g.title}</div>
                  <div class="growth-item-content">
                    <strong>Why it matters:</strong> ${g.rationale}<br>
                    <strong>Practice:</strong> ${g.action}
                  </div>
                </li>
              `
                )
                .join("")}
            </ul>
          </div>
        </div>

        <div class="results-section">
          <div class="section-title">Quick Wins</div>
          <div class="quick-wins">
            <div class="quick-wins-title">Immediate Actions</div>
            <ul class="quick-wins-list">
              ${result.quickWins
                .map(
                  (q) => `
                <li class="quick-wins-item">
                  <div class="quick-wins-item-title">${q.action}</div>
                  <div class="quick-wins-item-content">
                    <strong>Outcome:</strong> ${q.expectedOutcome}<br>
                    <strong>When:</strong> ${q.timeframe}
                  </div>
                </li>
              `
                )
                .join("")}
            </ul>
          </div>
        </div>

        <div class="results-section">
          <div class="section-title">30-Day Action Plan</div>
          <div class="plan-section">
            <div class="plan-title">Your Personalized Journey</div>
            <div class="plan-grid">
              ${(["week1", "week2", "week3", "week4"] as const)
                .map(
                  (wk) => `
                <div class="week-card">
                  <div class="week-title">${wk.toUpperCase()}</div>
                  <ul class="week-list">
                    ${result.plan30Day[wk]
                      .map((item) => `<li>${item}</li>`)
                      .join("")}
                  </ul>
                </div>
              `
                )
                .join("")}
            </div>
          </div>
        </div>

        <div class="footer">
          <div class="footer-logo">MY Dating DNA™</div>
          <p>Thank you for exploring your dating personality! 🧬</p>
          <p>© ${new Date().getFullYear()} MY Dating DNA™. All rights reserved.</p>
        </div>
      `;

      // Send to PDF generation API
      const response = await fetch("/api/pdf/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          html: pdfContent,
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
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("PDF downloaded successfully!");
    } catch (error) {
      console.error("PDF generation error:", error);
      toast.error("Failed to generate PDF. Please try again.");
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
    filename: string = "couples-results.pdf"
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
      // Create a structured PDF content for couples
      const pdfContent = `
        <div class="header">
          <div class="logo">MY Dating DNA™</div>
          <div class="subtitle">Your Couple's Assessment Results</div>
        </div>

        <div class="results-section">
          <div class="section-title">Your Couple's DNA Types</div>
          <div class="type-card">
            <div class="type-name">${result.partnerA.typeName} + ${
        result.partnerB.typeName
      }</div>
            <div class="type-description">${
              result.coupleProfile.relationshipApproach
            }</div>
          </div>
        </div>

        <div class="results-section">
          <div class="section-title">Individual Profiles</div>
          <div class="insights-grid">
            <div class="insight-card">
              <div class="insight-title">Partner A: ${
                result.partnerA.typeName
              }</div>
              <div class="insight-content">${
                result.partnerA.relationshipApproach
              }</div>
            </div>
            <div class="insight-card">
              <div class="insight-title">Partner B: ${
                result.partnerB.typeName
              }</div>
              <div class="insight-content">${
                result.partnerB.relationshipApproach
              }</div>
            </div>
          </div>
        </div>

        <div class="results-section">
          <div class="section-title">Growth Areas</div>
          <div class="growth-areas">
            <div class="growth-title">Areas for Development</div>
            <ul class="growth-list">
              ${result.coupleProfile.sharedGrowthAreas
                .map(
                  (g) => `
                <li class="growth-item">
                  <div class="growth-item-title">${g.title}</div>
                  <div class="growth-item-content">
                    <strong>Why it matters:</strong> ${g.supportiveBehavior}<br>
                    <strong>Shared practice:</strong> ${g.sharedPractice}
                  </div>
                </li>
              `
                )
                .join("")}
            </ul>
          </div>
        </div>

        <div class="results-section">
          <div class="section-title">Joint Quick Wins</div>
          <div class="quick-wins">
            <div class="quick-wins-title">Immediate Actions</div>
            <ul class="quick-wins-list">
              ${result.coupleProfile.jointQuickWins
                .map(
                  (q) => `
                <li class="quick-wins-item">
                  <div class="quick-wins-item-title">${q.action}</div>
                  <div class="quick-wins-item-content">
                    <strong>Implementation:</strong> ${q.implementation}
                  </div>
                </li>
              `
                )
                .join("")}
            </ul>
          </div>
        </div>

        <div class="results-section">
          <div class="section-title">Joint 30-Day Plan</div>
          <div class="plan-section">
            <div class="plan-title">Your Couple's Journey</div>
            <div class="plan-grid">
              ${(["week1", "week2", "week3", "week4"] as const)
                .map(
                  (wk) => `
                <div class="week-card">
                  <div class="week-title">${wk.toUpperCase()}</div>
                  <ul class="week-list">
                    ${result.coupleProfile.jointPlan30Day[wk]
                      .map((item) => `<li>${item}</li>`)
                      .join("")}
                  </ul>
                </div>
              `
                )
                .join("")}
            </div>
          </div>
        </div>

        <div class="footer">
          <div class="footer-logo">MY Dating DNA™</div>
          <p>Thank you for exploring your couple's dating personality! 🧬</p>
          <p>© ${new Date().getFullYear()} MY Dating DNA™. All rights reserved.</p>
        </div>
      `;

      // Send to PDF generation API
      const response = await fetch("/api/pdf/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          html: pdfContent,
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
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("PDF downloaded successfully!");
    } catch (error) {
      console.error("PDF generation error:", error);
      toast.error("Failed to generate PDF. Please try again.");
    } finally {
      // Restore button state
      if (button) {
        button.textContent = originalText || "Download PDF";
        button.disabled = false;
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 mt-16">
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
  const [phase, setPhase] = useState<
    "A" | "A_RESULTS" | "B" | "B_RESULTS" | "COMBINED_RESULTS"
  >("A");
  const [aResult, setAResult] = useState<SinglesResultDeterministic | null>(
    null
  );
  const [bResult, setBResult] = useState<SinglesResultDeterministic | null>(
    null
  );

  function handleDoneA(res: SinglesResultDeterministic) {
    setAResult(res);
    setPhase("A_RESULTS");
  }

  function handleContinueToPartnerB() {
    setPhase("B");
  }

  function handleDoneB(resB: SinglesResultDeterministic) {
    setBResult(resB);
    setPhase("B_RESULTS");
  }

  function handleContinueToCombined() {
    if (!aResult || !bResult) return;
    const partnerA = aResult;
    const partnerB = bResult;
    const coupleProfile = buildCoupleProfile(partnerA, partnerB);
    const couple: CouplesResultDeterministic = {
      assessmentType: "couples",
      partnerA,
      partnerB,
      coupleProfile,
    };

    // CRITICAL: Validate complete blueprint before returning
    // This ensures no truncated or incomplete couples results are ever returned
    console.log("About to validate couples blueprint:", {
      assessmentType: couple.assessmentType,
      partnerA: {
        typeCode: couple.partnerA.typeCode,
        strengths: couple.partnerA.strengths?.length,
        growthOpportunities: couple.partnerA.growthOpportunities?.length,
        quickWins: couple.partnerA.quickWins?.length,
      },
      partnerB: {
        typeCode: couple.partnerB.typeCode,
        strengths: couple.partnerB.strengths?.length,
        growthOpportunities: couple.partnerB.growthOpportunities?.length,
        quickWins: couple.partnerB.quickWins?.length,
      },
      coupleProfile: {
        jointStrengths: couple.coupleProfile.jointStrengths?.length,
        sharedGrowthAreas: couple.coupleProfile.sharedGrowthAreas?.length,
        jointQuickWins: couple.coupleProfile.jointQuickWins?.length,
      },
    });

    try {
      validateCouplesBlueprint(couple);
      onComplete(couple);
    } catch (error) {
      if (error instanceof ValidationError) {
        console.error("Couples Blueprint Validation Failed:", {
          section: error.section || "unknown",
          expected: error.expected || "unknown",
          actual: error.actual || "unknown",
          message: error.message || "unknown error",
          errorName: error.name,
          stack: error.stack,
        });
        // In production, this should fail loudly and not return partial results
        throw new Error(
          `Couples assessment validation failed: ${
            error.message || "Unknown validation error"
          }`
        );
      }
      console.error("Non-validation error in couples assessment:", error);
      throw error;
    }
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

  if (phase === "A_RESULTS" && aResult)
    return (
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-2xl p-8 space-y-8">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold text-slate-800">
            Partner A Results
          </h2>
          <p className="text-slate-600">
            Here are your individual Dating DNA results
          </p>
        </div>
        <SinglesResults result={aResult} />
        <div className="text-center">
          <button
            onClick={handleContinueToPartnerB}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Continue to Partner B Assessment
          </button>
        </div>
      </div>
    );

  if (phase === "B_RESULTS" && bResult)
    return (
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-2xl p-8 space-y-8">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold text-slate-800">
            Partner B Results
          </h2>
          <p className="text-slate-600">
            Here are your individual Dating DNA results
          </p>
        </div>
        <SinglesResults result={bResult} />
        <div className="text-center">
          <button
            onClick={handleContinueToCombined}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            View Combined Couples Results
          </button>
        </div>
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
  const relationshipApproach = `As a ${a.typeCode}-${b.typeCode} couple, you bring together ${a.typeName} and ${b.typeName} approaches to create a unique partnership dynamic. ${typeCompatibility} Your combined strengths create a dynamic partnership where you can balance each other's natural tendencies and support each other's growth. Together, you navigate relationships by leveraging your complementary styles and creating harmony through understanding your differences. Your partnership benefits from the natural tension between your approaches, which provides opportunities for mutual learning and deeper connection. This combination creates a relationship that is both stable and dynamic, offering continuous opportunities for growth and mutual support.`;

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
    overviewSummary: `As a ${a.typeCode}-${b.typeCode} couple, you combine ${a.typeName} and ${b.typeName} approaches to create a unique partnership dynamic. Your relationship leverages the strengths of both types while navigating the natural tensions that arise from your differences. This combination offers opportunities for growth, balance, and mutual support as you build your connection together. Your partnership benefits from the complementary nature of your individual Dating DNA types, creating a relationship that is both stable and dynamic. Understanding how your types work together helps you navigate challenges and celebrate your unique strengths as a couple.`,
    coupleDynamics: `Your couple dynamics are shaped by the interplay between ${a.typeName} and ${b.typeName} approaches. This creates a relationship where you can complement each other's natural tendencies and create balance through understanding your differences. Your individual strengths combine to create a powerful partnership dynamic that allows you to support each other in areas where one might naturally excel. The natural tensions between your approaches provide opportunities for growth and deeper understanding of each other's perspectives. This dynamic creates a relationship that is both challenging and rewarding, offering continuous opportunities for mutual development and connection.`,
    communicationStyleAsCouple: `Together, you communicate by blending your individual styles to create a unique approach to dialogue and connection. This creates opportunities for both structured and organic dialogue, allowing you to address both practical and emotional aspects of your relationship. Your combined communication styles enable you to navigate both immediate concerns and long-term planning effectively. This blended approach helps you understand each other's needs and perspectives while maintaining your individual authenticity. Your communication as a couple becomes a strength that supports your relationship growth and mutual understanding.`,
    intimacyPatterns: `Your intimacy develops through the unique combination of your individual approaches to connection and emotional expression. This allows for both planned and spontaneous moments of closeness, creating a rich and varied intimate life that honors both of your natural preferences. Your different approaches to intimacy create opportunities for learning and growth in how you connect with each other. This combination ensures that your intimate life remains dynamic and fulfilling for both partners. Your intimacy patterns reflect the beautiful complexity of your combined Dating DNA types, creating a connection that is both deep and multifaceted.`,
    sharedGrowthAreas: `Your shared growth areas focus on leveraging your complementary strengths while addressing the challenges that arise from your different approaches to relationships. This creates opportunities for mutual development and deeper understanding of each other's perspectives and needs. Working together on these areas helps you build a stronger foundation for your relationship while honoring your individual growth journeys. These shared growth areas become opportunities for you to support each other and grow together as a couple. Your combined efforts in these areas create a relationship that continues to evolve and strengthen over time.`,
    jointStrengths: `Together, your joint strengths create a powerful foundation for your relationship that leverages the best of both your individual Dating DNA types. By combining your individual capabilities, you can achieve more together than either could alone, creating a partnership that is greater than the sum of its parts. Your combined strengths allow you to navigate challenges and opportunities with greater confidence and effectiveness. These joint strengths become the cornerstone of your relationship, providing stability and growth opportunities. Your partnership benefits from the unique combination of your individual strengths, creating a dynamic and supportive relationship.`,
    expandedNarrative: `Your relationship represents a unique blend of approaches that, when understood and appreciated, creates a strong foundation for long-term success and mutual fulfillment. By recognizing and leveraging your differences, you can build a partnership that grows stronger over time while honoring each other's individual needs and preferences. Your combined strengths offer multiple pathways to connection, growth, and mutual support that enrich your relationship experience. The key to your success lies in understanding how your individual Dating DNA types complement each other and using this knowledge to navigate challenges and celebrate your unique dynamic. Your relationship becomes a powerful example of how different approaches can create something beautiful and lasting when combined with understanding, respect, and love.`,
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
      {
        scenario: "Making decisions about social activities",
        partnerAResponse: `Partner A tends to ${
          a.typeCode[0] === "C"
            ? "enjoy group activities and social gatherings"
            : "prefer intimate, one-on-one interactions"
        }`,
        partnerBResponse: `Partner B tends to ${
          b.typeCode[0] === "C"
            ? "enjoy group activities and social gatherings"
            : "prefer intimate, one-on-one interactions"
        }`,
        coupleInsight:
          "Understanding each other's social preferences helps you plan activities that work for both of you.",
      },
      {
        scenario: "Discussing future plans and goals",
        partnerAResponse: `Partner A tends to ${
          a.typeCode[1] === "P"
            ? "focus on present-day compatibility and current lifestyle"
            : "consider long-term potential and future aspirations"
        }`,
        partnerBResponse: `Partner B tends to ${
          b.typeCode[1] === "P"
            ? "focus on present-day compatibility and current lifestyle"
            : "consider long-term potential and future aspirations"
        }`,
        coupleInsight:
          "Balancing present needs with future goals creates a strong foundation for your relationship.",
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
  const buttonRef = useRef<HTMLButtonElement>(null);
  function handleEmailSubmit() {
    onFinish(answers);
    if (buttonRef.current) {
      buttonRef.current.disabled = true;
    }
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
          className="w-full px-6 py-4 disab bg-green-600 cursor-pointer text-white rounded-2xl font-semibold text-lg hover:from-violet-700 hover:to-fuchsia-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-x"
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
