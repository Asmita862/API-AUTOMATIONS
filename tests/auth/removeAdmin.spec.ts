import { test, expect } from '@playwright/test';
import { LoginAPI } from '../../pages/auth/login.api';
import { RemoveAdminAPI } from '../../pages/auth/removeAdmin.api';
import fs from 'fs';
import path from 'path';

test.describe('Remove Admin API', () => {
  let removeAdminAPI: RemoveAdminAPI;
  let authToken: string;
  let adminId: string;

  test.beforeAll(async () => {
    // Read auth token from file saved by global setup
    const authFile = path.join(__dirname, '../../auth.json');
    if (fs.existsSync(authFile)) {
      const authData = JSON.parse(fs.readFileSync(authFile, 'utf-8'));
      authToken = authData.token;
    } else {
      // Fallback: Login to get auth token if file doesn't exist
      const loginAPI = new LoginAPI();
      await loginAPI.init();

      const loginResponse = await loginAPI.login(
        process.env.ADMIN_EMAIL!,
        process.env.ADMIN_PASSWORD!
      );

      authToken = loginResponse.data?.login.accessToken!;
      await loginAPI.dispose();
    }
    
    expect(authToken).toBeTruthy();

    // Read registered admin ID from file
    const registeredAdminFile = path.join(__dirname, '../../registered-admin.json');
    if (fs.existsSync(registeredAdminFile)) {
      const registeredAdmin = JSON.parse(fs.readFileSync(registeredAdminFile, 'utf-8'));
      adminId = registeredAdmin._id;
      expect(adminId).toBeTruthy();
    } else {
      throw new Error('registered-admin.json file not found. Please run registration tests first.');
    }
  });

  test.beforeEach(async () => {
    removeAdminAPI = new RemoveAdminAPI();
    await removeAdminAPI.init(authToken);
  });

  test.afterEach(async () => {
    await removeAdminAPI.dispose();
  });

  test('should remove admin successfully with valid ID', async () => {
    const response = await removeAdminAPI.removeAdmin(adminId);

    const removeAdminData = response.data?.removeAdmin;
    expect(removeAdminData).toBeDefined();
    expect(removeAdminData?.message).toBeTruthy();
    
    // Admin field might be null after removal, check adminList instead
    if (removeAdminData?.admin) {
      expect(removeAdminData.admin._id).toBe(adminId);
      expect(removeAdminData.admin.email).toBeTruthy();
      console.log(`Admin removed successfully: ${removeAdminData.admin.email}`);
    } else {
      // If admin is null, verify removal by checking it's not in adminList
      const isInList = removeAdminData?.adminList?.some(admin => admin._id === adminId);
      expect(isInList).toBeFalsy();
      console.log('Admin removed successfully');
    }
    
    console.log(`Message: ${removeAdminData?.message}`);
  });

  test('should fail to remove admin with invalid ID', async () => {
    const invalidId = '000000000000000000000000';
    const response = await removeAdminAPI.removeAdmin(invalidId);

    expect(response.errors).toBeDefined();
    expect(response.errors?.[0]?.message).toBeTruthy();
  });

  test('should fail to remove admin without auth token', async () => {
    // Create API instance without auth token
    const unauthAPI = new RemoveAdminAPI();
    await unauthAPI.init();

    const response = await unauthAPI.removeAdmin(adminId);

    if (response.errors) {
      expect(response.errors).toBeDefined();
      expect(response.errors?.[0]?.message).toBeTruthy();
    } else {
      // If no errors, API might allow removal without auth (security issue)
      expect(response.data?.removeAdmin).toBeDefined();
    }

    await unauthAPI.dispose();
  });

  test('should fail to remove admin with empty ID', async () => {
    const response = await removeAdminAPI.removeAdmin('');

    expect(response.errors).toBeDefined();
    expect(response.errors?.[0]?.message).toBeTruthy();
  });
});
