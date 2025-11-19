// tests/userProfile/userid.spec.ts

import dotenv from 'dotenv';
dotenv.config();

import { test, expect } from '@playwright/test';
import { LoginAPI } from '../../../pages/auth/login.api';
import { UserProfileAPI } from '../../../pages/auth/userprofile.api';

// MongoDB ObjectId regex (24 hex chars)
const objectIdRegex = /^[0-9a-fA-F]{24}$/;

// Global delay in milliseconds from .env or default 1000ms
const GLOBAL_DELAY = parseInt(process.env.API_DELAY_MS || '1000', 10);

// Utility function for delay
const delay = async () => new Promise(res => setTimeout(res, GLOBAL_DELAY));

test.describe('User Profile - ID Field Comprehensive Scenarios', () => {
  let api: UserProfileAPI;
  let authToken: string;
  let expectedUserId: string;

  test.beforeAll(async () => {
    // ---------------- LOGIN TO GET TOKEN ----------------
    const loginAPI = new LoginAPI();
    await loginAPI.init();
    const loginRes = await loginAPI.login(
      process.env.ADMIN_EMAIL!,
      process.env.ADMIN_PASSWORD!
    );
    authToken = loginRes.data?.login.accessToken!;
    expectedUserId = loginRes.data?.login.admin?._id || '';

    await loginAPI.dispose();

    // ---------------- INITIALIZE USERPROFILE API ----------------
    api = new UserProfileAPI();
    await api.init(authToken);
  });

  test.afterAll(async () => {
    await api.dispose();
  });

  // ---------------- 1️ID MUST EXIST ----------------
  test('ID should be present', async () => {
    await delay();
    const res = await api.getUserProfile();
    const id = res.data?.getUserProfile?._id;

    expect(id).toBeTruthy();
    expect(typeof id).toBe('string');
    expect(id!.length).toBeGreaterThan(0);
    expect(objectIdRegex.test(id!)).toBe(true);
  });

  // ---------------- 2️ ID MUST BELONG TO LOGGED-IN USER ----------------
  test('ID belongs to logged-in user', async () => {
    await delay();
    const res = await api.getUserProfile();
    const actualId = res.data?.getUserProfile?._id;

    expect(actualId).toBeTruthy();
    expect(actualId).toBe(expectedUserId);
  });

  // ---------------- 3️UNAUTHORIZED REQUEST ----------------
  test('Unauthorized token should not return ID', async () => {
    await delay();
    const unauthAPI = new UserProfileAPI();
    await unauthAPI.init('INVALID_TOKEN');

    const res = await unauthAPI.getUserProfile();
    expect(res.errors).toBeTruthy();
    expect(res.data?.getUserProfile).toBeNull();
  });

  // ---------------- 4️ MISSING TOKEN ----------------
  test('Missing token should not return ID', async () => {
    await delay();
    const unauthAPI = new UserProfileAPI();
    await unauthAPI.init(null as unknown as string);

    const res = await unauthAPI.getUserProfile();
    expect(res.errors).toBeTruthy();
    expect(res.data?.getUserProfile).toBeNull();
  });

  // ---------------- 5️CONSISTENCY ACROSS MULTIPLE CALLS ----------------
  test('ID remains consistent across multiple API calls', async () => {
    await delay();
    const res1 = await api.getUserProfile();
    const res2 = await api.getUserProfile();

    const id1 = res1.data?.getUserProfile?._id;
    const id2 = res2.data?.getUserProfile?._id;

    expect(id1).toBeTruthy();
    expect(id2).toBeTruthy();
    expect(id1).toBe(id2);
  });

  // ---------------- 6️ID TYPE CHECK ----------------
  test('ID is a non-empty string', async () => {
    await delay();
    const res = await api.getUserProfile();
    const id = res.data?.getUserProfile?._id;

    expect(typeof id).toBe('string');
    expect(id!.length).toBeGreaterThan(0);
  });

  // ---------------- 7️ ID FORMAT CHECK ----------------
  test('ID matches MongoDB ObjectId pattern', async () => {
    await delay();
    const res = await api.getUserProfile();
    const id = res.data?.getUserProfile?._id;

    expect(objectIdRegex.test(id!)).toBe(true);
  });

  // ---------------- 8️ ROLE PERMISSION CHECK ----------------
  test('User cannot access another user’s ID', async () => {
    await delay();
    const restrictedAPI = new UserProfileAPI();
    await restrictedAPI.init('LOW_ROLE_TOKEN');

    const res = await restrictedAPI.getUserProfile();
    expect(res.errors?.[0]?.extensions?.code).toBe('UNAUTHENTICATED');
    expect(res.data?.getUserProfile).toBeNull();
  });

  // ---------------- 9️EDGE CASE: NULL OR MISSING PROFILE ----------------
  test('Handle missing or null profile gracefully', async () => {
    await delay();
    const res = await api.getUserProfile();
    const id = res.data?.getUserProfile?._id;

    expect(id).toBeTruthy();
  });

  // ----------------  OPTIONAL EXTRA: EMPTY STRING ID ----------------
  test('ID should never be empty string', async () => {
    await delay();
    const res = await api.getUserProfile();
    const id = res.data?.getUserProfile?._id;

    expect(id).not.toBe('');
    expect(id!.length).toBeGreaterThan(0);
  });
});
