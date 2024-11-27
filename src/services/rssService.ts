import { NewsItem } from '../types/news';
import { ApiError } from '../types/errors';
import { parseRSSContent } from '../utils/rssParser';
import { fetchWithTimeout } from '../utils/fetchWithTimeout';

const RSS_URL = 'https://www.forexlive.com/feed/news';
const PROXIES = [
  'https://api.allorigins.win/raw?url=',
  'https://corsproxy.io/?',
  'https://thingproxy.freeboard.io/fetch/',
  'https://api.codetabs.com/v1/proxy?quest='
];

const CACHE_KEY = 'rss_cache';
const CACHE_DURATION = 60 * 1000; // 1 minute

interface CacheEntry {
  timestamp: number;
  data: NewsItem[];
}

function getCachedData(): NewsItem[] | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const entry: CacheEntry = JSON.parse(cached);
    if (Date.now() - entry.timestamp > CACHE_DURATION) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }

    return entry.data;
  } catch {
    localStorage.removeItem(CACHE_KEY);
    return null;
  }
}

function setCachedData(data: NewsItem[]): void {
  try {
    const entry: CacheEntry = {
      timestamp: Date.now(),
      data
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(entry));
  } catch (error) {
    console.warn('Failed to cache RSS data:', error);
  }
}

export async function fetchRSSFeed(): Promise<NewsItem[]> {
  const cached = getCachedData();
  if (cached) {
    return cached;
  }

  let lastError: ApiError | null = null;

  for (const proxy of PROXIES) {
    try {
      const proxyUrl = `${proxy}${encodeURIComponent(RSS_URL)}`;
      
      const response = await fetchWithTimeout(proxyUrl, {
        timeout: 15000,
        retries: 1,
        retryDelay: 1000,
        headers: {
          'Accept': 'application/xml, text/xml, application/rss+xml',
          'User-Agent': 'Mozilla/5.0 (compatible; ForexNewsAnalyzer/1.0)',
        },
        cache: 'no-store',
      });

      const xmlData = await response.text();
      
      if (!xmlData.includes('<?xml') && !xmlData.includes('<rss')) {
        throw {
          code: 'INVALID_RESPONSE',
          message: 'Invalid XML response from proxy',
        } as ApiError;
      }

      const newsItems = await parseRSSContent(xmlData);
      if (newsItems.length > 0) {
        setCachedData(newsItems);
        return newsItems;
      }
    } catch (error) {
      console.warn(`Proxy ${proxy} failed:`, error);
      lastError = error as ApiError;
      continue;
    }
  }

  throw lastError || {
    code: 'RSS_ERROR',
    message: 'All proxies failed to fetch RSS feed',
  } as ApiError;
}