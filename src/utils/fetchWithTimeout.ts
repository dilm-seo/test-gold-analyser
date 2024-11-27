import { ApiError } from '../types/errors';

interface FetchOptions extends RequestInit {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

export async function fetchWithTimeout(
  url: string,
  options: FetchOptions = {}
): Promise<Response> {
  const { 
    timeout = 5000, 
    retries = 2,
    retryDelay = 1000,
    ...fetchOptions 
  } = options;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
      });

      if (!response.ok) {
        throw {
          code: 'FETCH_ERROR',
          message: `HTTP error ${response.status}`,
          status: response.status,
        } as ApiError;
      }

      return response;
    } catch (error) {
      lastError = error as Error;
      
      if (error instanceof Error && error.name === 'AbortError') {
        throw {
          code: 'TIMEOUT_ERROR',
          message: 'Request timed out',
          details: error.message,
        } as ApiError;
      }

      if (attempt < retries) {
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        continue;
      }
    } finally {
      clearTimeout(timeoutId);
    }
  }

  throw {
    code: 'FETCH_FAILED',
    message: 'All fetch attempts failed',
    details: lastError?.message,
  } as ApiError;
}