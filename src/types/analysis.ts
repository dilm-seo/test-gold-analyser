export interface MarketSentiment {
  asset: 'USD' | 'GOLD';
  sentiment: 'bullish' | 'bearish' | 'neutral';
  confidence: number;
  keyFactors: string[];
  lastUpdate: string;
}

export interface AggregatedAnalysis {
  usdSentiment: MarketSentiment;
  goldSentiment: MarketSentiment;
}