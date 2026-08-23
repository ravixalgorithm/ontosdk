/* ─────────────────────────────────────────────────────────────────────────────
   Thin re-export. Single source of truth lives in @ontosdk/core/score.
   Kept here so existing consumers (middleware.ts, external imports of
   `@ontosdk/next` → AI_BOTS/matchBot/AiBot) keep working unchanged.
   ─────────────────────────────────────────────────────────────────────────── */

export {
  AI_BOTS,
  AI_BOT_USER_AGENTS,
  matchBot,
} from '@ontosdk/core/score';

export type { AiBot } from '@ontosdk/core/score';
