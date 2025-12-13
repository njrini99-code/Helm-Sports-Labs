import { test, expect, type Page } from '@playwright/test';

/**
 * Authentication Flow E2E Tests
 *
 * Tests cover:
 * - Login with valid credentials
 * - Login with invalid credentials
 * - Logout functionality
 * - Protected route access
 * - Session persistence
 */

// Test data
const TEST_USERS = {
  coach: {
    email: process.env.TEST_COACH_EMAIL || 'test-coach@example.com',
    password: process.env.TEST_COACH_PASSWORD || 'testpassword123',
    expectedDashboard: '/dashboard/college-coach',
  },
  player: {
    email: process.env.TEST_PLAYER_EMAIL || 'test-player@example.com',
    password: process.env.TEST_PLAYER_PASSWORD || 'testpassword123',
    expectedDashboard: '/dashboard/player',
  },
};

// Helper functions
async function loginUser(page: Page, email: string, password: string) {
  await page.goto('/auth/login');
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
}

async function logout(page: Page) {
  // Look for logout button (might be in header or menu)
  const logoutButton = page.locator('button:has-text("Logout"), button:has-text("Sign Out")');
  await logoutButton.click();
}

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Clear cookies and local storage before each test
    await page.context().clearCookies();
    await page.goto('/');
  });

  test('should show login page to unauthenticated users', async ({ page }) => {
    await page.goto('/auth/login');

    // Verify login page elements
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should login successfully with valid coach credentials', async ({ page }) => {
    await loginUser(page, TEST_USERS.coach.email, TEST_USERS.coach.password);

    // Wait for redirect to dashboard
    await page.waitForURL(TEST_USERS.coach.expectedDashboard, { timeout: 10000 });

    // Verify we're on the dashboard
    await expect(page).toHaveURL(TEST_USERS.coach.expectedDashboard);

    // Verify dashboard elements are visible
    await expect(page.locator('text=/dashboard/i')).toBeVisible({ timeout: 5000 });
  });

  test('should show error with invalid credentials', async ({ page }) => {
    await loginUser(page, 'invalid@example.com', 'wrongpassword');

    // Should still be on login page
    await expect(page).toHaveURL(/\/auth\/login/);

    // Should show error message (toast or inline error)
    await expect(
      page.locator('text=/invalid credentials|login failed|incorrect email or password/i')
    ).toBeVisible({ timeout: 5000 });
  });

  test('should logout successfully', async ({ page }) => {
    // Login first
    await loginUser(page, TEST_USERS.coach.email, TEST_USERS.coach.password);
    await page.waitForURL(TEST_USERS.coach.expectedDashboard, { timeout: 10000 });

    // Logout
    await logout(page);

    // Should redirect to login or home page
    await page.waitForURL(/\/(auth\/login|$)/, { timeout: 5000 });

    // Verify logged out state
    await expect(page).toHaveURL(/\/(auth\/login|$)/);
  });

  test('should redirect unauthenticated users from protected routes', async ({ page }) => {
    // Try to access protected dashboard route
    await page.goto('/dashboard/college-coach');

    // Should redirect to login
    await page.waitForURL(/\/auth\/login/, { timeout: 10000 });
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test('should persist session after page reload', async ({ page }) => {
    // Login
    await loginUser(page, TEST_USERS.coach.email, TEST_USERS.coach.password);
    await page.waitForURL(TEST_USERS.coach.expectedDashboard, { timeout: 10000 });

    // Reload page
    await page.reload();

    // Should still be on dashboard (session persisted)
    await expect(page).toHaveURL(TEST_USERS.coach.expectedDashboard);
    await expect(page.locator('text=/dashboard/i')).toBeVisible({ timeout: 5000 });
  });

  test('should prevent duplicate login attempts', async ({ page }) => {
    await page.goto('/auth/login');

    // Fill credentials
    await page.fill('input[type="email"]', TEST_USERS.coach.email);
    await page.fill('input[type="password"]', TEST_USERS.coach.password);

    // Click submit
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();

    // Button should be disabled during submission
    await expect(submitButton).toBeDisabled();
  });

  test('should validate email format', async ({ page }) => {
    await page.goto('/auth/login');

    // Enter invalid email
    await page.fill('input[type="email"]', 'not-an-email');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');

    // Should show validation error
    await expect(
      page.locator('text=/invalid email|please enter a valid email/i')
    ).toBeVisible({ timeout: 3000 });
  });

  test('should require both email and password', async ({ page }) => {
    await page.goto('/auth/login');

    // Try to submit with empty fields
    await page.click('button[type="submit"]');

    // Should show validation errors
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');

    // HTML5 validation or custom validation should prevent submission
    await expect(emailInput).toHaveAttribute('required', '');
    await expect(passwordInput).toHaveAttribute('required', '');
  });

  test('should handle session expiry gracefully', async ({ page }) => {
    // Login
    await loginUser(page, TEST_USERS.coach.email, TEST_USERS.coach.password);
    await page.waitForURL(TEST_USERS.coach.expectedDashboard, { timeout: 10000 });

    // Clear session cookies to simulate expiry
    await page.context().clearCookies();

    // Try to navigate to protected route
    await page.goto('/dashboard/college-coach');

    // Should redirect to login
    await page.waitForURL(/\/auth\/login/, { timeout: 10000 });
    await expect(page).toHaveURL(/\/auth\/login/);
  });
});

test.describe('Player Authentication', () => {
  test('should login player and redirect to player dashboard', async ({ page }) => {
    await loginUser(page, TEST_USERS.player.email, TEST_USERS.player.password);

    // Wait for redirect to player dashboard
    await page.waitForURL(TEST_USERS.player.expectedDashboard, { timeout: 10000 });

    // Verify we're on the correct dashboard
    await expect(page).toHaveURL(TEST_USERS.player.expectedDashboard);
  });
});
