/* Ambient declaration — turndown-plugin-gfm ships no types (as of 1.0.2). */
declare module 'turndown-plugin-gfm' {
  import type TurndownService from 'turndown';
  type TurndownPlugin = (service: TurndownService) => void;
  export const gfm: TurndownPlugin;
  export const tables: TurndownPlugin;
  export const strikethrough: TurndownPlugin;
  export const taskListItems: TurndownPlugin;
  export const highlightedCodeBlock: TurndownPlugin;
}