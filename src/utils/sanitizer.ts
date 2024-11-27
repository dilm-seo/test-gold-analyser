const ALLOWED_TAGS = new Set(['p', 'br', 'b', 'i', 'strong', 'em']);

export function sanitizeHtml(input: string): string {
  return input
    .replace(/<([^>]+)>/g, (_, tag) => {
      const tagName = tag.split(/\s+/)[0].toLowerCase();
      return ALLOWED_TAGS.has(tagName) ? `<${tag}>` : '';
    })
    .replace(/\s+/g, ' ')
    .trim();
}