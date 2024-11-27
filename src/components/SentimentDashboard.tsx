import React from 'react';
import { TrendingUp, TrendingDown, Minus, DollarSign, Coins } from 'lucide-react';
import { MarketSentiment } from '../types/analysis';

interface SentimentDashboardProps {
  usdSentiment: MarketSentiment;
  goldSentiment: MarketSentiment;
}

export function SentimentDashboard({ usdSentiment, goldSentiment }: SentimentDashboardProps) {
  const renderSentimentCard = (data: MarketSentiment) => {
    const getSentimentIcon = () => {
      switch (data.sentiment) {
        case 'bullish':
          return <TrendingUp className="w-6 h-6 text-green-500" />;
        case 'bearish':
          return <TrendingDown className="w-6 h-6 text-red-500" />;
        default:
          return <Minus className="w-6 h-6 text-gray-500" />;
      }
    };

    const getSentimentColor = () => {
      switch (data.sentiment) {
        case 'bullish':
          return 'bg-green-50 border-green-200';
        case 'bearish':
          return 'bg-red-50 border-red-200';
        default:
          return 'bg-gray-50 border-gray-200';
      }
    };

    return (
      <div className={`rounded-lg border p-4 ${getSentimentColor()}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            {data.asset === 'USD' ? (
              <DollarSign className="w-6 h-6 text-blue-500" />
            ) : (
              <Coins className="w-6 h-6 text-yellow-500" />
            )}
            <h3 className="text-lg font-semibold">{data.asset}</h3>
          </div>
          {getSentimentIcon()}
        </div>

        <div className="space-y-3">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium text-gray-700">Confidence</span>
              <span className="text-sm font-semibold">{data.confidence}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 rounded-full h-2"
                style={{ width: `${data.confidence}%` }}
              />
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Key Factors</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              {data.keyFactors.map((factor, index) => (
                <li key={index} className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>{factor}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-2 gap-4 mb-6">
      {renderSentimentCard(usdSentiment)}
      {renderSentimentCard(goldSentiment)}
    </div>
  );
}