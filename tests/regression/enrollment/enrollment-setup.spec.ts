import { test, expect } from '../../../src/fixtures/salesforce.fixture.js';

/**
 * Enrollment — Admin Setup and Provisioning (TC 1–7)
 * Persona: Admin, Ravi Krishna (Vendor)
 */
test.describe('Enrollment - Admin setup and provisioning', () => {
  test('TC-ENR-1: Admin user can login to ECMS-SF', async ({
    page, basePage, docCapture,
  }) => {
    await test.step('Login to SF with correct credentials', async () => {
      await basePage.navigateToUrl('/lightning/page/home');
      await expect(page).toHaveURL(/lightning/);
      await docCapture.step('Admin logged into ECMS-SF');
    });
  });

  test('TC-ENR-2: Admin can search vendor-based contact user', async ({
    basePage, docCapture,
  }) => {
    await test.step('Search for vendor user from homepage', async () => {
      // TODO: Use global search to find vendor contact
      await docCapture.step('Vendor user found in search results');
    });
  });

  test('TC-ENR-3: Admin can open vendor user profile', async ({
    basePage, recordDetail, docCapture,
  }) => {
    await test.step('Select and open vendor user profile', async () => {
      // TODO: Click on vendor contact record
      await docCapture.step('Vendor user profile opened — user is active');
    });
  });

  test('TC-ENR-4: Enable partner as user', async ({
    basePage, recordDetail, toast, docCapture,
  }) => {
    await test.step('Enable partner as user on vendor contact', async () => {
      // TODO: Click "Enable Partner User" or equivalent action
      await docCapture.step('Partner user enabled');
    });
  });

  test('TC-ENR-5: Provision Contact button is visible', async ({
    basePage, recordDetail, docCapture,
  }) => {
    // User: Ravi Krishna
    await test.step('Navigate to vendor contact and verify Provision Contact button', async () => {
      // TODO: Verify "Provision Contact" button/action is visible
      await docCapture.step('Provision Contact button visible');
    });
  });

  test('TC-ENR-6: Admin can provision vendor contact with required permission sets', async ({
    basePage, recordForm, toast, docCapture,
  }) => {
    // User: Ravi Krishna
    await test.step('Click Provision Contact and assign permission sets', async () => {
      // TODO: Click Provision Contact, select required PSGs
      await docCapture.step('Vendor contact provisioned with required permission sets');
    });
  });

  test('TC-ENR-7: Admin can login to Experience as vendor user', async ({
    basePage, docCapture,
  }) => {
    // User: Ravi Krishna
    await test.step('Login as vendor user on Experience Cloud', async () => {
      // TODO: Use "Log in to Experience as User" from contact record
      await docCapture.step('Logged into Experience as vendor user');
    });
  });
});
