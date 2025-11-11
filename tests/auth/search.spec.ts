import dotenv from 'dotenv';
dotenv.config(); // <-- load .env variables

import { test, expect } from '@playwright/test';
import { LoginAPI } from '../../pages/auth/login.api';
import { AdminListAPI, GetAdminListInput } from '../../pages/auth/adminlist.api';

test.describe('Admin List API - Search Scenarios', () => {
  let loginAPI: LoginAPI;
  let adminListAPI: AdminListAPI;
  let authToken: string;

  // Environment variables
  const firstName = process.env.ADMIN_FIRSTNAME!;
  const lastName = process.env.ADMIN_LASTNAME!;
  const partialEmail = process.env.ADMIN_EMAIL_PARTIAL!; // e.g., "asmita.aryal"

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

  // ---------------- Search by First Name ----------------
  test('Search by first name', async () => {
    const input: GetAdminListInput = { searchText: firstName, orderBy: '_id', order: 'desc', limit: 5, skip: 0 };
    const res = await adminListAPI.getAdminList(input);
    const list = res.data?.getAdminList?.adminList;

    expect(list).toBeDefined();
    expect(list!.length).toBeGreaterThan(0);
    list!.forEach((admin) => expect(admin.firstName.toLowerCase()).toContain(firstName.toLowerCase()));
  });

  // ---------------- Search by Last Name ----------------
  test('Search by last name', async () => {
    const input: GetAdminListInput = { searchText: lastName, orderBy: '_id', order: 'desc', limit: 5, skip: 0 };
    const res = await adminListAPI.getAdminList(input);
    const list = res.data?.getAdminList?.adminList;

    expect(list).toBeDefined();
    expect(list!.length).toBeGreaterThan(0);
    list!.forEach((admin) => expect(admin.lastName.toLowerCase()).toContain(lastName.toLowerCase()));
  });

  // ---------------- Search by Partial Email ----------------
  test('Search by partial email', async () => {
    const input: GetAdminListInput = { searchText: partialEmail, orderBy: '_id', order: 'desc', limit: 5, skip: 0 };
    const res = await adminListAPI.getAdminList(input);
    const list = res.data?.getAdminList?.adminList;

    expect(list).toBeDefined();
    expect(list!.length).toBeGreaterThan(0);
    list!.forEach((admin) => expect(admin.email.toLowerCase()).toContain(partialEmail.toLowerCase()));
  });
});
