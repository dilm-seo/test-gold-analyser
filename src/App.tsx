import React, { useEffect, useCallback } from 'react';
import { useSettingsStore } from './store/settingsStore';
import { useNewsStore } from './store/newsStore';
import { fetchRSSFeed, analyzeContent } from './services/api';
import { analyzeMarketSentiment } from './services/sentimentAnalyzer';
import { SentimentDashboard } from './components/SentimentDashboard';
import { NewsCard } from './components/NewsCard';
import { SettingsPanel } from './components/SettingsPanel';
import { Play, Loader2 } from 'lucide-react';

function App() {
  const { settings } = useSettingsStore();
  const { news, isLoading, error, setNews, setLoading, setError } = useNewsStore();
  const [marketAnalysis, setMarketAnalysis] = React.useState(null);

  const fetchAndAnalyzeNews = useCallback(async () => {
    if (!settings.apiKey) {
      setError('Please configure your OpenAI API key in settings');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const items = await fetchRSSFeed();
      const analyzedNews = await Promise.all(
        items.map(async (item) => {
          const analysis = await analyzeContent(
            `${item.title}\n${item.description}`,
            settings
          );
          
          return {
            ...item,
            ...analysis,
          };
        })
      );

      setNews(analyzedNews);
      const analysis = analyzeMarketSentiment(analyzedNews);
      setMarketAnalysis(analysis);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [settings, setNews, setLoading, setError]);

  useEffect(() => {
    if (settings.apiKey) {
      fetchAndAnalyzeNews();
      const interval = setInterval(fetchAndAnalyzeNews, settings.refreshInterval);
      return () => clearInterval(interval);
    }
  }, [settings.apiKey, settings.refreshInterval, fetchAndAnalyzeNews]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">
              Forex News Analyzer
            </h1>
            <div className="flex items-center space-x-4">
              <button
                onClick={fetchAndAnalyzeNews}
                disabled={isLoading || !settings.apiKey}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                ) : (
                  <Play className="w-5 h-5 mr-2" />
                )}
                {isLoading ? 'Analyzing...' : 'Analyze News'}
              </button>
              <SettingsPanel />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {marketAnalysis && (
          <SentimentDashboard
            usdSentiment={marketAnalysis.usdSentiment}
            goldSentiment={marketAnalysis.goldSentiment}
          />
        )}

        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-6">
          {news.map((item, index) => (
            <NewsCard key={index} news={item} />
          ))}
        </div>

        {!settings.apiKey && (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Welcome to Forex News Analyzer
            </h3>
            <p className="text-gray-500">
              Please configure your OpenAI API key in the settings to start analyzing news.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;