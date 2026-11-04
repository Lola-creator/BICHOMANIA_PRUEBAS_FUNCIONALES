const { test, expect } = require('@playwright/test');

test('BichoMania carga correctamente', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveTitle('React App');
});