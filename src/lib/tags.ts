import type { Hairstyle } from './placeholder-images';

const KEYWORD_TAGS: Record<string, string> = {
  curl: 'curly',
  curly: 'curly',
  wave: 'wavy',
  wavy: 'wavy',
  straight: 'straight',
  bob: 'bob',
  pixie: 'pixie',
  fringe: 'bangs',
  bang: 'bangs',
  layer: 'layered',
  layered: 'layered',
  fade: 'fade',
  undercut: 'undercut',
  brown: 'brown',
  blonde: 'blonde',
  red: 'red',
  dark: 'dark',
  medium: 'medium',
  short: 'short',
  long: 'long',
};

const STOP_WORDS = new Set([
  'the',
  'and',
  'with',
  'for',
  'that',
  'this',
  'you',
  'your',
  'face',
  'hair',
  'style',
  'hairstyle',
]);

export function extractTagsFromText(text?: string, limit = 8): string[] {
  if (!text) return [];
  const tags = new Set<string>();
  const normalized = text.toLowerCase();
  for (const [keyword, tag] of Object.entries(KEYWORD_TAGS)) {
    if (normalized.includes(keyword)) {
      tags.add(tag);
    }
  }

  if (tags.size >= limit) {
    return Array.from(tags).slice(0, limit);
  }

  const extraTokens = normalized
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .filter(token => !STOP_WORDS.has(token));
  for (const token of extraTokens) {
    if (tags.size >= limit) break;
    if (token.length > 2) {
      tags.add(token);
    }
  }

  return Array.from(tags).slice(0, limit);
}

export function extractTagsFromHairstyle(hairstyle?: Hairstyle | null): string[] {
  if (!hairstyle) return [];
  const base = [
    hairstyle.category,
    hairstyle.name,
    ...(hairstyle.suitableFaces ?? []),
    hairstyle.description,
  ]
    .filter(Boolean)
    .join(' ');
  return extractTagsFromText(base, 10);
}
