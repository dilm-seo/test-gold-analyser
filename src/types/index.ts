export interface NewsItem {
  title: string;
  description: string;
  link: string;
  pubDate: string;
  sentiment: string;
  impact: 'high' | 'medium' | 'low';
  category: string;
  usdSentiment?: string;
  confidence?: number;
  keyLevelsUSD?: string | null;
  keyLevelsGold?: string | null;
  tradeRecommendation?: string | null;
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
  usdSentiment: string;
  confidence: number;
  keyLevelsUSD: string | null;
  keyLevelsGold: string | null;
  tradeRecommendation: string | null;
}