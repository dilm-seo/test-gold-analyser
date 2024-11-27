export interface ApiError extends Error {
  code: string;
  message: string;
  details?: string;
}

export class RSSError extends Error implements ApiError {
  code: string;
  details?: string;

  constructor(code: string, message: string, details?: string) {
    super(message);
    this.code = code;
    this.details = details;
    this.name = 'RSSError';
  }
}