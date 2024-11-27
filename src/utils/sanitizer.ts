const ALLOWED_TAGS = new Set(['p', 'br', 'b', 'i', 'em', 'strong']);

export function sanitizeHtml(input: string): string {
  if (!input) return '';
  
  // Convert to string and trim
  let text = input.toString().trim();
  
  // Remove potentially dangerous tags and attributes
  text = text
    // Remove script tags and contents
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Remove style tags and contents
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    // Remove comments
    .replace(/<!--[\s\S]*?-->/g, '')
    // Remove potentially dangerous attributes
    .replace(/(on\w+|style|class|id)="[^"]*"/gi, '');

  // Only allow specific safe tags
  const safeText = text.replace(/<\/?([^>]+)>/g, (match, tag) => {
    tag = tag.toLowerCase().trim();
    return ALLOWED_TAGS.has(tag) ? match : '';
  });

  // Decode HTML entities
  return safeText
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .trim();
}