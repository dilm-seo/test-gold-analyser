import OpenAI from 'openai';
import { AnalysisResult, NewsItem } from '../types/news';
import { ApiError } from '../types/errors';

export async function analyzeNews(
  apiKey: string,
  model: string,
  newsItem: NewsItem
): Promise<AnalysisResult> {
  if (!apiKey) {
    throw {
      code: 'MISSING_API_KEY',
      message: 'OpenAI API key is required',
    } as ApiError;
  }

  const openai = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });

  const prompt = `Analyze this forex news article:
Title: ${newsItem.title}
Description: ${newsItem.description}

Please provide:
1. Sentiment analysis regarding XAU/USD (bullish/bearish/neutral)
2. Impact level (high/medium/low)
3. Brief summary focusing on central bank implications

Format: JSON with keys "sentiment", "impact", and "summary"`;

  try {
    const response = await openai.chat.completions.create({
      model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
    });

    const content = response.choices[0]?.message?.content;
    
    if (!content) {
      throw {
        code: 'EMPTY_RESPONSE',
        message: 'OpenAI returned empty response',
      } as ApiError;
    }

    try {
      const result = JSON.parse(content);
      return {
        sentiment: result.sentiment || 'neutral',
        impact: result.impact || 'low',
        summary: result.summary || 'No analysis available',
      };
    } catch (parseError) {
      throw {
        code: 'INVALID_RESPONSE',
        message: 'Failed to parse OpenAI response',
        details: parseError,
      } as ApiError;
    }
  } catch (error) {
    if (error instanceof Error) {
      throw {
        code: 'OPENAI_ERROR',
        message: 'OpenAI analysis failed',
        details: error.message,
      } as ApiError;
    }
    throw error;
  }
}