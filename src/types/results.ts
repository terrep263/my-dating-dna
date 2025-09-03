export type StrandScores = {
	 SE: number;
	 AS: number;
	 DF: number;
	 RP: number;
};

export type AnswerChoice = 'A' | 'B' | 'C' | 'D';

export type PlanWeek = { title: string; tasks: string[] };

export type AiBasic = {
	 strengths: string[];
	 growthEdges: string[];
	 sevenDayPlan: string[];
	 thirtyDayPlan: { weeks: PlanWeek[] };
	 compatibility: { energizing: string[]; challenging: string[]; tips: string[] };
	 scripts: string[];
};

export type AiPremium = {
	 extendedEightWeekPlan: { weeks: PlanWeek[] };
	 conversationVault: { title: string; scripts: { scenario: string; script: string }[] };
	 compatibilityMatrix: { rows: { type: string; dynamics: string; bridges: string }[] };
	 quickStart90: { segments: { title: string; steps: string[] }[] };
	 jointPractices?: { title: string; items: string[] };
	 conflictScripts?: { scenarios: { title: string; dialogueA: string; dialogueB: string }[] };
	 pdfWorkbookContent: { sections: { title: string; body: string[] }[] };
	 audio?: { sections: { id: string; text: string; url?: string }[] };
};

export type ResultsRecord = {
	 id: string;
	 createdAt: string;
	 kind: 'singles' | 'couples';
	 scores: StrandScores;
	 typeCode: string;
	 answers: Record<string, AnswerChoice>;
	 premium: boolean;
	 ai: { basic: AiBasic; premium?: AiPremium };
	 ownerEmail?: string;
	 partnerEmail?: string;
};

export type GraceMessage = {
	 role: 'user' | 'assistant';
	 text: string;
	 ts: number;
};

export type GraceThread = GraceMessage[];


