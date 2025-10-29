import { request } from '@playwright/test';

export class GraphQLClient {
  static async send(query: string, variables: Record<string, any> = {}, headers: Record<string, string> = {}) {
    const apiUrl = process.env.API_BASE_URL!;
    const context = await request.newContext();

    const response = await context.post(apiUrl, {
      data: { query, variables },
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    });

    const result = await response.json();
    await context.dispose();
    return result;
  }
}
