import { test, expect } from '@playwright/test';

test.describe('Auth pages', () => {
  test('unauthenticated users are redirected to login', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/login/);
  });

  test('login page renders sign-in form', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  });

  test('login page has link to signup', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('link', { name: /sign up/i })).toBeVisible();
  });

  test('navigates to signup page', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('link', { name: /sign up/i }).click();
    await expect(page).toHaveURL(/\/signup/);
    await expect(page.getByRole('heading', { name: /create account/i })).toBeVisible();
  });

  test('signup page renders registration form', async ({ page }) => {
    await page.goto('/signup');
    await expect(page.getByLabel(/full name/i)).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /create account/i })).toBeVisible();
  });

  test('signup page has link to sign in', async ({ page }) => {
    await page.goto('/signup');
    await expect(page.getByRole('link', { name: /sign in/i })).toBeVisible();
  });
});
