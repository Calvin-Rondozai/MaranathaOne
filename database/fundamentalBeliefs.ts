export type FundamentalBelief = { number: number; title: string; content: string };

let DATA: { title: string; beliefs: FundamentalBelief[] } | null = null;

function load() {
  if (!DATA) DATA = require('./fundamentalBeliefs.json');
  return DATA!;
}

export function getFundamentalBeliefs(): FundamentalBelief[] {
  return load().beliefs;
}

export function getFundamentalBelief(number: number): FundamentalBelief | undefined {
  return load().beliefs.find((b) => b.number === number);
}
