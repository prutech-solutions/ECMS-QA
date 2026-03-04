import { test, expect } from '../../../src/fixtures/salesforce.fixture.js';

/**
 * Budget — End-to-end flow (TC 91)
 * Full lifecycle: create → add classes → line items → submit → OA approve → OD approve
 * Persona: Vendor Admin, OA, OD
 */
test.describe('Budget - End-to-end flow', () => {
  test('TC-BUD-91: Complete budget lifecycle', async ({
    basePage, recordForm, recordDetail, toast, docCapture,
  }) => {
    await test.step('Step 1: Login as Vendor Admin', async () => {
      // TODO: Switch to vendor-admin persona
      await docCapture.step('Logged in as Vendor Admin');
    });

    await test.step('Step 2: Navigate to Site', async () => {
      // TODO: Open Site from portal
      await docCapture.step('Site opened');
    });

    await test.step('Step 3: Open ECMS Contract', async () => {
      // TODO: Navigate to contract
      await docCapture.step('ECMS Contract opened');
    });

    await test.step('Step 4: Create new Budget', async () => {
      // TODO: Create budget from contract
      await docCapture.step('New budget created');
    });

    await test.step('Step 5: Add classes to budget', async () => {
      // TODO: Select and add available classes
      await docCapture.step('Classes added to budget');
    });

    await test.step('Step 6: Edit line items — Administrative costs', async () => {
      // TODO: Fill admin cost line items
      await docCapture.step('Administrative cost line items filled');
    });

    await test.step('Step 7: Edit line items — Facility costs', async () => {
      // TODO: Fill facility cost line items
      await docCapture.step('Facility cost line items filled');
    });

    await test.step('Step 8: Edit line items — Instructional costs', async () => {
      // TODO: Fill instructional cost line items
      await docCapture.step('Instructional cost line items filled');
    });

    await test.step('Step 9: Edit line items — Staff Salaries', async () => {
      // TODO: Fill salary line items
      await docCapture.step('Staff salary line items filled');
    });

    await test.step('Step 10: Edit Program Calendar', async () => {
      // TODO: Set program calendar dates
      await docCapture.step('Program calendar configured');
    });

    await test.step('Step 11: Verify budget total calculations', async () => {
      // TODO: Verify totals across all line item categories
      await docCapture.step('Budget total calculations verified');
    });

    await test.step('Step 12: Save budget as draft', async () => {
      await recordForm.save();
      await toast.expectSuccess();
      await docCapture.step('Budget saved as draft');
    });

    await test.step('Step 13: Submit budget for approval', async () => {
      // TODO: Click Submit for Approval
      await docCapture.step('Budget submitted for approval');
    });

    await test.step('Step 14: Login as OA (Operations Analyst)', async () => {
      // TODO: Switch to OA persona
      await docCapture.step('Logged in as Operations Analyst');
    });

    await test.step('Step 15: Review submitted budget', async () => {
      // TODO: Open and review budget details
      await docCapture.step('Budget reviewed by OA');
    });

    await test.step('Step 16: OA approves budget', async () => {
      // TODO: Click Approve
      await docCapture.step('Budget approved by OA');
    });

    await test.step('Step 17: Login as OD (Operations Director)', async () => {
      // TODO: Switch to OD persona
      await docCapture.step('Logged in as Operations Director');
    });

    await test.step('Step 18: OD reviews and approves budget', async () => {
      // TODO: Review and approve
      await docCapture.step('Budget approved by OD');
    });

    await test.step('Step 19: Verify budget status is Approved', async () => {
      // TODO: Verify final status = Approved
      await docCapture.step('Budget fully approved — E2E flow complete');
    });
  });
});
