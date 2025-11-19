//Load environment variables from .env file
import dotenv from 'dotenv';
dotenv.config();

// import playwright test runner
import { test, expect } from '@playwright/test';

//import API page objects.
import { LoginAPI } from '../../../pages/auth/login.api';
import { UserProfileAPI, UserProfile } from '../../../pages/auth/userprofile.api';

// Simple email format validation
const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

test.describe('User Profile API - Comprehensive Scenarios', () => {

  //Declare resuable objects and variables
  let loginAPI: LoginAPI;
  let userProfileAPI: UserProfileAPI;
  let authToken: string;

  //--------------- Before ALL: this runs once before all test cases---------------- //

  test.beforeAll(async () => {

    //create login  API instance
    loginAPI = new LoginAPI();
    await loginAPI.init();  

    //login using admin credentails from .env
    const loginRes = await loginAPI.login(process.env.ADMIN_EMAIL!, process.env.ADMIN_PASSWORD!);

    //------------- safety check : to ensure we receive a token-----------------------
    if (!loginRes?.data?.login?.accessToken) {
      console.error('Login failed:', JSON.stringify(loginRes, null, 2));
      throw new Error('Login failed: token not received');
    }

    //------------------store the received token for future API calls ------------
    authToken = loginRes.data.login.accessToken!;

    //--------------close login context to free memory 
    await loginAPI.dispose();

    //-------------initialize userprofileAPI with authorization token
    userProfileAPI = new UserProfileAPI();
    await userProfileAPI.init(authToken);
  });

  //-----------------AFTER ALL :dispose api contexts to free memory ----------------//
  test.afterAll(async () => {
    await userProfileAPI.dispose();
  });

  //  Add delay automatically after every test to avoid server overload 
  test.afterEach(async () => {
    await new Promise(r => setTimeout(r, 2000)); // 2s delay
  });

  // ---------------- 1. Successful fetch of user profile ----------------
  test('Fetch user profile successfully', async () => {
    const res = await userProfileAPI.getUserProfile();

    //-----------------extract user profile data--------------------
    const profile = res.data?.getUserProfile;

    expect(profile).toBeDefined();
    expect(profile?._id).toBeTruthy();
    expect(profile?.email).toBe(process.env.ADMIN_EMAIL!);
  });

  // ---------------- 2. validate all required field exit an are not null ----------------
  test('Profile contains all required fields', async () => {
    const res = await userProfileAPI.getUserProfile();
    const profile = res.data?.getUserProfile;


    // Required field as provided by API schema. 
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


  // loop through each required field and validate existence 
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

    //initialiaze with fake token
    await invalidAPI.init('invalid-token');

  // send request
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

  // ---------------- 6. validate enabled 2FA is boolean or null ------------------
  test('enabled2FA field should be boolean', async () => {
    const res = await userProfileAPI.getUserProfile();
    const value = res.data?.getUserProfile?.enabled2FA;

    expect(typeof value === 'boolean' || value === null).toBeTruthy();
  });

  // ---------------- 7. Role and status value checks ----------------
  test('Role and status should have valid string values', async () => {
    const res = await userProfileAPI.getUserProfile();
    const { role, status } = res.data?.getUserProfile ?? {};

    // role should be string and non empty
    expect(typeof role).toBe('string');
    expect(role?.length).toBeGreaterThan(0);

    //status should be string and non empty
    expect(typeof status).toBe('string');
    expect(status?.length).toBeGreaterThan(0);
  });

  // ---------------- 8. Consistency check (two calls) across multiple API calls----------------
  test('Profile data remains consistent across multiple calls', async () => {
    const res1 = await userProfileAPI.getUserProfile();
    const res2 = await userProfileAPI.getUserProfile();

    // compare the two responses
    const profile1 = res1.data?.getUserProfile;
    const profile2 = res2.data?.getUserProfile;

    expect(profile1?._id).toBe(profile2?._id);
    expect(profile1?.email).toBe(profile2?.email);
    expect(profile1?.role).toBe(profile2?.role);
  });
});
