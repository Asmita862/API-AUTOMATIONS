// global-setup.ts
import { request } from '@playwright/test';
import * as dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { LOGIN_MUTATION } from './graphql/queries';

dotenv.config();

async function globalSetup() {
  const requestContext = await request.newContext();

  const response = await requestContext.post(process.env.BASE_URL!, {
    data: {
      query: LOGIN_MUTATION,
      variables: {
        input: {
          email: process.env.ADMIN_EMAIL,
          password: process.env.ADMIN_PASSWORD,
          browser: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
        },
      },
    },
  });

  const result = await response.json();
  console.log('Global setup response:', JSON.stringify(result, null, 2));
  const token = result.data?.login?.accessToken;

  if (!token) {
    console.error('Failed to get token. Response:', result);
    throw new Error('Failed to retrieve auth token during global setup.');
  }

  // Save the token to a file
  const authFile = path.join(__dirname, 'auth.json');
  fs.writeFileSync(authFile, JSON.stringify({ token }, null, 2));

  console.log('Global auth token saved.');
  await requestContext.dispose();
}

export default globalSetup;
