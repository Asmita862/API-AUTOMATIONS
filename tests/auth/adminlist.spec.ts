import { test, expect } from '@playwright/test';
import { LoginAPI } from '../../pages/auth/login.api';
import { AdminListAPI, GetAdminListInput, Admin } from '../../pages/auth/adminlist.api';

test.describe('Admin List API', () => {
  let loginAPI: LoginAPI;
  let adminListAPI: AdminListAPI;
  let authToken: string;

  test.beforeAll(async () => {
    loginAPI = new LoginAPI();
    await loginAPI.init();

    const loginRes = await loginAPI.login(
      process.env.ADMIN_EMAIL!,
      process.env.ADMIN_PASSWORD!
    );

    authToken = loginRes.data?.login.accessToken!;
    expect(authToken).toBeTruthy();

    await loginAPI.dispose();

    adminListAPI = new AdminListAPI();
    await adminListAPI.init(authToken);
  });

  test.afterAll(async () => {
    await adminListAPI.dispose();
  });

  test('should fetch admin list successfully', async () => {
    const input: GetAdminListInput = {
      searchText: 'asmita',
      orderBy: 'desc',
      order: '',
      limit: 5,
      skip: 0,
    };

    const response = await adminListAPI.getAdminList(input);
    const adminList = response.data?.getAdminList.adminList;

    expect(response.data?.getAdminList).toBeDefined();
    expect(adminList).toBeInstanceOf(Array);
    expect(adminList?.length).toBeLessThanOrEqual(5);

    console.log('Full API response:', JSON.stringify(response, null, 2));

    if (adminList && adminList.length > 0) {
      adminList.forEach((admin: Admin) => {
        expect(admin._id).toBeTruthy();
        expect(admin.email).toBeTruthy();
        console.log(`Admin: ${admin.firstName} ${admin.lastName} - ${admin.email}`);
      });
    }
  });

  test('should return empty array if searchText does not match', async () => {
    const input: GetAdminListInput = {
      searchText: 'nonexistentuser',
      orderBy: 'desc',
      order: '',
      limit: 5,
      skip: 0,
    };

    const response = await adminListAPI.getAdminList(input);
    expect(response.data?.getAdminList.adminList?.length).toBe(0);
  });
});
