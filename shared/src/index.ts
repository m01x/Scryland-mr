export interface HealthResponse {
  status: string;
  uptime: number;
  version: string;
}

export interface ApiError {
  statusCode: number;
  message: string | string[];
  error?: string;
  path?: string;
  timestamp?: string;
}
