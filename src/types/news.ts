export interface NewsItem {
  title: string;
  description: string;
  link: string;
  pubDate: string;
  sentiment: string;
  impact: 'high' | 'medium' | 'low';
  category: string;
}

export interface Settings {
  apiKey: string;
  model: string;
  refreshInterval: number;
}

export interface AnalysisResult {
  sentiment: string;
  impact: 'high' | 'medium' | 'low';
  summary: string;
}