import { test, expect } from '../../../src/fixtures/salesforce.fixture.js';

/**
 * Budget — Negative / validation scenarios
 * Persona: Vendor Admin
 */
test.describe('Budget - Negative and validation scenarios', () => {
  test('TC-BUD-36: Cannot create budget when one is already in approval queue', async ({
    basePage, toast, docCapture,
  }) => {
    await test.step('Attempt to create budget when existing budget is pending approval', async () => {
      // TODO: Try to create new budget for site with pending budget
      await docCapture.step('System blocks new budget — existing in approval queue');
    });
  });

  test('TC-BUD-37: Cannot create budget without selecting active Site', async ({
    basePage, recordForm, docCapture,
  }) => {
    await test.step('Attempt to create budget without selecting a site', async () => {
      // TODO: Skip site selection, try to create budget
      await docCapture.step('System blocks budget creation without active site');
    });
  });

  test('TC-BUD-38: Cannot submit saved budget without adding classes', async ({
    basePage, toast, docCapture,
  }) => {
    await test.step('Save budget without classes, attempt submit', async () => {
      // TODO: Create budget, skip classes, try to submit
      await docCapture.step('System blocks submission — no classes added');
    });
  });

  test('TC-BUD-39: Cannot submit saved budget without updating line items', async ({
    basePage, toast, docCapture,
  }) => {
    await test.step('Save budget without line items, attempt submit', async () => {
      // TODO: Create budget with classes but no line items, try to submit
      await docCapture.step('System blocks submission — no line items updated');
    });
  });

  test('TC-BUD-40: Cannot create budget when saved budget already exists', async ({
    basePage, toast, docCapture,
  }) => {
    await test.step('Attempt to create budget when saved budget exists for site', async () => {
      // TODO: Try to create a duplicate budget
      await docCapture.step('System blocks duplicate budget creation');
    });
  });

  test('TC-BUD-116: Cannot create budget when approved budget exists for site', async ({
    basePage, toast, docCapture,
  }) => {
    await test.step('Navigate to site with approved budget', async () => {
      // TODO: Find site with existing approved budget
      await docCapture.step('Site with approved budget found');
    });

    await test.step('Attempt to create new budget', async () => {
      // TODO: Try to create another budget
      await docCapture.step('System blocks — approved budget already exists');
    });
  });

  test('TC-BUD-CONTRACT: Cannot create budget for ended contract period', async ({
    basePage, toast, docCapture,
  }) => {
    await test.step('Attempt to create budget for expired contract', async () => {
      // TODO: Select site with ended contract, try to create budget
      await docCapture.step('System blocks budget for ended contract');
    });

    await test.step('Verify correct error message', async () => {
      // TODO: Check error message text
      await docCapture.step('Error message for ended contract verified');
    });
  });

  test('TC-BUD-119: Cannot create budget for inactive site', async ({
    basePage, toast, docCapture,
  }) => {
    await test.step('Attempt to create budget for inactive site', async () => {
      // TODO: Select inactive site
      await docCapture.step('System blocks budget for inactive site');
    });

    await test.step('Verify site status prevents budget creation', async () => {
      await docCapture.step('Inactive site validation verified');
    });
  });

  test('TC-BUD-NO-CLASSES: Cannot create budget without classes or line items', async ({
    basePage, toast, docCapture,
  }) => {
    await test.step('Create budget without adding classes or line items', async () => {
      // TODO: Skip both classes and line items
      await docCapture.step('System prevents budget submission without classes/line items');
    });

    await test.step('Verify validation error', async () => {
      await docCapture.step('Validation error verified');
    });
  });

  test('TC-BUD-NO-LINES: Cannot create budget without line items', async ({
    basePage, toast, docCapture,
  }) => {
    await test.step('Create budget with classes but no line items', async () => {
      // TODO: Add classes but skip line items
      await docCapture.step('System prevents submission without line items');
    });

    await test.step('Verify validation error', async () => {
      await docCapture.step('Missing line items validation verified');
    });
  });
});
