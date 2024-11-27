import { ApiError, FetchError } from '../types/errors';

export function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'message' in error
  );
}

export function createFetchError(response: Response): FetchError {
  return {
    code: 'FETCH_ERROR',
    message: `HTTP error ${response.status}`,
    status: response.status,
  };
}

export function handleRSSError(error: unknown): ApiError {
  if (error instanceof Error) {
    return {
      code: 'RSS_ERROR',
      message: 'Failed to fetch news feed',
      details: error.message,
    };
  }
  return {
    code: 'UNKNOWN_ERROR',
    message: 'An unexpected error occurred',
    details: error,
  };
}