import { test, expect } from '@playwright/test';
import { LoginAPI } from '../../../pages/auth/login.api';
import { AdminListAPI, GetAdminListInput } from '../../../pages/auth/adminlist.api';

test.describe('Admin List API - OrderBy Field Scenarios', () => {
  let loginAPI: LoginAPI;
  let adminListAPI: AdminListAPI;
  let authToken: string;

  test.beforeAll(async () => {
    loginAPI = new LoginAPI();
    await loginAPI.init();
    const loginRes = await loginAPI.login(process.env.ADMIN_EMAIL!, process.env.ADMIN_PASSWORD!);
    authToken = loginRes.data?.login.accessToken!;
    await loginAPI.dispose();

    adminListAPI = new AdminListAPI();
    await adminListAPI.init(authToken);
  });

  test.afterAll(async () => {
    await adminListAPI.dispose();
  });

  const fields = ['_id', 'firstName', 'lastName', 'email'];

  // Order by ascending and descending for each field with 3-sec delay
  fields.forEach((field) => {
    test(`OrderBy field: ${field} ascending`, async () => {
      const input: GetAdminListInput = { searchText: '', orderBy: field, order: 'asc', limit: 5, skip: 0 };
      const res = await adminListAPI.getAdminList(input);
      const list = res.data?.getAdminList?.adminList || [];
      
      expect(list).toBeInstanceOf(Array);

      for (let i = 0; i < list.length - 1; i++) {
        const a = String((list[i] as any)[field]);
        const b = String((list[i + 1] as any)[field]);
        expect(a <= b).toBeTruthy();
      }

      // 3-second delay
      await new Promise((r) => setTimeout(r, 3000));
    });

    test(`OrderBy field: ${field} descending`, async () => {
      const input: GetAdminListInput = { searchText: '', orderBy: field, order: 'desc', limit: 5, skip: 0 };
      const res = await adminListAPI.getAdminList(input);
      const list = res.data?.getAdminList?.adminList || [];
      
      expect(list).toBeInstanceOf(Array);

      for (let i = 0; i < list.length - 1; i++) {
        const a = String((list[i] as any)[field]);
        const b = String((list[i + 1] as any)[field]);
        expect(a >= b).toBeTruthy();
      }

      // 3-second delay
      await new Promise((r) => setTimeout(r, 3000));
    });
  });

  // Invalid OrderBy
  test('Invalid OrderBy field', async () => {
    const input: GetAdminListInput = { searchText: '', orderBy: 'invalidField', order: 'asc', limit: 5, skip: 0 };
    const res = await adminListAPI.getAdminList(input);
    const list = res.data?.getAdminList?.adminList || [];
    expect(list).toBeInstanceOf(Array);

    // 3-second delay
    await new Promise((r) => setTimeout(r, 3000));
  });
});
