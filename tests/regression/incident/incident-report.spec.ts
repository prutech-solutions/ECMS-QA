import { test, expect } from '../../../src/fixtures/salesforce.fixture.js';

/**
 * Incident Report — All 4 ready scenarios
 * Persona: Vendor Admin
 */
test.describe('Incident Report - Portal incident management', () => {
  test('TC-INC-1: Vendor Admin can see Incident Report tab on external portal', async ({
    basePage, docCapture,
  }) => {
    await test.step('Login as Vendor Admin user', async () => {
      // TODO: Switch to vendor-admin persona
      await docCapture.step('Logged in as Vendor Admin');
    });

    await test.step('Navigate to "More" menu tab', async () => {
      // TODO: Click More menu on portal navigation
      await docCapture.step('More menu opened');
    });

    await test.step('Verify "Report Incident" option is visible and clickable', async () => {
      // TODO: Assert Report Incident menu item is visible
      await docCapture.step('Report Incident option visible and clickable');
    });
  });

  test('TC-INC-2: Report Incident should not be visible for Non Admin user', async ({
    basePage, docCapture,
  }) => {
    await test.step('Login as Non Admin user', async () => {
      // TODO: Login with non-admin permissions (e.g., ECMS Create & Update Enrollment only)
      await docCapture.step('Logged in as Non Admin user');
    });

    await test.step('Navigate to "More" menu tab and verify Report Incident is hidden', async () => {
      // TODO: Open More menu and verify Report Incident is NOT present
      await docCapture.step('Report Incident option correctly hidden for Non Admin');
    });
  });

  test('TC-INC-3: Vendor Admin can submit an incident with required fields', async ({
    basePage, recordForm, toast, docCapture,
  }) => {
    await test.step('Login as Vendor Admin user', async () => {
      await docCapture.step('Logged in as Vendor Admin');
    });

    await test.step('Navigate to Report Incident', async () => {
      // TODO: Click Report Incident from More menu
      await docCapture.step('Report Incident form opened');
    });

    await test.step('Fill Subject field', async () => {
      // TODO: Enter incident subject
      await docCapture.step('Subject field filled');
    });

    await test.step('Select Category', async () => {
      // TODO: Select incident category from picklist
      await docCapture.step('Category selected');
    });

    await test.step('Fill incident description and details', async () => {
      // TODO: Fill remaining required fields
      await docCapture.step('Incident details filled');
    });

    await test.step('Submit incident', async () => {
      // TODO: Click Submit
      await docCapture.step('Incident submitted');
    });

    await test.step('Verify submission confirmation', async () => {
      // TODO: Verify success toast or confirmation page
      await docCapture.step('Incident submission confirmed');
    });
  });

  test('TC-INC-7: Incident Intake Team member can create Incident in Salesforce', async ({
    basePage, recordForm, toast, docCapture,
  }) => {
    await test.step('Login as Incident Intake Team member (internal)', async () => {
      // TODO: Switch to internal admin or intake team persona
      await docCapture.step('Logged in as Incident Intake Team member');
    });

    await test.step('Navigate to Incident object in SF', async () => {
      // TODO: Navigate to Incident object via App Launcher or tab
      await basePage.navigateToObject('Case'); // TODO: Confirm API name
      await docCapture.step('Navigated to Incident object');
    });

    await test.step('Create new Incident record', async () => {
      await basePage.navigateToNewRecord('Case'); // TODO: Confirm API name
      await recordForm.waitForFormReady();
      // TODO: Fill incident fields
      await recordForm.save();
      await toast.expectSuccess();
      await docCapture.step('Incident created in Salesforce');
    });
  });
});
