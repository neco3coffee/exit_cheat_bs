import { test, expect } from '@playwright/test';

test.describe('ユーザーがタグでプレイヤーを検索できる#1', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3001/', { timeout: 60000 } );
  })


  // Y2YPGCGC という正常なタグを入力して検索して、該当するプレイヤー(neco3)が表示されることを確認する
  test('正常なタグを入力して検索して、該当するプレイヤーが表示されることを確認する#2', async ({ page }) => {
    // タグ入力欄にY2YPGCGCを入力
    await page.getByPlaceholder('#Y2YPGCGC').fill('Y2YPGCGC');
    // Enterキーを押して検索

    await page.getByPlaceholder('#Y2YPGCGC').press('Enter');

    // neco3という名前のプレイヤーが表示されることを確認
    await expect(page.getByText('neco3')).toBeVisible({timeout: 60000});
  });

  // 存在しないタグを入力して検索して、該当するプレイヤーが表示されないことを確認する
  test('存在しないタグを入力して検索して、該当するプレイヤーが表示されないことを確認する#3', async ({ page }) => {
    // タグ入力欄にAAAAAAAAを入力
    await page.getByPlaceholder('#Y2YPGCGC').fill('AAAAAAAA');
    // Enterキーを押して検索
    await page.getByPlaceholder('#Y2YPGCGC').press('Enter');

    // <p>No Player for: #{tag}</p>が表示されることを確認
    await expect(page.getByText('No Player for: #AAAAAAAA')).toBeVisible({ timeout: 10000 });
  });

  // ローマ字と数字以外の文字を含むタグを入力して検索して、アラートが表示されることを確認する
  test('ローマ字と数字以外の文字を含むタグを入力して検索して、アラートが表示されることを確認する#4', async ({ page }) => {
    // タグ入力欄にY2YPGCGC!@#を入力
    await page.getByPlaceholder('#Y2YPGCGC').fill('Y2YPGCGC!@#');
    // Enterキーを押して検索
    await page.getByPlaceholder('#Y2YPGCGC').press('Enter');

    // アラートが表示されることを確認
    page.on('dialog', async dialog => {
      expect(dialog.message()).toBe('タグは英数字で構成されている必要があります');
      await dialog.dismiss();
    });
  });

  // タグの長さが6文字未満のタグを入力して検索して、アラートが表示されることを確認する
  test('タグの長さが6文字未満のタグを入力して検索して、アラートが表示されることを確認する#5', async ({ page }) => {
    // タグ入力欄にY2YPGを入力
    await page.getByPlaceholder('#Y2YPGCGC').fill('Y2YPG');
    // アラートが表示されることを確認
    page.on('dialog', async dialog => {
      expect(dialog.message()).toBe('タグの長さは6〜10文字である必要があります');
      await dialog.dismiss();
    });
    // Enterキーを押して検索
    await page.getByPlaceholder('#Y2YPGCGC').press('Enter');
  });

  // タグの長さが10文字を超えるタグを入力して検索して、アラートが表示されることを確認する
  test('タグの長さが10文字を超えるタグを入力して検索して、アラートが表示されることを確認する#6', async ({ page }) => {
    // タグ入力欄にY2YPGCGC123を入力
    await page.getByPlaceholder('#Y2YPGCGC').fill('Y2YPGCGC123');
    // Enterキーを押して検索
    await page.getByPlaceholder('#Y2YPGCGC').press('Enter');

    // アラートが表示されることを確認
    page.on('dialog', async dialog => {
      expect(dialog.message()).toBe('タグの長さは6〜10文字である必要があります');
      await dialog.dismiss();
    });
  });

})
