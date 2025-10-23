// Proxy-specific Types

export interface ProxyConfig {
  chutesApiToken: string;
  chutesApiUrl: string;
  chutesModel: string;
  port: number;
  debug: boolean;
}

export interface Colors {
  reset: string;
  bright: string;
  dim: string;
  red: string;
  green: string;
  yellow: string;
  blue: string;
  magenta: string;
  cyan: string;
  white: string;
}

export type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'SUCCESS' | 'DEBUG';

export interface HealthCheckResponse {
  status: 'OK';
  service: string;
  backend: string;
  model: string;
  version: string;
}

export interface ModelsResponse {
  object: 'list';
  data: Array<{
    id: string;
    object: 'model';
    created: number;
    owned_by: string;
  }>;
}