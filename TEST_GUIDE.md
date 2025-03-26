# DSmokeyRecorder Test Guide

This guide demonstrates how to use DSmokeyRecorder to create automated tests, based on a real test case. We'll walk through creating a test that automates a login and navigation flow.

## Test Case Overview

Our example test case performs the following actions:
1. Configures browser settings
2. Navigates to a login page
3. Performs login with credentials
4. Navigates through various sections
5. Changes language settings
6. Accesses specific reports

## Step-by-Step Guide

### 1. Starting DSmokeyRecorder

First, launch DSmokeyRecorder and configure your test:

```javascript
// Browser Configuration
headless: false
viewport: {
  height: 1080,
  width: 1920
}
```

**What to do in DSmokeyRecorder:**
1. Open DSmokeyRecorder
2. Enter a descriptive test name (e.g., "Login and Navigation Test")
3. Add a test description
4. Enter the target URL

### 2. Recording Login Actions

The test performs these login actions:

```javascript
await page.goto('http://your-application-url/auth/signin');
await page.locator('div').filter({ hasText: /^user ID$/ }).click();
await page.getByRole('textbox', { name: 'Enter your user ID' }).fill('your-username');
await page.getByRole('textbox', { name: 'Enter your password' }).fill('your-password');
await page.getByRole('button', { name: 'Login' }).click();
```

**What to do in DSmokeyRecorder:**
1. Click "Start Recording"
2. Click the User ID field
3. Enter your username
4. Click the Password field
5. Enter your password
6. Click the Login button

### 3. Navigation and Menu Selection

The test navigates through various sections:

```javascript
await page.getByRole('link', { name: 'Reports' }).click();
await page.locator('.css-en87oh-indicatorContainer').click();
```

**What to do in DSmokeyRecorder:**
1. Click on the Reports link in the navigation menu
2. Click on the indicator container for additional options

### 4. Language Change and Report Access

The test changes language and accesses specific reports:

```javascript
await page.getByText('한국어', { exact: true }).click();
await page.getByRole('link', { name: '커스텀 리포트' }).click();
await page.getByRole('link', { name: '구역 관심도 분석' }).click();
```

**What to do in DSmokeyRecorder:**
1. Select the language option (한국어)
2. Navigate to Custom Reports (커스텀 리포트)
3. Access the Area Interest Analysis (구역 관심도 분석)

### 5. Completing the Recording

After performing all actions:
1. Click "Stop Recording"
2. Review the generated code
3. Click "Download" to save your test file

## Generated Test Code

The complete test code will look similar to this:

```javascript
import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  // Browser configuration
  headless: false;
  viewport: {
    height: 1080,
    width: 1920
  }
  
  // Navigation and login
  await page.goto('your-application-url');
  await page.locator('div').filter({ hasText: /^user ID$/ }).click();
  await page.getByRole('textbox', { name: 'Enter your user ID' }).fill('your-username');
  await page.getByRole('textbox', { name: 'Enter your password' }).fill('your-password');
  await page.getByRole('button', { name: 'Login' }).click();
  
  // Navigation and language change
  await page.getByRole('link', { name: 'Reports' }).click();
  await page.locator('.css-en87oh-indicatorContainer').click();
  await page.getByText('한국어', { exact: true }).click();
  
  // Accessing reports
  await page.getByRole('link', { name: '커스텀 리포트' }).click();
  await page.getByRole('link', { name: '구역 관심도 분석' }).click();
});
```

## Tips for Better Recording

1. **Clear Starting State**
   - Always start with a clean browser session
   - Ensure you're logged out before recording login tests

2. **Consistent Timing**
   - Perform actions at a steady pace
   - Wait for page loads between actions

3. **Selector Reliability**
   - Use role-based selectors when possible
   - Avoid relying on CSS classes that might change

4. **Test Verification**
   - Add assertions to verify important states
   - Check for expected elements after navigation

5. **Maintainable Tests**
   - Use descriptive test names
   - Add comments for complex actions
   - Keep tests focused on specific functionality

## Troubleshooting Common Issues

1. **Selector Not Found**
   - Wait for elements to be visible
   - Check if selectors are unique
   - Use more specific selectors

2. **Navigation Timing**
   - Add explicit waits for page loads
   - Wait for network requests to complete

3. **Language-Specific Issues**
   - Use language-independent selectors when possible
   - Document language dependencies

## Next Steps

After recording your test:
1. Review the generated code
2. Add assertions where needed
3. Run the test to verify it works
4. Commit to your test suite

Remember to update your tests when the application changes and maintain good test hygiene by regularly reviewing and updating your test suite.

---

For more information, check the [DSmokeyRecorder Documentation](https://github.com/suumpro/DSmokeyRecorder) or [Create an Issue](https://github.com/suumpro/DSmokeyRecorder/issues) if you need help.