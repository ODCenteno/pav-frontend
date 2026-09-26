import type { QuickFact } from "@/types/homepage.type";

/**
 * Home quick facts (F2): the bento's five fact cards. The sixth homepage slot
 * held the "Qué hacer" box, which the redesign removes from the home.
 */
const HOME_FACT_COUNT = 5;

export function homeQuickFacts(items: QuickFact[]): QuickFact[] {
  return items.slice(0, HOME_FACT_COUNT);
}
