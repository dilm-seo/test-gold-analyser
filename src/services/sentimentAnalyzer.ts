import { NewsItem } from '../types/news';
import { MarketSentiment, AggregatedAnalysis } from '../types/analysis';
import { differenceInHours } from 'date-fns';

export function analyzeMarketSentiment(news: NewsItem[]): AggregatedAnalysis {
  const sortedNews = news.sort((a, b) => 
    new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
  );

  const usdSentiment = analyzeSentimentForAsset(sortedNews, 'USD');
  const goldSentiment = analyzeSentimentForAsset(sortedNews, 'GOLD');

  return {
    usdSentiment,
    goldSentiment
  };
}

function analyzeSentimentForAsset(news: NewsItem[], asset: 'USD' | 'GOLD'): MarketSentiment {
  const relevantNews = news.filter(item => isRelevantToAsset(item, asset));
  const weightedSentiments = calculateWeightedSentiments(relevantNews);
  
  const keyFactors = extractKeyFactors(relevantNews, asset);
  const confidence = calculateConfidence(relevantNews, weightedSentiments.sentiment);

  return {
    asset,
    sentiment: weightedSentiments.sentiment,
    confidence,
    keyFactors,
    lastUpdate: new Date().toISOString()
  };
}

function isRelevantToAsset(item: NewsItem, asset: 'USD' | 'GOLD'): boolean {
  const content = `${item.title} ${item.description}`.toLowerCase();
  
  const usdKeywords = ['fed', 'federal reserve', 'powell', 'usd', 'dollar', 'us economy', 'inflation'];
  const goldKeywords = ['gold', 'xau', 'precious metals', 'safe haven', 'bullion'];
  
  const keywords = asset === 'USD' ? usdKeywords : goldKeywords;
  return keywords.some(keyword => content.includes(keyword));
}

function calculateWeightedSentiments(news: NewsItem[]): { sentiment: 'bullish' | 'bearish' | 'neutral' } {
  if (news.length === 0) return { sentiment: 'neutral' };

  const weights = news.map(item => {
    const hoursAgo = differenceInHours(new Date(), new Date(item.pubDate));
    const timeWeight = Math.max(0, 1 - hoursAgo / 24); // Decay over 24 hours
    const impactWeight = item.impact === 'high' ? 1 : item.impact === 'medium' ? 0.6 : 0.3;
    
    return {
      sentiment: item.sentiment,
      weight: timeWeight * impactWeight
    };
  });

  const totalWeight = weights.reduce((sum, item) => sum + item.weight, 0);
  const sentimentScores = {
    bullish: 0,
    bearish: 0,
    neutral: 0
  };

  weights.forEach(({ sentiment, weight }) => {
    sentimentScores[sentiment as keyof typeof sentimentScores] += weight;
  });

  const normalizedScores = Object.entries(sentimentScores).map(([sentiment, score]) => ({
    sentiment,
    score: score / totalWeight
  }));

  const dominantSentiment = normalizedScores.reduce((prev, current) => 
    current.score > prev.score ? current : prev
  );

  return { sentiment: dominantSentiment.sentiment as 'bullish' | 'bearish' | 'neutral' };
}

function calculateConfidence(news: NewsItem[], dominantSentiment: string): number {
  if (news.length === 0) return 0;

  const recentHighImpactNews = news.filter(item => {
    const hoursAgo = differenceInHours(new Date(), new Date(item.pubDate));
    return hoursAgo <= 24 && item.impact === 'high';
  });

  const agreementScore = news.filter(item => item.sentiment === dominantSentiment).length / news.length;
  const recentHighImpactBonus = recentHighImpactNews.length * 0.1;

  return Math.min(Math.round((agreementScore * 100) + (recentHighImpactBonus * 100)), 100);
}

function extractKeyFactors(news: NewsItem[], asset: 'USD' | 'GOLD'): string[] {
  return news
    .filter(item => item.impact === 'high' || item.impact === 'medium')
    .slice(0, 3)
    .map(item => item.title);
}