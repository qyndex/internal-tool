import { test, expect } from '@playwright/test';

test.describe('Home / Dashboard page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('shows the page title', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible();
  });

  test('sidebar renders app title and nav links', async ({ page }) => {
    await expect(page.getByText('Internal Tool')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Dashboard' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Data Table' })).toBeVisible();
  });

  test('stat cards are visible', async ({ page }) => {
    await expect(page.getByText('Users')).toBeVisible();
    await expect(page.getByText('Revenue')).toBeVisible();
    await expect(page.getByText('Orders')).toBeVisible();
  });

  test('navigates to Data Table page via sidebar link', async ({ page }) => {
    await page.getByRole('link', { name: 'Data Table' }).click();
    await expect(page).toHaveURL(/\/data/);
    await expect(page.getByPlaceholder('Filter...')).toBeVisible();
  });

  test('Data Table shows table headers', async ({ page }) => {
    await page.goto('/data');
    await expect(page.getByRole('columnheader', { name: 'ID' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Name' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Status' })).toBeVisible();
  });

  test('filter input accepts text on Data Table page', async ({ page }) => {
    await page.goto('/data');
    const input = page.getByPlaceholder('Filter...');
    await input.fill('Item A');
    await expect(input).toHaveValue('Item A');
  });
});
