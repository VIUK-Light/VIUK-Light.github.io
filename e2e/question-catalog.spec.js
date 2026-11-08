const { test, expect } = require('@playwright/test');
const source = require('../assets/omoi/data/source.json');
const versions = require('../assets/omoi/data/versions.json');

test('the refreshed catalog supports search, filters, details and pagination', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/omoi-question-catalog.html');

  await expect(page).toHaveTitle('質問カタログ — Omoi Documentation');
  await expect(page.locator('#questionResultCount')).toHaveText('906件中 36件を表示');
  await expect(page.getByRole('link', { name: new RegExp(`^${source.commit.slice(0, 7)}`) })).toHaveAttribute(
    'href', `https://github.com/VIUK-Light/Omoi/tree/${source.commit}`
  );
  await page.getByRole('button', { name: 'さらに読み込む' }).click();
  await expect(page.locator('.question-entry')).toHaveCount(72);

  await page.getByLabel('話題カテゴリ / Level').selectOption('4');
  await expect(page.locator('#questionResultCount')).toHaveText('362件中 36件を表示');
  await page.getByLabel('上位分類 / category').selectOption('relationships_and_communication');
  await expect(page.locator('#questionResultCount')).toHaveText('102件中 36件を表示');
  await page.getByLabel('配慮度 / sensitivity').selectOption('4');
  await expect(page.locator('.question-entry')).not.toHaveCount(0);
  await expect(page.locator('.question-meta').first()).toContainText('sensitivity: 4');

  await page.getByLabel('上位分類 / category').selectOption('');
  await page.getByLabel('配慮度 / sensitivity').selectOption('');
  await page.getByLabel('キーワード', { exact: true }).fill('relationship-401');
  await expect(page.locator('#questionResultCount')).toHaveText('1件中 1件を表示');
  await expect(page.locator('.question-entry h3')).toHaveText('事実の確認、子どもとの関係、配偶者との信頼のうち、何を優先する？');
  await expect(page.locator('.question-scenario')).toBeVisible();
  await page.getByText('会話のヒント', { exact: true }).click();
  await expect(page.locator('.question-entry details').first()).toHaveAttribute('open', '');
  await page.getByText('問いの背景', { exact: true }).click();
  await expect(page.locator('.question-entry details').last()).toHaveAttribute('open', '');

  await page.getByLabel('キーワード', { exact: true }).fill('該当しない検索語-viuk-catalog');
  await expect(page.locator('#questionResultCount')).toHaveText('0件中 0件を表示');
  await expect(page.locator('#questionCatalogEmpty')).toBeVisible();
  await expect(page.getByRole('button', { name: 'さらに読み込む' })).toBeHidden();
  expect(errors).toEqual([]);
});

test('failed data requests show an error without a partial catalog', async ({ page }) => {
  await page.route(`**/assets/omoi/data/versions/${source.commit}/level3.json?*`, route => route.fulfill({ status: 503, body: 'Unavailable' }));
  await page.goto('/omoi-question-catalog.html');

  await expect(page.locator('#questionResultCount')).toHaveText('質問データを読み込めませんでした');
  await expect(page.locator('#questionCatalogEmpty')).toContainText('GitHubの公式データを確認してください');
  await expect(page.getByLabel('キーワード', { exact: true })).toBeDisabled();
  await expect(page.locator('.question-entry')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'さらに読み込む' })).toBeHidden();
  await expect(page.getByLabel('Omoiのバージョン', { exact: true })).toBeEnabled();
  await page.getByLabel('Omoiのバージョン', { exact: true }).selectOption('v1.0.0');
  await expect(page.locator('#questionResultCount')).toHaveText('643件中 36件を表示');
  await expect(page.getByLabel('キーワード', { exact: true })).toBeEnabled();
  await expect(page.locator('#questionVersionSource')).toContainText('表示中：v1.0.0');
});

test('all five public versions show their own records and provenance', async ({ page }) => {
  await page.goto('/omoi-question-catalog.html');
  const select = page.getByLabel('Omoiのバージョン', { exact: true });
  await expect(select).toBeEnabled();
  await expect(select.locator('option')).toHaveCount(5);
  await expect(select).toHaveValue(versions.default);

  for (const entry of versions.versions) {
    await select.selectOption(entry.id);
    await expect(page.locator('#questionResultCount')).toHaveText(`${entry.total}件中 36件を表示`);
    await expect(page.locator('#questionVersionSource')).toContainText(`表示中：${entry.label}`);
    await expect(page.locator('#questionVersionSource')).toContainText(`公開日：${entry.release_date}`);
    await expect(page.locator('#questionVersionSource a').first()).toHaveAttribute('href', `https://github.com/VIUK-Light/Omoi/tree/${entry.commit}`);
  }
  await expect(page.locator('#questionVersionNote')).toContainText('IDの重複');
  await page.getByLabel('キーワード', { exact: true }).fill('life-001');
  await expect(page.locator('#questionResultCount')).toHaveText('2件中 2件を表示');

  await select.selectOption('v2.0.0');
  await page.getByLabel('キーワード', { exact: true }).fill('contact-002');
  await expect(page.locator('.question-entry h3')).toHaveText('毎日連絡したいタイプ？');
  await select.selectOption('v2.01');
  await expect(page.locator('.question-entry h3')).toHaveText('親しい人とは、毎日連絡を取りたい？');
  await expect(page.locator('#questionVersionNote')).toContainText('同じコミット');
  await expect(page.locator('#questionVersionNote')).toContainText('v2.1');

  await page.getByLabel('上位分類 / category').selectOption('relationships_and_communication');
  await select.selectOption('v0.1.0');
  await expect(page.getByLabel('上位分類 / category')).toHaveValue('');
  await expect(page.getByLabel('キーワード', { exact: true })).toHaveValue('contact-002');
});

test('version links, reload and browser history restore the selected snapshot', async ({ page }) => {
  const select = page.getByLabel('Omoiのバージョン', { exact: true });
  await page.goto('/omoi-question-catalog.html?version=v1.0.0');
  await expect(page.locator('#questionResultCount')).toHaveText('643件中 36件を表示');
  await expect(select).toHaveValue('v1.0.0');
  await page.reload();
  await expect(select).toHaveValue('v1.0.0');
  await expect(page.locator('#questionResultCount')).toHaveText('643件中 36件を表示');

  await select.selectOption('v2.01');
  await expect(page).toHaveURL(/\?version=v2\.01$/);
  await expect(page.locator('#questionResultCount')).toHaveText('906件中 36件を表示');
  await page.goBack();
  await expect(select).toHaveValue('v1.0.0');
  await expect(page.locator('#questionResultCount')).toHaveText('643件中 36件を表示');
  await page.goForward();
  await expect(select).toHaveValue('v2.01');
  await expect(page.locator('#questionVersionSource')).toContainText('表示中：v2.01');

  await page.goto('/omoi-question-catalog.html?version=not-a-version');
  await expect(select).toHaveValue(versions.default);
  await expect(page.locator('#questionResultCount')).toHaveText('906件中 36件を表示');
  await expect(page.locator('#questionVersionNote')).toContainText('指定されたバージョンが見つからない');
});

test('switching away from a slow version cannot overwrite the selected version', async ({ page }) => {
  let startRequest;
  let releaseRequest;
  let finishRequest;
  const started = new Promise(resolve => { startRequest = resolve; });
  const released = new Promise(resolve => { releaseRequest = resolve; });
  const finished = new Promise(resolve => { finishRequest = resolve; });
  const oldVersion = versions.versions.find(entry => entry.id === 'v1.0.0');
  const oldSource = require(`../assets/omoi/data/versions/${oldVersion.commit}/source.json`);
  await page.route(`**/versions/${oldVersion.commit}/source.json?*`, async route => {
    startRequest();
    await released;
    // An aborted browser request may have closed before the delayed response.
    await route.fulfill({ json: oldSource }).catch(() => {});
    finishRequest();
  });
  await page.goto('/omoi-question-catalog.html');
  await expect(page.locator('#questionResultCount')).toHaveText('906件中 36件を表示');
  const select = page.getByLabel('Omoiのバージョン', { exact: true });
  await select.selectOption('v1.0.0');
  await started;
  await expect(page.locator('#questionCatalogList')).toHaveAttribute('aria-busy', 'true');
  await expect(page.getByLabel('キーワード', { exact: true })).toBeDisabled();
  await select.selectOption('v0.1.0');
  await expect(page.locator('#questionResultCount')).toHaveText('365件中 36件を表示');
  releaseRequest();
  await finished;
  await expect(select).toHaveValue('v0.1.0');
  await expect(page.locator('#questionVersionSource')).toContainText('表示中：v0.1.0');
  await expect(page.locator('#questionResultCount')).toHaveText('365件中 36件を表示');
});
