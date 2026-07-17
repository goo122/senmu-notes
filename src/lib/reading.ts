/** Estimate reading time for Chinese + English mixed content. */
export function getReadingMinutes(content: string): number {
  const plain = content
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]+`/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]+\)/g, ' ')
    .replace(/\[[^\]]*\]\([^)]+\)/g, ' ')
    .replace(/[#>*_~|=\-]/g, ' ');

  const chinese = (plain.match(/[\u4e00-\u9fff]/g) ?? []).length;
  const words = (plain.match(/[A-Za-z0-9]+/g) ?? []).length;
  // ~400 Chinese chars/min, ~200 English words/min
  const minutes = Math.ceil(chinese / 400 + words / 200);
  return Math.max(1, minutes);
}

export function formatReadingTime(minutes: number): string {
  return `约 ${minutes} 分钟`;
}

export type Heading = {
  depth: number;
  text: string;
  id: string;
};

/** Slug similar to GitHub / common rehype heading ids. */
export function slugifyHeading(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fff\s-]/g, '')
    .replace(/\s+/g, '-');
}

/** Extract h2/h3 from raw markdown for table of contents. */
export function extractHeadings(content: string): Heading[] {
  const headings: Heading[] = [];
  const seen = new Map<string, number>();

  for (const line of content.split('\n')) {
    const match = /^(#{2,3})\s+(.+?)\s*#*\s*$/.exec(line.trim());
    if (!match) continue;

    const depth = match[1].length;
    const text = match[2].replace(/\s+#+\s*$/, '').trim();
    let id = slugifyHeading(text);
    const count = seen.get(id) ?? 0;
    if (count > 0) id = `${id}-${count}`;
    seen.set(slugifyHeading(text), count + 1);

    headings.push({ depth, text, id });
  }

  return headings;
}
