import { by, device, element, expect } from 'detox';

describe('Login Flow', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should show login screen on launch', async () => {
    await expect(element(by.id('username-input'))).toBeVisible();
    await expect(element(by.id('password-input'))).toBeVisible();
    await expect(element(by.id('login-button'))).toBeVisible();
  });

  it('should login successfully with valid credentials', async () => {
    await element(by.id('username-input')).typeText('admin');
    await element(by.id('password-input')).typeText('1234');
    await element(by.id('login-button')).tap();

    await expect(element(by.text('¡Hola!'))).toBeVisible();
  });

  it('should show error with invalid credentials', async () => {
    await element(by.id('username-input')).typeText('wrong');
    await element(by.id('password-input')).typeText('wrong');
    await element(by.id('login-button')).tap();

    await expect(element(by.text('Invalid credentials'))).toBeVisible();
  });

  it('should complete full login flow', async () => {
    // Start at login screen
    await expect(element(by.id('username-input'))).toBeVisible();

    // Enter credentials
    await element(by.id('username-input')).typeText('admin');
    await element(by.id('password-input')).typeText('1234');

    // Submit login
    await element(by.id('login-button')).tap();

    // Verify navigation to home screen
    await expect(element(by.text('¡Hola!'))).toBeVisible();
  });
});
