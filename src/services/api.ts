import axios from 'axios';
import OpenAI from 'openai';
import { NewsItem, AnalysisResult, Settings } from '../types';
import { parseRSSContent } from './rssParser';
import { RSSError } from '../types/errors';

export async function fetchRSSFeed(): Promise<NewsItem[]> {
  try {
    const response = await axios.get('https://www.forexlive.com/feed/news', {
      headers: {
        'Accept': 'application/rss+xml, application/xml, text/xml',
        'User-Agent': 'Mozilla/5.0 (compatible; ForexNewsAnalyzer/1.0)'
      }
    });
    return await parseRSSContent(response.data);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new RSSError(
        'RSS_FETCH_ERROR',
        'Failed to fetch RSS feed',
        error.message
      );
    }
    throw error;
  }
}

export async function analyzeContent(
  content: string,
  settings: Settings
): Promise<AnalysisResult> {
  const openai = new OpenAI({
    apiKey: settings.apiKey,
    dangerouslyAllowBrowser: true,
  });

  const prompt = `As an expert financial analyst specializing in forex and precious metals markets, analyze this news with extreme precision:

${content}

Consider these critical aspects:

1. Central Bank Policy Impact (40% weight):
   - Direct monetary policy implications
   - Forward guidance signals
   - Interest rate trajectory indicators
   - Balance sheet policy changes
   - Communication tone shifts

2. Economic Data Impact (30% weight):
   - Inflation metrics
   - Employment data
   - GDP implications
   - Trade balance effects
   - Manufacturing/Services PMI

3. Gold Market Dynamics (30% weight):
   - Safe-haven demand drivers
   - Physical market conditions
   - ETF flows
   - Technical levels
   - Correlation breaks with USD

4. Risk Assessment:
   - Market positioning
   - Volatility expectations
   - Geopolitical factors
   - Institutional flows
   - Cross-asset correlations

Provide a detailed analysis in this exact format:

USD_SENTIMENT: [bullish/bearish/neutral]
GOLD_SENTIMENT: [bullish/bearish/neutral]
IMPACT: [high/medium/low]
CONFIDENCE: [0-100]
ANALYSIS: [Precise 2-sentence analysis focusing on key market-moving factors]
KEY_LEVELS_USD: [Support and resistance levels if mentioned]
KEY_LEVELS_GOLD: [Support and resistance levels if mentioned]
TRADE_RECOMMENDATION: [Specific trade idea if confidence > 80]`;

  try {
    const response = await openai.chat.completions.create({
      model: settings.model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 350,
    });

    const analysis = response.choices[0].message.content;
    if (!analysis) throw new Error('No analysis received from OpenAI');

    const lines = analysis.split('\n');
    const usdSentiment = extractValue(lines, 'USD_SENTIMENT');
    const goldSentiment = extractValue(lines, 'GOLD_SENTIMENT');
    const impact = extractValue(lines, 'IMPACT');
    const confidence = extractValue(lines, 'CONFIDENCE');
    const analysisText = extractValue(lines, 'ANALYSIS');
    const keyLevelsUSD = extractValue(lines, 'KEY_LEVELS_USD');
    const keyLevelsGold = extractValue(lines, 'KEY_LEVELS_GOLD');
    const tradeRecommendation = extractValue(lines, 'TRADE_RECOMMENDATION');

    return {
      sentiment: goldSentiment.toLowerCase(),
      impact: validateImpact(impact.toLowerCase()),
      summary: analysisText,
      usdSentiment: usdSentiment.toLowerCase(),
      confidence: parseConfidence(confidence),
      keyLevelsUSD: keyLevelsUSD || null,
      keyLevelsGold: keyLevelsGold || null,
      tradeRecommendation: tradeRecommendation || null
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`OpenAI Analysis failed: ${error.message}`);
    }
    throw error;
  }
}

function extractValue(lines: string[], key: string): string {
  const line = lines.find(l => l.startsWith(`${key}:`));
  return line ? line.split(':')[1].trim() : '';
}

function validateImpact(impact: string): 'high' | 'medium' | 'low' {
  if (['high', 'medium', 'low'].includes(impact)) {
    return impact as 'high' | 'medium' | 'low';
  }
  return 'low';
}

function parseConfidence(confidence: string): number {
  const score = parseInt(confidence, 10);
  return isNaN(score) ? 50 : Math.min(100, Math.max(0, score));
}