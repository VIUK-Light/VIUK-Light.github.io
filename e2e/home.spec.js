const { test, expect } = require('@playwright/test');

test('home links to the Omoi projects page', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveTitle(/VIUK-Light/);
  await expect(page.getByRole('heading', { name: 'Omoiシリーズ' })).toBeVisible();
  await page.getByRole('link', { name: '一覧を見る' }).click();

  await expect(page).toHaveURL(/\/projects\.html$/);
  await expect(page.getByRole('heading', { name: 'プロジェクト' })).toBeVisible();
  const publishedProjects = page.getByRole('region', { name: '公開プロジェクト' });
  await expect(publishedProjects.getByRole('link', { name: 'Omoi', exact: true })).toBeVisible();
  await expect(publishedProjects.getByRole('link', { name: 'Omoi for series', exact: true })).toBeVisible();
});
