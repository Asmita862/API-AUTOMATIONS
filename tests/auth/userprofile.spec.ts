import dotenv from 'dotenv';
dotenv.config();

import { test, expect } from '@playwright/test';
import { LoginAPI } from '../../pages/auth/login.api';
import { UserProfileAPI, UserProfile } from '../../pages/auth/userprofile.api';

// Simple email format validation
const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

test.describe('User Profile API - Comprehensive Scenarios', () => {
  let loginAPI: LoginAPI;
  let userProfileAPI: UserProfileAPI;
  let authToken: string;

  // ---------------- Setup ----------------
  test.beforeAll(async () => {
    loginAPI = new LoginAPI();
    await loginAPI.init();

    const loginRes = await loginAPI.login(process.env.ADMIN_EMAIL!, process.env.ADMIN_PASSWORD!);
    if (!loginRes?.data?.login?.accessToken) {
      console.error('Login failed:', JSON.stringify(loginRes, null, 2));
      throw new Error('Login failed: token not received');
    }

    authToken = loginRes.data.login.accessToken!;
    await loginAPI.dispose();

    userProfileAPI = new UserProfileAPI();
    await userProfileAPI.init(authToken);
  });

  test.afterAll(async () => {
    await userProfileAPI.dispose();
  });

  //  Add delay automatically after every test
  test.afterEach(async () => {
    await new Promise(r => setTimeout(r, 2000)); // 2s delay
  });

  // ---------------- 1. Successful fetch ----------------
  test('Fetch user profile successfully', async () => {
    const res = await userProfileAPI.getUserProfile();
    const profile = res.data?.getUserProfile;

    expect(profile).toBeDefined();
    expect(profile?._id).toBeTruthy();
    expect(profile?.email).toBe(process.env.ADMIN_EMAIL!);
  });

  // ---------------- 2. Required fields exist ----------------
  test('Profile contains all required fields', async () => {
    const res = await userProfileAPI.getUserProfile();
    const profile = res.data?.getUserProfile;

    const requiredFields = [
      '_id',
      'createdAt',
      'updatedAt',
      'firstName',
      'lastName',
      'email',
      'role',
      'status',
      'enabled2FA',
    ];

    for (const field of requiredFields) {
      expect(profile).toHaveProperty(field);
      expect((profile as any)[field]).not.toBeNull();
    }
  });

  // ---------------- 3. Optional fields check ----------------
  test('Profile contains optional fields if available', async () => {
    const res = await userProfileAPI.getUserProfile();
    const profile = res.data?.getUserProfile;

    expect(profile).toHaveProperty('phone');
    expect(profile).toHaveProperty('profileImage');
    expect(profile).toHaveProperty('profileImageUrl');
  });

  // ---------------- 4. Unauthorized token behavior ----------------
  test('Fetch user profile with invalid token returns null & errors', async () => {
    const invalidAPI = new UserProfileAPI();
    await invalidAPI.init('invalid-token');

    const res = await invalidAPI.getUserProfile();

    expect(res.errors).toBeDefined();
    expect(res.data?.getUserProfile).toBeNull();

    const message = res.errors?.[0]?.message ?? '';
    expect(message.toLowerCase()).toContain('unauthorized');
  });

  // ---------------- 5. Email format validation ----------------
  test('Email field is in valid format', async () => {
    const res = await userProfileAPI.getUserProfile();
    const email = res.data?.getUserProfile?.email ?? '';

    expect(isValidEmail(email)).toBeTruthy();
  });

  // ---------------- 6. Boolean field validation ----------------
  test('enabled2FA field should be boolean', async () => {
    const res = await userProfileAPI.getUserProfile();
    const value = res.data?.getUserProfile?.enabled2FA;

    expect(typeof value === 'boolean' || value === null).toBeTruthy();
  });

  // ---------------- 7. Role and status value checks ----------------
  test('Role and status should have valid string values', async () => {
    const res = await userProfileAPI.getUserProfile();
    const { role, status } = res.data?.getUserProfile ?? {};

    expect(typeof role).toBe('string');
    expect(role?.length).toBeGreaterThan(0);

    expect(typeof status).toBe('string');
    expect(status?.length).toBeGreaterThan(0);
  });

  // ---------------- 8. Consistency check (two calls) ----------------
  test('Profile data remains consistent across multiple calls', async () => {
    const res1 = await userProfileAPI.getUserProfile();
    const res2 = await userProfileAPI.getUserProfile();

    const profile1 = res1.data?.getUserProfile;
    const profile2 = res2.data?.getUserProfile;

    expect(profile1?._id).toBe(profile2?._id);
    expect(profile1?.email).toBe(profile2?.email);
    expect(profile1?.role).toBe(profile2?.role);
  });
});
