export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}

export interface FetchError extends ApiError {
  status?: number;
}

export type ErrorHandler = (error: Error | ApiError) => void;