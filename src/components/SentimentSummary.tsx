import React from 'react';
import { NewsItem } from '../types/news';
import { TrendingUp, TrendingDown, Minus, AlertTriangle, Scale } from 'lucide-react';

interface SentimentSummaryProps {
  news: NewsItem[];
}

export function SentimentSummary({ news }: SentimentSummaryProps) {
  const calculateOverallSentiment = () => {
    if (!news.length) return { sentiment: 'neutral', strength: 'low' };

    const sentiments = news.map(item => item.sentiment.toLowerCase());
    const bullishCount = sentiments.filter(s => s === 'bullish').length;
    const bearishCount = sentiments.filter(s => s === 'bearish').length;
    const total = news.length;

    const bullishPercentage = (bullishCount / total) * 100;
    const bearishPercentage = (bearishCount / total) * 100;

    let sentiment = 'neutral';
    let strength = 'low';

    if (bullishPercentage > bearishPercentage) {
      sentiment = 'bullish';
      strength = bullishPercentage > 60 ? 'high' : 'medium';
    } else if (bearishPercentage > bullishPercentage) {
      sentiment = 'bearish';
      strength = bearishPercentage > 60 ? 'high' : 'medium';
    }

    return { sentiment, strength };
  };

  const { sentiment, strength } = calculateOverallSentiment();

  const getSentimentIcon = () => {
    switch (sentiment) {
      case 'bullish':
        return <TrendingUp className="w-8 h-8 text-green-500" />;
      case 'bearish':
        return <TrendingDown className="w-8 h-8 text-red-500" />;
      default:
        return <Minus className="w-8 h-8 text-gray-500" />;
    }
  };

  const getStrengthColor = () => {
    switch (strength) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getBackgroundColor = () => {
    switch (sentiment) {
      case 'bullish':
        return 'bg-green-50';
      case 'bearish':
        return 'bg-red-50';
      default:
        return 'bg-gray-50';
    }
  };

  if (!news.length) return null;

  return (
    <div className={`rounded-lg shadow-sm p-4 mb-8 ${getBackgroundColor()}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Scale className="w-6 h-6 text-yellow-600" />
          <h2 className="text-xl font-semibold">Gold (XAU/USD) Sentiment Analysis</h2>
        </div>
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            {getSentimentIcon()}
            <div>
              <p className="text-sm font-medium text-gray-600">Overall Sentiment</p>
              <p className="text-lg font-semibold capitalize">{sentiment}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-6 h-6 text-orange-500" />
            <div>
              <p className="text-sm font-medium text-gray-600">Signal Strength</p>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStrengthColor()}`}>
                {strength.toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}