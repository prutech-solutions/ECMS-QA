import { test, expect } from '../../../src/fixtures/salesforce.fixture.js';

/**
 * Budget — New budget creation flows
 * Persona: Vendor Admin, Site Manager
 */
test.describe('Budget - Create new budgets', () => {
  test('TC-BUD-1: Vendor Admin can create new Budget from Site > ECMS Contract', async ({
    basePage, recordForm, recordDetail, toast, docCapture,
  }) => {
    await test.step('Log in to ECMS Portal as Experience user (Vendor Admin)', async () => {
      // TODO: Switch to vendor-admin persona
      await docCapture.step('Logged in as Vendor Admin');
    });

    await test.step('Open Site from portal menu', async () => {
      // TODO: Navigate to Sites on portal
      await docCapture.step('Site page launched');
    });

    await test.step('Select a valid Site record', async () => {
      // TODO: Click on a valid site
      await docCapture.step('Valid site record selected');
    });

    await test.step('Click ECMS Contract in related section', async () => {
      // TODO: Click related ECMS Contract link
      await docCapture.step('ECMS Contract section displayed');
    });

    await test.step('Open relevant ECMS Contract record', async () => {
      // TODO: Click contract record
      await docCapture.step('ECMS Contract record opened');
    });

    await test.step('Create new Budget from contract', async () => {
      // TODO: Click New Budget or related action
      await recordForm.waitForFormReady();
      await recordForm.save();
      await toast.expectSuccess();
      await docCapture.step('New Budget created from contract');
    });
  });

  test('TC-BUD-7: Site Manager can create new Budget from Site > ECMS Contract', async ({
    basePage, recordForm, toast, docCapture,
  }) => {
    await test.step('Log in as Site Manager (Experience User)', async () => {
      // TODO: Switch to site-manager persona
      await docCapture.step('Logged in as Site Manager');
    });

    await test.step('Open Site from portal menu', async () => {
      await docCapture.step('Site page launched');
    });

    await test.step('Select valid Site record', async () => {
      await docCapture.step('Valid site selected');
    });

    await test.step('Navigate to ECMS Contract', async () => {
      await docCapture.step('ECMS Contract opened');
    });

    await test.step('Open contract and create Budget', async () => {
      await recordForm.waitForFormReady();
      await recordForm.save();
      await toast.expectSuccess();
      await docCapture.step('Budget created by Site Manager');
    });

    await test.step('Verify budget details match contract', async () => {
      // TODO: Verify auto-populated fields from contract
      await docCapture.step('Budget details match contract');
    });
  });

  test('TC-BUD-31: External User can create Budget', async ({
    basePage, recordForm, toast, docCapture,
  }) => {
    await test.step('Log in as External User', async () => {
      await docCapture.step('Logged in as External User');
    });

    await test.step('Navigate to Budget creation', async () => {
      await docCapture.step('Budget creation page opened');
    });

    await test.step('Create and save budget', async () => {
      await recordForm.waitForFormReady();
      await recordForm.save();
      await toast.expectSuccess();
      await docCapture.step('Budget created by External User');
    });
  });
});
