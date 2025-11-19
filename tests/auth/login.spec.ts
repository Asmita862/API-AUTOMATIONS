import { test, expect } from '@playwright/test';
import { LoginAPI, LoginResponse } from '../../pages/auth/login.api';

//simple helper to add delay
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

test.describe('Admin Login API', () => {
  let loginAPI: LoginAPI;

  test.beforeEach(async () => {
    loginAPI = new LoginAPI();
    await loginAPI.init();
    
    //global wait before each test
    await wait (3000);

  });

  test.afterEach(async () => {
  
    await loginAPI.dispose();
  });

  test('should login successfully with valid credentials', async () => {
    const response = await loginAPI.login(
      process.env.ADMIN_EMAIL!,
      process.env.ADMIN_PASSWORD!
    );

    //log the responses  for debugging
    const loginData = response.data?.login;
    expect(loginData).toBeDefined();
    if (!loginData) return; // Stop TS complaints

    
    expect(loginData).toBeDefined();
    expect(loginData?.accessToken).toBeTruthy();
    expect(loginData?.refreshToken).toBeTruthy();
    expect(loginData?.admin.email).toBe(process.env.ADMIN_EMAIL);
    expect(loginData?.admin._id).toBeTruthy();
  });

  test('should fail login with invalid credentials', async () => {
    const response = await loginAPI.login(
      process.env.ADMIN_EMAIL!,
      process.env.ADMIN_INVALID_PASSWORD!
      );

    
    const error = response.errors?.[0]?.message;

    expect(error).toBeDefined();
    expect(error).toMatch(/invalid|unauthorized|failed|validation/i);
  });


test('should store auth token after successful login', async () => {
    const response: LoginResponse = await loginAPI.login(
      process.env.ADMIN_EMAIL!,
      process.env.ADMIN_PASSWORD!
    );

    const loginData = response.data?.login;
    expect(loginData).toBeDefined();
    if (!loginData) return;

    const token = loginData.accessToken;
    expect(token).toBeTruthy();
    expect(loginAPI.getAuthToken()).toBe(token);
  });
});

