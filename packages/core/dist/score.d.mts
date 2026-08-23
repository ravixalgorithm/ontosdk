import { S as ScoringInput, b as ScoringResult, a as ScoringInsights, H as HallucinationRisk, A as AioGrade } from './types-UfbUKz4D.mjs';
export { R as Recommendation } from './types-UfbUKz4D.mjs';

declare function scoreToGrade(score: number): AioGrade;
declare function getHallucinationRisk(score: number, insights: ScoringInsights): HallucinationRisk;
declare function calculateAioScore(input: ScoringInput): ScoringResult;

interface AiBot {
    name: string;
    company: string;
    addedAt?: string;
}
declare const AI_BOTS: AiBot[];
declare const AI_BOT_USER_AGENTS: string[];
declare function matchBot(userAgent: string | null): AiBot | undefined;

export { AI_BOTS, AI_BOT_USER_AGENTS, type AiBot, AioGrade, HallucinationRisk, ScoringInput, ScoringInsights, ScoringResult, calculateAioScore, getHallucinationRisk, matchBot, scoreToGrade };
