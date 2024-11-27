import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Settings } from '../types';

interface SettingsStore {
  settings: Settings;
  updateSettings: (settings: Partial<Settings>) => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      settings: {
        apiKey: '',
        model: 'gpt-4-turbo-preview',
        refreshInterval: 300000, // 5 minutes
      },
      updateSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        })),
    }),
    {
      name: 'forex-analyzer-settings',
    }
  )
);