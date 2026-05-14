export interface IApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
  timestamp: string;
}

export interface IApiError {
  code: string;
  message: string;
  statusCode: number;
  details?: unknown;
}
