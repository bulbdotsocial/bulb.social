/**
 * Service API de base avec configuration centralisée
 */

import { API_BASE_URL, TIMEOUTS, ERROR_MESSAGES } from '../utils/constants';
import { APIResponse } from '../types';

export interface RequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: unknown;
  timeout?: number;
  retry?: number;
  retryDelay?: number;
}

export class APIError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'APIError';
  }
}

/**
 * Classe de base pour tous les services API
 */
export class BaseAPIService {
  protected baseURL: string;
  protected defaultHeaders: Record<string, string>;
  protected defaultTimeout: number;

  constructor(baseURL = API_BASE_URL) {
    this.baseURL = baseURL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
    this.defaultTimeout = TIMEOUTS.REQUEST_TIMEOUT;
  }

  /**
   * Effectue une requête HTTP avec gestion d'erreurs et retry
   */
  protected async request<T = unknown>(
    endpoint: string,
    config: RequestConfig = {}
  ): Promise<T> {
    const {
      method = 'GET',
      headers = {},
      body,
      timeout = this.defaultTimeout,
      retry = 3,
      retryDelay = 1000,
    } = config;

    const url = `${this.baseURL}${endpoint}`;
    const requestHeaders = { ...this.defaultHeaders, ...headers };

    // Configuration de la requête
    const requestConfig: RequestInit = {
      method,
      headers: requestHeaders,
      mode: 'cors',
      credentials: 'omit',
    };

    // Ajouter le body si nécessaire
    if (body && method !== 'GET') {
      if (body instanceof FormData) {
        // Pour FormData, ne pas définir Content-Type (laisse le navigateur le faire)
        delete requestConfig.headers!['Content-Type'];
        requestConfig.body = body;
      } else {
        requestConfig.body = JSON.stringify(body);
      }
    }

    // Fonction de retry avec backoff exponentiel
    const executeRequest = async (attempt: number): Promise<T> => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      try {
        const response = await fetch(url, {
          ...requestConfig,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        // Vérifier le statut de la réponse
        if (!response.ok) {
          await this.handleErrorResponse(response);
        }

        // Traiter la réponse selon le type de contenu
        const contentType = response.headers.get('content-type');
        if (contentType?.includes('application/json')) {
          return await response.json();
        } else {
          return (await response.text()) as unknown as T;
        }
      } catch (error) {
        clearTimeout(timeoutId);

        // Gérer les erreurs d'abort (timeout)
        if (error instanceof Error && error.name === 'AbortError') {
          throw new APIError('Request timeout', 408, 'TIMEOUT');
        }

        // Gérer les erreurs réseau
        if (error instanceof Error && error.message.includes('fetch')) {
          if (attempt < retry) {
            console.warn(`Request failed, retrying... (${attempt}/${retry})`);
            await this.delay(retryDelay * Math.pow(2, attempt - 1)); // Backoff exponentiel
            return executeRequest(attempt + 1);
          }
          throw new APIError(ERROR_MESSAGES.NETWORK_ERROR, 0, 'NETWORK_ERROR');
        }

        throw error;
      }
    };

    return executeRequest(1);
  }

  /**
   * Gère les réponses d'erreur HTTP
   */
  private async handleErrorResponse(response: Response): Promise<never> {
    let errorMessage = ERROR_MESSAGES.UNKNOWN_ERROR;
    let errorCode = 'UNKNOWN_ERROR';
    let errorDetails: unknown;

    try {
      const contentType = response.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
        errorCode = errorData.code || errorCode;
        errorDetails = errorData.details;
      } else {
        errorMessage = await response.text() || errorMessage;
      }
    } catch {
      // Si on ne peut pas lire le body, utiliser le status text
      errorMessage = response.statusText || errorMessage;
    }

    // Messages d'erreur spécifiques selon le code de statut
    switch (response.status) {
      case 400:
        errorMessage = ERROR_MESSAGES.VALIDATION_ERROR;
        errorCode = 'VALIDATION_ERROR';
        break;
      case 401:
        errorMessage = ERROR_MESSAGES.UNAUTHORIZED;
        errorCode = 'UNAUTHORIZED';
        break;
      case 403:
        errorMessage = ERROR_MESSAGES.FORBIDDEN;
        errorCode = 'FORBIDDEN';
        break;
      case 404:
        errorMessage = ERROR_MESSAGES.NOT_FOUND;
        errorCode = 'NOT_FOUND';
        break;
      case 500:
      case 502:
      case 503:
      case 504:
        errorMessage = 'Erreur serveur, veuillez réessayer plus tard';
        errorCode = 'SERVER_ERROR';
        break;
    }

    throw new APIError(errorMessage, response.status, errorCode, errorDetails);
  }

  /**
   * Utilitaire pour attendre
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Méthodes de convenance pour les différents types de requêtes
   */
  protected async get<T>(endpoint: string, config?: Omit<RequestConfig, 'method'>): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: 'GET' });
  }

  protected async post<T>(endpoint: string, body?: unknown, config?: Omit<RequestConfig, 'method' | 'body'>): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: 'POST', body });
  }

  protected async put<T>(endpoint: string, body?: unknown, config?: Omit<RequestConfig, 'method' | 'body'>): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: 'PUT', body });
  }

  protected async patch<T>(endpoint: string, body?: unknown, config?: Omit<RequestConfig, 'method' | 'body'>): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: 'PATCH', body });
  }

  protected async delete<T>(endpoint: string, config?: Omit<RequestConfig, 'method'>): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: 'DELETE' });
  }

  /**
   * Upload de fichier avec progression
   */
  protected async upload<T>(
    endpoint: string,
    file: File,
    additionalData?: Record<string, string>,
    onProgress?: (progress: number) => void
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append('file', file);
      
      // Ajouter des données supplémentaires si fournies
      if (additionalData) {
        Object.entries(additionalData).forEach(([key, value]) => {
          formData.append(key, value);
        });
      }

      const xhr = new XMLHttpRequest();

      // Gérer la progression
      if (onProgress) {
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const progress = (event.loaded / event.total) * 100;
            onProgress(progress);
          }
        });
      }

      // Gérer la fin de l'upload
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } catch {
            resolve(xhr.responseText as unknown as T);
          }
        } else {
          reject(new APIError(
            `Upload failed: ${xhr.statusText}`,
            xhr.status,
            'UPLOAD_ERROR'
          ));
        }
      });

      // Gérer les erreurs
      xhr.addEventListener('error', () => {
        reject(new APIError(ERROR_MESSAGES.UPLOAD_FAILED, 0, 'UPLOAD_ERROR'));
      });

      // Gérer le timeout
      xhr.timeout = this.defaultTimeout;
      xhr.addEventListener('timeout', () => {
        reject(new APIError('Upload timeout', 408, 'TIMEOUT'));
      });

      // Démarrer l'upload
      xhr.open('POST', `${this.baseURL}${endpoint}`);
      xhr.send(formData);
    });
  }
}
