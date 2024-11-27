import React from 'react';
import { format } from 'date-fns';
import { TrendingUp, TrendingDown, Minus, DollarSign, Coins, Target } from 'lucide-react';
import { NewsItem } from '../types';

interface NewsCardProps {
  news: NewsItem;
}

export function NewsCard({ news }: NewsCardProps) {
  const renderSentimentIndicator = (sentiment: string, type: 'USD' | 'GOLD') => {
    const Icon = type === 'USD' ? DollarSign : Coins;
    const baseClasses = "flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium";
    
    let colorClasses = "bg-gray-100 text-gray-600";
    if (sentiment === 'bullish') colorClasses = "bg-green-100 text-green-800";
    if (sentiment === 'bearish') colorClasses = "bg-red-100 text-red-800";

    return (
      <div className={`${baseClasses} ${colorClasses}`}>
        <Icon className="w-3 h-3" />
        <span>{sentiment.toUpperCase()}</span>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-2">{news.title}</h3>
          <p className="text-gray-600 text-sm">{news.description}</p>
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          {renderSentimentIndicator(news.usdSentiment || 'neutral', 'USD')}
          {renderSentimentIndicator(news.sentiment, 'GOLD')}
          <div className="flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <Target className="w-3 h-3" />
            <span>Confidence: {news.confidence}%</span>
          </div>
        </div>

        {(news.keyLevelsUSD || news.keyLevelsGold) && (
          <div className="grid grid-cols-2 gap-4 text-sm">
            {news.keyLevelsUSD && (
              <div className="bg-gray-50 p-2 rounded">
                <span className="font-medium">USD Levels:</span> {news.keyLevelsUSD}
              </div>
            )}
            {news.keyLevelsGold && (
              <div className="bg-gray-50 p-2 rounded">
                <span className="font-medium">Gold Levels:</span> {news.keyLevelsGold}
              </div>
            )}
          </div>
        )}

        {news.tradeRecommendation && news.confidence && news.confidence > 80 && (
          <div className="bg-indigo-50 p-3 rounded-md">
            <h4 className="font-medium text-indigo-800 mb-1">High Confidence Trade Idea:</h4>
            <p className="text-sm text-indigo-700">{news.tradeRecommendation}</p>
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              news.impact === 'high' ? 'bg-red-100 text-red-800' :
              news.impact === 'medium' ? 'bg-yellow-100 text-yellow-800' :
              'bg-green-100 text-green-800'
            }`}>
              {news.impact.toUpperCase()}
            </span>
            <span className="text-sm text-gray-500">
              {format(new Date(news.pubDate), 'MMM d, yyyy HH:mm')}
            </span>
          </div>
          <a
            href={news.link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:text-blue-700 text-sm"
          >
            Read More →
          </a>
        </div>
      </div>
    </div>
  );
}