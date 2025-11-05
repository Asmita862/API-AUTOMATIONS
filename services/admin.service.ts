// services/admin.service.ts
import { request } from '@playwright/test';
import { LOGIN_MUTATION } from '../graphql/queries';

export class AdminService {
  static async login(email: string, password: string) {
    const requestContext = await request.newContext();
    const response = await requestContext.post(process.env.API_BASE_URL!, {
      data: {
        query: LOGIN_MUTATION,
        variables: {
          input: { email, password },
        },
      },
    });

    const result = await response.json();
    await requestContext.dispose();
    return result;
  }
}
