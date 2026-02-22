// Runtime configuration support
// Allows deployment-time configuration injection
declare global {
  interface Window {
    APP_CONFIG?: {
      apiUrl?: string;
    };
  }
}

export const API_CONFIG = {
  // Gets the api endpoint from a few different places
  // * The window.APP_CONFIG object if it's set. This is from a generated file when it's deployed
  // * The VITE_API_BASE_URL if it's set
  // * Otherwise a default value
  baseUrl: (window.APP_CONFIG?.apiUrl && !window.APP_CONFIG.apiUrl.includes('__RUNTIME_API_URL__'))
    ? window.APP_CONFIG.apiUrl
    : (import.meta.env.VITE_API_BASE_URL || 'https://api.kmnlp.element84.com'),
  timeout: 30000, // 30 seconds
} as const;

export const ENVIRONMENT = {
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  userId: import.meta.env.VITE_USER_ID, // User ID for local development
} as const;
