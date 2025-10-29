import { APIRequestContext, request } from '@playwright/test';

export class BaseAPI {
  protected baseURL: string;
  protected apiContext?: APIRequestContext;
  protected authToken?: string;

  constructor(baseURL: string = process.env.BASE_URL || '') {
    this.baseURL = baseURL;
  }

  async init(token?: string) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      this.authToken = token;
    }

    this.apiContext = await request.newContext({
      extraHTTPHeaders: headers,
    });
  }

  async dispose() {
    await this.apiContext?.dispose();
  }

  setAuthToken(token: string) {
    this.authToken = token;
  }

  getAuthToken(): string | undefined {
    return this.authToken;
  }

  protected async post(url: string, data: any) {
    if (!this.apiContext) {
      throw new Error('API context not initialized. Call init() first.');
    }
    // Use full URL if it starts with http, otherwise append to baseURL
    const fullUrl = url.startsWith('http') ? url : this.baseURL;
    return await this.apiContext.post(fullUrl, { data });
  }

  protected async get(url: string) {
    if (!this.apiContext) {
      throw new Error('API context not initialized. Call init() first.');
    }
    // Use full URL if it starts with http, otherwise append to baseURL
    const fullUrl = url.startsWith('http') ? url : this.baseURL;
    return await this.apiContext.get(fullUrl);
  }
}
