import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  headless: false
  });
  viewport: {
  height: 1080,
  width: 1920
  }
  });
  await page.goto('http://genesis-anseong.plusinsight.io:10000/auth/signin?callbackUrl=%2F');
  await page.locator('div').filter({ hasText: /^user ID$/ }).click();
  await page.getByRole('textbox', { name: 'Enter your user ID' }).fill('testbot');
  await page.getByRole('textbox', { name: 'Enter your user ID' }).press('Tab');
  await page.getByRole('textbox', { name: 'Enter your password' }).fill('Test');
  await page.getByRole('textbox', { name: 'Enter your password' }).press('ControlOrMeta+a');
  await page.getByRole('textbox', { name: 'Enter your password' }).fill('TestBot1!');
  await page.getByRole('button', { name: 'Login' }).click();
  await page.getByRole('link', { name: 'Reports' }).click();
  await page.locator('.css-en87oh-indicatorContainer').click();
  await page.getByText('한국어', { exact: true }).click();
  await page.getByRole('link', { name: '커스텀 리포트' }).click();
  await page.getByRole('link', { name: '구역 관심도 분석' }).click();
  })();
});