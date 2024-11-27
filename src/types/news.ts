export interface NewsItem {
  title: string;
  description: string;
  link: string;
  pubDate: string;
  sentiment: string;
  impact: 'high' | 'medium' | 'low';
  category: string;
}

export interface RawRSSItem {
  title: any;
  description: any;
  link: any;
  pubDate: any;
  category?: any;
}