import dotenv from 'dotenv';
dotenv.config();

import { test, expect } from '@playwright/test';
import { LoginAPI } from '../../pages/auth/login.api';
import { AdminListAPI, GetAdminListInput } from '../../pages/auth/adminlist.api';

// Utility function to wait for a few seconds
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to check if list is sorted
const isSorted = (list: any[], field: string, ascending: boolean = true) => {
  for (let i = 0; i < list.length - 1; i++) {
    const a = String((list[i] as any)[field]);
    const b = String((list[i + 1] as any)[field]);
    if (ascending) {
      if (a.localeCompare(b) > 0) return false;
    } else {
      if (a.localeCompare(b) < 0) return false;
    }
  }
  return true;
};

test.describe('Admin List API - Sorting Scenarios', () => {
  let loginAPI: LoginAPI;
  let adminListAPI: AdminListAPI;
  let authToken: string;

  test.beforeAll(async () => {
    loginAPI = new LoginAPI();
    await loginAPI.init();
    const loginRes = await loginAPI.login(process.env.ADMIN_EMAIL!, process.env.ADMIN_PASSWORD!);

    if (!loginRes?.data?.login?.accessToken) {
      console.error('Login failed:', JSON.stringify(loginRes, null, 2));
      throw new Error('Login failed, authToken not received');
    }
    authToken = loginRes.data.login.accessToken!;
    await loginAPI.dispose();

    adminListAPI = new AdminListAPI();
    await adminListAPI.init(authToken);
  });

  test.afterAll(async () => {
    await adminListAPI.dispose();
  });

  const fields = ['_id', 'firstName', 'lastName'];

  // ---------------- Ascending Sort ----------------
  for (const field of fields) {
    test(`Sort ascending by ${field}`, async () => {
      const input: GetAdminListInput = { orderBy: field, order: 'asc', limit: 10, skip: 0 };
      const res = await adminListAPI.getAdminList(input);
      const list = res.data?.getAdminList?.adminList;

      expect(list).toBeDefined();
      expect(list!.length).toBeGreaterThan(0);
      expect(isSorted(list!, field, true)).toBeTruthy();

      await wait(3000); // 3 sec delay after this scenario
    });
  }

  // ---------------- Descending Sort ----------------
  for (const field of fields) {
    test(`Sort descending by ${field}`, async () => {
      const input: GetAdminListInput = { orderBy: field, order: 'desc', limit: 10, skip: 0 };
      const res = await adminListAPI.getAdminList(input);
      const list = res.data?.getAdminList?.adminList;

      expect(list).toBeDefined();
      expect(list!.length).toBeGreaterThan(0);
      expect(isSorted(list!, field, false)).toBeTruthy();

      await wait(3000); // 3 sec delay after this scenario
    });
  }

  // ---------------- Invalid order value ----------------
  test('Sort with invalid order value returns array', async () => {
    const input: GetAdminListInput = { orderBy: '_id', order: 'invalid' as any, limit: 5, skip: 0 };
    const res = await adminListAPI.getAdminList(input);
    const list = res.data?.getAdminList?.adminList;

    expect(list).toBeDefined();
    expect(Array.isArray(list)).toBeTruthy();

    await wait(3000);
  });

  // ---------------- Invalid orderBy field ----------------
  test('Sort with invalid orderBy field returns array', async () => {
    const input: GetAdminListInput = { orderBy: 'invalidField' as any, order: 'asc', limit: 5, skip: 0 };
    const res = await adminListAPI.getAdminList(input);
    const list = res.data?.getAdminList?.adminList;

    expect(list).toBeDefined();
    expect(Array.isArray(list)).toBeTruthy();

    await wait(3000);
  });

  // ---------------- Limit and Skip ----------------
  test('Limit and skip work correctly', async () => {
    const input: GetAdminListInput = { orderBy: '_id', order: 'asc', limit: 2, skip: 1 };
    const res = await adminListAPI.getAdminList(input);
    const list = res.data?.getAdminList?.adminList;

    expect(list).toBeDefined();
    expect(list!.length).toBeLessThanOrEqual(2);

    await wait(3000);
  });
});
