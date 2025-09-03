"use client";

import Navigation from "@/components/Navbar";
import { useMemo, useState } from "react";

// Lead Magnet: 4‑Question Snapshot Assessment
// - Email gate → 4 questions (2 forced choice, 2 Likert)
// - Produces a deterministic, research‑aligned "tendency" preview for all 4 dimensions
// - Outputs a provisional type seed (e.g., C?L?) and clear CTA to take the full 32‑question assessment
// - mydna‑prefixed Tailwind classes to avoid collisions with your site
// - Copy this component into your project and mount it on your /assessment/lead‑magnet route

// ---------- Types ----------
type DimensionKey =
  | "socialEnergy"
  | "attractionDriver"
  | "decisionFilter"
  | "relationshipRhythm";

interface QuestionBase {
  id: string;
  dimension: DimensionKey;
  prompt: string;
  kind: "forced" | "likert";
}
interface ForcedChoice extends QuestionBase {
  kind: "forced";
  options: { A: string; B: string };
}
interface Likert extends QuestionBase {
  kind: "likert";
  polarity: "first" | "second";
} // which pole the statement leans toward when agreeing

type Question = ForcedChoice | Likert;

type SnapshotAnswers = { [id: string]: "A" | "B" | number };

// ---------- Questions (aligned to your framework wording) ----------
const LM_QS: Question[] = [
  // Social Energy (C vs F)
  {
    id: "LM-1",
    dimension: "socialEnergy",
    kind: "forced",
    prompt: "When meeting new people I usually…",
    options: { A: "Cast a wide net", B: "Keep it selective" },
  },
  // Relationship Rhythm (S vs O)
  {
    id: "LM-2",
    dimension: "relationshipRhythm",
    kind: "forced",
    prompt: "My relationship pace feels best when…",
    options: { A: "There’s a clear plan", B: "It unfolds naturally" },
  },
  // Attraction Driver (P vs T) — statement favors Potential (T) when agreeing
  {
    id: "LM-3",
    dimension: "attractionDriver",
    kind: "likert",
    polarity: "second",
    prompt: "I value long‑term potential over present fit.",
  },
  // Decision Filter (L vs H) — statement favors Logic (L) when agreeing
  {
    id: "LM-4",
    dimension: "decisionFilter",
    kind: "likert",
    polarity: "first",
    prompt: "I decide with my head more than my heart.",
  },
];

// ---------- Helpers ----------
const POLES: Record<DimensionKey, [string, string]> = {
  socialEnergy: ["C", "F"], // Connector vs Focuser
  attractionDriver: ["P", "T"], // Present vs Potential
  decisionFilter: ["L", "H"], // Logic vs Heart
  relationshipRhythm: ["S", "O"], // Structured vs Organic
};

const POLE_WORD: Record<string, string> = {
  C: "Connector",
  F: "Focuser",
  P: "Present",
  T: "Potential",
  L: "Logic",
  H: "Heart",
  S: "Structured",
  O: "Organic",
};

function polarityDecision(q: Likert, v: number, dim: DimensionKey) {
  // If polarity === "first": agree (≥4) → first pole; else → second pole
  // If polarity === "second": agree (≥4) → second pole; else → first pole
  const [first, second] = POLES[dim];
  const agree = v >= 4; // 4..7 treated as leaning toward the statement
  if (q.polarity === "first") return agree ? first : second;
  return agree ? second : first;
}

function forcedDecision(v: "A" | "B", dim: DimensionKey) {
  const [first, second] = POLES[dim];
  return v === "A" ? first : second;
}

function assembleSeed(letters: Partial<Record<DimensionKey, string>>) {
  const s = letters.socialEnergy ?? "?";
  const a = letters.attractionDriver ?? "?";
  const d = letters.decisionFilter ?? "?";
  const r = letters.relationshipRhythm ?? "?";
  return `${s}${a}${d}${r}`;
}

// ---------- UI Subcomponents ----------
function ProgressBar({ value }: { value: number }) {
  return (
    <div className="w-full h-2 bg-slate-200 rounded">
      <div
        className="h-2 rounded bg-violet-600"
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

function StrandPill({ code, label }: { code: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-medium">
      <span className="font-semibold text-slate-900">{code}</span>
      <span>• {label}</span>
    </span>
  );
}

// Pill function removed - was unused

// ---------- Main Component ----------
export default function LeadMagnetSnapshot() {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(true);
  const [step, setStep] = useState(0); // 0=email, 1..LM_QS.length=questions, LM_QS.length+1=results
  const [ans, setAns] = useState<SnapshotAnswers>({});

  const emailValid = /.+@.+\..+/.test(email);
  const totalSteps = LM_QS.length + 1; // email gate + 4 questions
  const progress = Math.round((step / totalSteps) * 100);

  const letters = useMemo(() => {
    const l: Partial<Record<DimensionKey, string>> = {};
    for (const q of LM_QS) {
      const v = ans[q.id];
      if (v == null) continue;
      if (q.kind === "forced")
        l[q.dimension] = forcedDecision(v as "A" | "B", q.dimension);
      else
        l[q.dimension] = polarityDecision(
          q as Likert,
          v as number,
          q.dimension
        );
    }
    return l;
  }, [ans]);

  const seed = assembleSeed(letters);
  const seedName = useMemo(() => {
    const [s, a, d, r] = seed.split("");
    const w = (k?: string) => (k && POLE_WORD[k]) || "?";
    return `${w(s)}–${w(a)} ${w(d)}–${w(r)}`;
  }, [seed]);

  const readyForResults = step > LM_QS.length;

  return (
    <>
      <Navigation />

      <div className="h-[80vh] flex items-center bg-slate-50 p-4 sm:p-8">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="bg-white rounded-2xl shadow p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h1 className="text-xl sm:text-2xl font-semibold">
                Dating DNA • Free 4‑Question Snapshot
              </h1>
              <div className="w-40">
                <ProgressBar value={progress} />
              </div>
            </div>

            {step === 0 && (
              <div className="space-y-4">
                <p className="text-slate-700">
                  Unlock your instant preview. Enter your email to start the
                  60‑second snapshot. No spam. Unsubscribe anytime.
                </p>
                <div className="space-y-2">
                  <label className="text-sm text-slate-700">Email</label>
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
                <label className="flex items-start gap-2 text-xs text-slate-600">
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={() => setConsent(!consent)}
                    className="mt-0.5"
                  />
                  <span>
                    I agree to receive my snapshot and occasional updates. You
                    can unsubscribe anytime.
                  </span>
                </label>
                <button
                  disabled={!emailValid || !consent}
                  onClick={() => setStep(1)}
                  className="w-full px-6 py-4 bg-green-600 text-white rounded-2xl font-semibold hover:from-violet-700 hover:to-fuchsia-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl disabled:pointer-events-none disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                >
                  Start
                </button>
                <div className="text-[11px] text-slate-500">
                  This snapshot previews your style across all four strands. For
                  research‑grade results, complete the full 32‑question
                  assessment.
                </div>
              </div>
            )}

            {step > 0 && step <= LM_QS.length && (
              <div className="space-y-4">
                <div className="text-sm text-slate-600">
                  Question {step} of {LM_QS.length}
                </div>
                <div className="text-slate-900 font-medium">
                  {LM_QS[step - 1].prompt}
                </div>

                {LM_QS[step - 1].kind === "forced" ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {Object.entries(
                      (LM_QS[step - 1] as ForcedChoice).options
                    ).map(([k, label]) => (
                      <label
                        key={k}
                        className={`border rounded-xl p-3 cursor-pointer flex items-start gap-3 ${
                          ans[LM_QS[step - 1].id] === k
                            ? "border-violet-600 bg-violet-50"
                            : "border-slate-200"
                        }`}
                      >
                        <input
                          type="radio"
                          name={LM_QS[step - 1].id}
                          className="mt-1"
                          checked={ans[LM_QS[step - 1].id] === k}
                          onChange={() =>
                            setAns((a) => ({
                              ...a,
                              [LM_QS[step - 1].id]: k as "A" | "B",
                            }))
                          }
                        />
                        <span className="text-slate-700">{label}</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>Strongly Disagree</span>
                      <span>Strongly Agree</span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={7}
                      step={1}
                      value={
                        typeof ans[LM_QS[step - 1].id] === "number"
                          ? (ans[LM_QS[step - 1].id] as number)
                          : 4
                      }
                      onChange={(e) =>
                        setAns((a) => ({
                          ...a,
                          [LM_QS[step - 1].id]: Number(e.target.value),
                        }))
                      }
                      className="w-full"
                    />
                    <div className="text-center text-sm text-slate-600">
                      {typeof ans[LM_QS[step - 1].id] === "number"
                        ? ans[LM_QS[step - 1].id]
                        : 4}
                      /7
                    </div>
                  </div>
                )}

                <div className="flex justify-between pt-2">
                  <button
                    onClick={() => setStep(step - 1)}
                    disabled={step === 1}
                    className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-50"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setStep(step + 1)}
                    disabled={ans[LM_QS[step - 1].id] == null}
                    className="px-4 py-2 rounded-lg bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-50"
                  >
                    {step < LM_QS.length ? "Next" : "See Snapshot"}
                  </button>
                </div>
              </div>
            )}

            {readyForResults && (
              <div className="space-y-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold">Your Snapshot</h2>
                    <div className="text-slate-600 text-sm">
                      This is a quick preview. Your full results use 32
                      research‑backed questions for scientific reliability.
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <div className="text-xs text-slate-500">Email</div>
                    <div className="text-sm font-medium">{email}</div>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                  <div className="text-sm text-slate-600">
                    Provisional type seed
                  </div>
                  <div className="text-2xl font-bold">{seed}</div>
                  <div className="text-slate-700">{seedName}</div>
                  <div className="flex flex-wrap gap-2 pt-2">
                    {letters.socialEnergy && (
                      <StrandPill
                        code={letters.socialEnergy}
                        label="Social Energy"
                      />
                    )}
                    {letters.attractionDriver && (
                      <StrandPill
                        code={letters.attractionDriver}
                        label="Attraction Driver"
                      />
                    )}
                    {letters.decisionFilter && (
                      <StrandPill
                        code={letters.decisionFilter}
                        label="Decision Filter"
                      />
                    )}
                    {letters.relationshipRhythm && (
                      <StrandPill
                        code={letters.relationshipRhythm}
                        label="Relationship Rhythm"
                      />
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm text-slate-700">What this means</div>
                  <ul className="list-disc ml-5 text-slate-700 space-y-1 text-sm">
                    <li>
                      Your snapshot covers all four strands but uses just 4
                      items. Expect a directional preview, not a final type.
                    </li>
                    <li>
                      The full assessment calculates dimensional scores (0–100)
                      and assigns your exact 4‑letter code.
                    </li>
                    <li>
                      Results include strengths, growth opportunities, quick
                      wins, and a 30‑day plan.
                    </li>
                  </ul>
                </div>

                <div className="bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-2xl shadow p-5 space-y-3">
                  <div className="text-lg font-semibold">
                    Unlock your full Dating DNA (32 questions)
                  </div>
                  <div className="text-sm opacity-90">
                    Scientific scoring • Complete results • PDF export • Grace
                     coaching AI
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <button className="px-4 py-2 rounded-lg bg-white text-violet-700 font-semibold hover:bg-violet-50">
                      Start Full Assessment
                    </button>
                    <button className="px-4 py-2 rounded-lg border border-white/50 font-semibold hover:bg-white/10">
                      Try Grace • 7‑day trial
                    </button>
                  </div>
                  <div className="text-[11px]">
                    Trial requires credit card and auto‑converts if not
                    cancelled. In production, this button opens your FastSpring
                    checkout.
                  </div>
                </div>

                <div className="flex justify-between">
                  <button
                    onClick={() => setStep(1)}
                    className="text-slate-600 underline"
                  >
                    Retake snapshot
                  </button>
                  <button
                    onClick={() =>
                      window.scrollTo({ top: 0, behavior: "smooth" })
                    }
                    className="text-slate-600 underline"
                  >
                    Back to top
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="text-xs text-slate-500 text-center">
            By continuing you agree to receive your snapshot via email. You can
            unsubscribe anytime.
          </div>
        </div>
      </div>
    </>
  );
}
