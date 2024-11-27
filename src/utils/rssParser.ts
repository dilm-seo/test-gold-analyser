import { NewsItem } from '../types/news';
import { ApiError } from '../types/errors';
import { XMLParser } from 'fast-xml-parser';
import he from 'he';
import { sanitizeHtml } from './sanitizer';

export async function parseRSSContent(xmlData: string): Promise<NewsItem[]> {
  if (!xmlData.trim()) {
    throw {
      code: 'EMPTY_RSS',
      message: 'RSS feed content is empty',
    } as ApiError;
  }

  try {
    // Pre-process XML data to handle potential encoding issues
    const cleanXml = xmlData
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, '') // Remove control characters
      .replace(/&(?!(amp|lt|gt|quot|apos);)/g, '&amp;'); // Fix unescaped ampersands

    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      textNodeName: '#text',
      parseAttributeValue: true,
      trimValues: true,
      parseTagValue: false,
      cdataTagName: '__cdata',
      processEntities: false,
    });

    const result = parser.parse(cleanXml);

    if (!result?.rss?.channel?.item) {
      throw {
        code: 'INVALID_RSS_FORMAT',
        message: 'Invalid RSS feed structure',
      } as ApiError;
    }

    const items = Array.isArray(result.rss.channel.item)
      ? result.rss.channel.item
      : [result.rss.channel.item];

    return items
      .filter(item => isValidItem(item))
      .map(item => transformRSSItem(item))
      .slice(0, 30); // Limit to latest 30 items
  } catch (error) {
    if (error instanceof Error) {
      throw {
        code: 'RSS_PARSE_ERROR',
        message: 'Failed to parse RSS content',
        details: error.message,
      } as ApiError;
    }
    throw error;
  }
}

function isValidItem(item: any): boolean {
  return (
    item &&
    (item.title || item['title']?.['__cdata']) &&
    (item.description || item['description']?.['__cdata']) &&
    (item.link || item['link']?.['__cdata'])
  );
}

function transformRSSItem(item: any): NewsItem {
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
    .replace(/\u0000/g, '') // Remove null characters
    .replace(/\uFFFD/g, '') // Remove replacement characters
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