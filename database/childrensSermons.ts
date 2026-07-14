// Sourced from Haverhill SDA Church's public children's-sermon archive
// (haverhillma.adventistchurch.org), used here on a personal-offline-use basis with the
// same disclosure as this app's other externally-sourced content — see DEV_MODE.md.
export type ChildrensSermon = {
  id: string;
  title: string;
  theme: string;
  object: string;
  scriptureRef: string;
  body: string;
};

let DATA: ChildrensSermon[] | null = null;

function load(): ChildrensSermon[] {
  if (!DATA) DATA = require('./childrensSermonsData.json');
  return DATA!;
}

export function getChildrensSermons(): ChildrensSermon[] {
  return load();
}

export function getChildrensSermon(id: string): ChildrensSermon | undefined {
  return load().find((s) => s.id === id);
}
