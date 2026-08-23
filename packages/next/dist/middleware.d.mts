import { NextResponse } from 'next/server';
import { OntoConfig } from './config.mjs';
export { AI_BOT_USER_AGENTS, AiBot, matchBot } from '@ontosdk/core/score';

declare function ontoMiddleware(request: any, config?: OntoConfig): Promise<NextResponse<unknown>>;

export { ontoMiddleware };
