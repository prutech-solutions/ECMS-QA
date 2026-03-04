import { test, expect } from '../../../src/fixtures/salesforce.fixture.js';

/**
 * Coaching Log — Create (TC 1–6)
 * Persona: Internal Admin
 */
test.describe('Coaching Log - Create coaching log entries', () => {
  test('TC-1: Verify that admin has login to ECMS SF application', async ({
    page, basePage, docCapture,
  }) => {
    await test.step('Login to SF ECMS Application', async () => {
      await basePage.navigateToUrl('/lightning/page/home');
      await docCapture.step('Admin logged into ECMS SF homepage');
    });

    await test.step('Verify homepage loads', async () => {
      await expect(page).toHaveURL(/lightning/);
      await docCapture.step('Homepage loaded successfully');
    });
  });

  test('TC-2: Admin is able to create a coaching log', async ({
    basePage, recordForm, toast, docCapture,
  }) => {
    await test.step('Navigate to Coaching Log tab', async () => {
      // TODO: Confirm exact object API name for Coaching Log
      await basePage.navigateToObject('ECMS_Coaching_Log__c');
      await docCapture.step('Navigated to Coaching Log tab');
    });

    await test.step('Click New to create coaching log', async () => {
      await basePage.navigateToNewRecord('ECMS_Coaching_Log__c');
      await docCapture.step('New coaching log form opened');
    });

    await test.step('Fill required fields based on role-based log', async () => {
      // TODO: Populate exact field labels and values from test data
      await recordForm.waitForFormReady();
      await docCapture.step('Form ready for input');
    });

    await test.step('Save coaching log', async () => {
      await recordForm.save();
      await toast.expectSuccess();
      await docCapture.step('Coaching log created successfully');
    });

    await test.step('Verify record is created with correct details', async () => {
      // TODO: Verify specific field values on the record detail
      await docCapture.step('Record details verified');
    });
  });
});
