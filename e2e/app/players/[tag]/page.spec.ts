import { test, expect } from '@playwright/test';

test.describe('ユーザーがバトル履歴を見れるようにする#3', () => {
  test.beforeEach(async ({page}) => {
    await page.goto('http://localhost:3001/players/Y2YPGCGC', { timeout: 15000  });
  })

  // バトル履歴のタイトルが表示される
  test('バトル履歴のタイトルが表示される', async ({ page}) => {
    await expect(page.getByText("BATTLE LOG")).toBeVisible({ timeout: 15000 })
  })

  // バトル履歴が8件以上表示される, data-testid="battleLog"
  test('バトル履歴が8件以上表示される', async ({ page}) => {
    const battleLogs = await page.getByTestId("battleLog").all();
    expect(battleLogs.length).toBeGreaterThanOrEqual(8);
  });

  // バトル履歴の他のプレイヤーをタップすることでそのプレイヤーの詳細ページに遷移できる
  test('バトル履歴の一人目のプレイヤーをタップすることでそのプレイヤーの詳細ページに遷移できる', async ({ page}) => {
    const links = await page.getByTestId('playerComponent');
    const linkCount = await links.count();

    let link;
    let tag;
    for (let i = 0; i < linkCount; i++) {
      const href = await links.nth(i).getAttribute('href');
      if (href && !href.includes('Y2YPGCGC')) {
        link = links.nth(i);
        tag = href.split('/').pop()?.toUpperCase();
        break;
      }
    }

    if (!link || !tag) {
      throw new Error('自分以外のプレイヤーリンクが見つかりませんでした');
    }

    await link.click();
    await expect(page).toHaveURL(`http://localhost:3001/players/${tag}`, { timeout: 15000 });
    await expect(page.getByText(`#${tag}`)).toBeVisible({ timeout: 15000 });
  });

})
