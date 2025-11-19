import { test, expect } from '@playwright/test';
import { LoginAPI } from '../../../pages/auth/login.api';
import { AdminListAPI, GetAdminListInput } from '../../../pages/auth/adminlist.api';

// Helper function to pause execution
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

test.describe('Admin List API - Pagination Scenarios', () => {
  let loginAPI: LoginAPI;
  let adminListAPI: AdminListAPI;
  let authToken: string;

  // ---------------- Setup ----------------
  test.beforeAll(async () => {
    loginAPI = new LoginAPI();
    await loginAPI.init();
    const loginRes = await loginAPI.login(process.env.ADMIN_EMAIL!, process.env.ADMIN_PASSWORD!);

    if (!loginRes?.data?.login?.accessToken) {
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

  // ---------------- Helper Function ----------------
  async function getAdminList(input: GetAdminListInput) {
    const res = await adminListAPI.getAdminList(input);
    return res.data?.getAdminList?.adminList ?? [];
  }

  // ---------------- Pagination Tests ----------------

  test('First page - limit 5, skip 0', async () => {
    const list = await getAdminList({ searchText: '', orderBy: '_id', order: 'desc', limit: 5, skip: 0 });
    expect(list.length).toBeLessThanOrEqual(5);
    await delay(3000);
  });

  test('Second page - limit 5, skip 5', async () => {
    const list = await getAdminList({ searchText: '', orderBy: '_id', order: 'desc', limit: 5, skip: 5 });
    expect(list).toBeInstanceOf(Array);
    await delay(3000);
  });

  test('Page size 10 - first page', async () => {
    const list = await getAdminList({ searchText: '', orderBy: '_id', order: 'desc', limit: 10, skip: 0 });
    expect(list.length).toBeLessThanOrEqual(10);
    await delay(3000);
  });

  test('Last page boundary - skip beyond total', async () => {
    const list = await getAdminList({ searchText: '', orderBy: '_id', order: 'desc', limit: 5, skip: 1000 });
    expect(list.length).toBe(0);
    await delay(3000);
  });

  test('Invalid skip - negative', async () => {
    const list = await getAdminList({ searchText: '', orderBy: '_id', order: 'desc', limit: 5, skip: -5 });
    expect(list.length).toBe(0);
    await delay(3000);
  });

  test('Invalid limit = 0', async () => {
    const list = await getAdminList({ searchText: '', orderBy: '_id', order: 'desc', limit: 0, skip: 0 });
    expect(list.length).toBe(0);
    await delay(3000);
  });

  test('Large limit - 100', async () => {
    const list = await getAdminList({ searchText: '', orderBy: '_id', order: 'desc', limit: 100, skip: 0 });
    expect(list.length).toBeLessThanOrEqual(100);
    await delay(3000);
  });

  test('Limit greater than total admins', async () => {
    const list = await getAdminList({ searchText: '', orderBy: '_id', order: 'desc', limit: 1000, skip: 0 });
    expect(list.length).toBeLessThanOrEqual(1000);
    await delay(3000);
  });

  test('Skip and limit combination', async () => {
    const firstBatch = await getAdminList({ searchText: '', orderBy: '_id', order: 'desc', limit: 5, skip: 0 });
    const secondBatch = await getAdminList({ searchText: '', orderBy: '_id', order: 'desc', limit: 5, skip: 5 });

    // Ensure second batch does not overlap first batch
    const firstIds = firstBatch.map((a) => a._id);
    const secondIds = secondBatch.map((a) => a._id);
    const intersection = firstIds.filter((id) => secondIds.includes(id));
    expect(intersection.length).toBe(0);
    await delay(3000);
  });
});
