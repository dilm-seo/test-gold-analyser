import { Settings } from '../types/news';

const STORAGE_KEYS = {
  SETTINGS: 'forex_analyzer_settings',
  CACHE: 'forex_analyzer_cache',
};

export const defaultSettings: Settings = {
  apiKey: '',
  model: 'gpt-4-turbo-preview',
  refreshInterval: 300000, // 5 minutes
};

export const saveSettings = (settings: Settings): void => {
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
};

export const getSettings = (): Settings => {
  const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
  return stored ? { ...defaultSettings, ...JSON.parse(stored) } : defaultSettings;
};