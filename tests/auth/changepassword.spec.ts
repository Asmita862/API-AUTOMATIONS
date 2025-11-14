// changepassword.spec.ts
import { test, expect } from '@playwright/test';
import { LoginAPI } from '../../pages/auth/login.api';
import { ChangePasswordAPI, ChangePasswordInput } from '../../pages/auth/changepassword.api';
import dotenv from 'dotenv';
dotenv.config();

test.describe('Change Password API using .env credentials', () => {
    let loginAPI: LoginAPI;
    let changePasswordAPI: ChangePasswordAPI;
    let authToken: string;

    const adminEmail = process.env.ADMIN_EMAIL!;
    const oldPassword = process.env.ADMIN_PASSWORD!;
    const invalidPassword = process.env.ADMIN_INVALID_PASSWORD!;
    const newPassword = process.env.ADMIN_NEW_PASSWORD!;

    test.beforeAll(async () => {
        // Login to get auth token
        loginAPI = new LoginAPI();
        await loginAPI.init();

        const loginResponse = await loginAPI.login(adminEmail, oldPassword);
        authToken = loginResponse.data?.login.accessToken!;
        expect(authToken).toBeTruthy();
        await loginAPI.dispose();

        changePasswordAPI = new ChangePasswordAPI();
        await changePasswordAPI.init(authToken);
    });

    test.afterAll(async () => {
        // Reset password back to oldPassword
        const resetInput: ChangePasswordInput = {
            oldPassword: newPassword,
            password: oldPassword,
        };
        try {
            await changePasswordAPI.changePassword(resetInput);
        } catch (err) {
            console.log('Password reset failed:', err);
        }
        await changePasswordAPI.dispose();
    });

    test('should change password successfully', async () => {
        const input: ChangePasswordInput = { oldPassword, password: newPassword };
        const response = await changePasswordAPI.changePassword(input);

        expect(response.errors).toBeUndefined();
        expect(response.data?.changePassword.message).toBeDefined();
        console.log('Success message:', response.data?.changePassword.message);

        await new Promise(res => setTimeout(res, 1500));
    });

    test('should fail when old password is incorrect', async () => {
        const input: ChangePasswordInput = { oldPassword: invalidPassword, password: newPassword };
        const response = await changePasswordAPI.changePassword(input);

        expect(response.errors).toBeDefined();
        console.log('Error message:', response.errors?.[0]?.message);

        await new Promise(res => setTimeout(res, 1500));
    });

    test('should fail when new password is empty', async () => {
        const input: ChangePasswordInput = { oldPassword: newPassword, password: '' };
        const response = await changePasswordAPI.changePassword(input);

        if (response.errors) {
            expect(response.errors).toBeDefined();
            expect(response.errors?.[0]?.message).toBeTruthy();
            console.log('Error message:', response.errors?.[0]?.message);
        } else if (response.data?.changePassword?.message) {
            console.log('Validation message:', response.data.changePassword.message);
            expect(response.data.changePassword.message).toMatch(/empty|invalid|failed/i);
        } else {
            throw new Error('No error or message returned for empty password');
        }

        await new Promise(res => setTimeout(res, 1500));
    });

    test('should fail when new password is too short', async () => {
        const input: ChangePasswordInput = { oldPassword: newPassword, password: '123' };
        const response = await changePasswordAPI.changePassword(input);

        if (response.errors) {
            expect(response.errors).toBeDefined();
            expect(response.errors?.[0]?.message).toBeTruthy();
            console.log('Error message:', response.errors?.[0]?.message);
        } else if (response.data?.changePassword?.message) {
            console.log('Validation message:', response.data.changePassword.message);
            expect(response.data.changePassword.message).toMatch(/short|invalid|failed/i);
        } else {
            throw new Error('No error or message returned for too short password');
        }

        await new Promise(res => setTimeout(res, 1500));
    });
});
