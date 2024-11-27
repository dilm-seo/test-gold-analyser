import React from 'react';
import { NewsItem } from '../types/news';
import { formatDistanceToNow } from 'date-fns';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface NewsCardProps {
  news: NewsItem;
}

export function NewsCard({ news }: NewsCardProps) {
  const getSentimentIcon = () => {
    switch (news.sentiment.toLowerCase()) {
      case 'bullish':
        return <TrendingUp className="w-5 h-5 text-green-500" />;
      case 'bearish':
        return <TrendingDown className="w-5 h-5 text-red-500" />;
      default:
        return <Minus className="w-5 h-5 text-gray-500" />;
    }
  };

  const getImpactColor = () => {
    switch (news.impact) {
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

  return (
    <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">{news.title}</h3>
          <p className="text-sm text-gray-500 mt-1">
            {formatDistanceToNow(new Date(news.pubDate), { addSuffix: true })}
          </p>
        </div>
        {getSentimentIcon()}
      </div>
      
      <p className="mt-2 text-gray-600">{news.description}</p>
      
      <div className="mt-4 flex items-center space-x-2">
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${getImpactColor()}`}
        >
          {news.impact.toUpperCase()} IMPACT
        </span>
        <span className="text-xs text-gray-500">{news.category}</span>
      </div>
      
      <a
        href={news.link}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 text-sm text-blue-600 hover:text-blue-800"
      >
        Read more →
      </a>
    </div>
  );
}