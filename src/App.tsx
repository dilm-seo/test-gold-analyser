import React, { useState, useEffect, useCallback } from 'react';
import { NewsItem, Settings } from './types/news';
import { ApiError } from './types/errors';
import { fetchRSSFeed } from './services/rssService';
import { analyzeNews } from './services/openaiService';
import { NewsCard } from './components/NewsCard';
import { SettingsPanel } from './components/SettingsPanel';
import { ErrorMessage } from './components/ErrorMessage';
import { SentimentSummary } from './components/SentimentSummary';
import { getSettings, saveSettings } from './utils/storage';
import { Play, Pause, RefreshCw } from 'lucide-react';

function App() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [settings, setSettings] = useState<Settings>(getSettings());
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isAutoRefresh, setIsAutoRefresh] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const fetchAndAnalyzeNews = useCallback(async () => {
    if (!settings.apiKey) {
      setError({
        code: 'MISSING_API_KEY',
        message: 'Please configure your OpenAI API key in settings',
      });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const newsItems = await fetchRSSFeed();
      setIsAnalyzing(true);

      const analyzedNews = await Promise.all(
        newsItems.map(async (item) => {
          try {
            const analysis = await analyzeNews(
              settings.apiKey,
              settings.model,
              item
            );
            return { ...item, ...analysis };
          } catch (error) {
            console.error('Analysis error for item:', error);
            return item;
          }
        })
      );

      setNews(analyzedNews);
    } catch (error) {
      setError(
        error as ApiError || {
          code: 'UNKNOWN_ERROR',
          message: 'An unexpected error occurred',
        }
      );
    } finally {
      setLoading(false);
      setIsAnalyzing(false);
    }
  }, [settings]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAutoRefresh && !error) {
      interval = setInterval(fetchAndAnalyzeNews, settings.refreshInterval);
    }
    return () => clearInterval(interval);
  }, [isAutoRefresh, settings.refreshInterval, fetchAndAnalyzeNews, error]);

  const handleSettingsSave = (newSettings: Settings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            ForexLive News Analyzer
          </h1>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsAutoRefresh(!isAutoRefresh)}
              className={`p-2 rounded-md ${
                isAutoRefresh
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              {isAutoRefresh ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </button>
            <button
              onClick={fetchAndAnalyzeNews}
              disabled={loading || isAnalyzing}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Refreshing...' : 'Refresh'}</span>
            </button>
            <SettingsPanel settings={settings} onSave={handleSettingsSave} />
          </div>
        </div>

        {error && (
          <div className="mb-8">
            <ErrorMessage
              title={error.code}
              message={error.message}
              onRetry={fetchAndAnalyzeNews}
            />
          </div>
        )}

        {news.length > 0 && <SentimentSummary news={news} />}

        {!error && news.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-gray-500">
              Click the refresh button to start analyzing news
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {news.map((item, index) => (
            <NewsCard key={index} news={item} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;