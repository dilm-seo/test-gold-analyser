import { create } from 'zustand';
import { NewsItem } from '../types';

interface NewsStore {
  news: NewsItem[];
  isLoading: boolean;
  error: string | null;
  setNews: (news: NewsItem[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useNewsStore = create<NewsStore>((set) => ({
  news: [],
  isLoading: false,
  error: null,
  setNews: (news) => set({ news }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
}));