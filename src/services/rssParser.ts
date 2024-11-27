import { XMLParser } from 'fast-xml-parser';
import he from 'he';
import { NewsItem, RawRSSItem } from '../types/news';
import { RSSError } from '../types/errors';
import { sanitizeHtml } from '../utils/sanitizer';

export async function parseRSSContent(xmlData: string): Promise<NewsItem[]> {
  if (!xmlData.trim()) {
    throw new RSSError('EMPTY_RSS', 'RSS feed content is empty');
  }

  try {
    const cleanXml = preprocessXML(xmlData);
    const parser = createXMLParser();
    const result = parser.parse(cleanXml);

    validateRSSStructure(result);
    const items = extractRSSItems(result);
    
    return items
      .filter(item => isValidItem(item))
      .map(item => transformRSSItem(item))
      .slice(0, 30);
  } catch (error) {
    handleParsingError(error);
    throw error;
  }
}

function preprocessXML(xml: string): string {
  return xml
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, '')
    .replace(/&(?!(amp|lt|gt|quot|apos);)/g, '&amp;');
}

function createXMLParser(): XMLParser {
  return new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    textNodeName: '#text',
    parseAttributeValue: true,
    trimValues: true,
    parseTagValue: false,
    cdataTagName: '__cdata',
    processEntities: false,
  });
}

function validateRSSStructure(result: any): void {
  if (!result?.rss?.channel?.item) {
    throw new RSSError('INVALID_RSS_FORMAT', 'Invalid RSS feed structure');
  }
}

function extractRSSItems(result: any): RawRSSItem[] {
  return Array.isArray(result.rss.channel.item)
    ? result.rss.channel.item
    : [result.rss.channel.item];
}

function isValidItem(item: RawRSSItem): boolean {
  return !!(
    item &&
    (item.title || item['title']?.['__cdata']) &&
    (item.description || item['description']?.['__cdata']) &&
    (item.link || item['link']?.['__cdata'])
  );
}

function transformRSSItem(item: RawRSSItem): NewsItem {
  const title = extractContent(item.title);
  const description = extractContent(item.description);
  const category = extractContent(item.category) || 'Uncategorized';
  const link = extractContent(item.link);
  const pubDate = parseDate(extractContent(item.pubDate));

  return {
    title: sanitizeHtml(decodeContent(title)),
    description: sanitizeHtml(decodeContent(cleanDescription(description))),
    link,
    pubDate: pubDate.toISOString(),
    sentiment: '',
    impact: 'low',
    category: sanitizeHtml(decodeContent(category))
  };
}

function extractContent(field: any): string {
  if (!field) return '';
  
  if (typeof field === 'object') {
    if (field['__cdata']) {
      return field['__cdata'];
    }
    if (field['#text']) {
      return field['#text'];
    }
  }
  
  return String(field);
}

function decodeContent(content: string): string {
  return he.decode(content)
    .replace(/\u0000/g, '')
    .replace(/\uFFFD/g, '')
    .trim();
}

function cleanDescription(description: string): string {
  return description
    .replace(/<!\[CDATA\[|\]\]>/g, '')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function parseDate(dateStr: string): Date {
  const parsed = new Date(dateStr);
  return isNaN(parsed.getTime()) ? new Date() : parsed;
}

function handleParsingError(error: unknown): never {
  if (error instanceof Error) {
    throw new RSSError(
      'RSS_PARSE_ERROR',
      'Failed to parse RSS content',
      error.message
    );
  }
  throw error;
}