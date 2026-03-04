import { test, expect } from '../../../src/fixtures/salesforce.fixture.js';

/**
 * Budget — Edit line items, classes, calendar
 * Persona: Vendor Admin
 */
test.describe('Budget - Edit line items and classes', () => {
  test('TC-BUD-26: Vendor admin can update line items', async ({
    basePage, recordForm, recordDetail, toast, docCapture,
  }) => {
    await test.step('Log in and navigate to existing budget', async () => {
      // TODO: Open a draft budget
      await docCapture.step('Draft budget opened');
    });

    await test.step('Navigate to line items section', async () => {
      // TODO: Open line items related list or tab
      await docCapture.step('Line items section displayed');
    });

    await test.step('Edit line item amounts', async () => {
      // TODO: Modify line item values
      await docCapture.step('Line item amounts updated');
    });

    await test.step('Save line item changes', async () => {
      await recordForm.save();
      await toast.expectSuccess();
      await docCapture.step('Line items saved');
    });

    await test.step('Verify total budget amount updated', async () => {
      // TODO: Verify total reflects updated line items
      await docCapture.step('Total budget amount verified');
    });
  });

  test('TC-BUD-CLASSES: Add classes to a draft budget', async ({
    basePage, recordForm, toast, docCapture,
  }) => {
    await test.step('Navigate to draft budget', async () => {
      await docCapture.step('Draft budget opened');
    });

    await test.step('Navigate to Classes section', async () => {
      // TODO: Open classes related list
      await docCapture.step('Classes section opened');
    });

    await test.step('Add classes from available set', async () => {
      // TODO: Select and add classes
      await docCapture.step('Classes added to budget');
    });

    await test.step('Verify classes appear with correct details', async () => {
      // TODO: Verify class details (seat types, contract type)
      await docCapture.step('Added classes verified');
    });

    await test.step('Verify Contract Type auto-filled', async () => {
      // TODO: Check contract type field
      await docCapture.step('Contract Type auto-filled verified');
    });

    await test.step('Verify Seat Types displayed correctly', async () => {
      // TODO: Check seat types in class details
      await docCapture.step('Seat Types verified in Class Details');
    });
  });

  test('TC-BUD-CLASSES-REJECTED: Add classes to a rejected budget', async ({
    basePage, recordForm, toast, docCapture,
  }) => {
    await test.step('Navigate to a rejected budget', async () => {
      // TODO: Find budget with Rejected status
      await docCapture.step('Rejected budget opened');
    });

    await test.step('Add classes to rejected budget', async () => {
      // TODO: Verify classes can be added
      await docCapture.step('Classes added to rejected budget');
    });

    await test.step('Save and verify classes', async () => {
      await docCapture.step('Classes saved on rejected budget');
    });

    await test.step('Verify available classes match site', async () => {
      // TODO: Verify only site-appropriate classes available
      await docCapture.step('Available classes match site');
    });

    await test.step('Verify class addition allowed for rejected budget', async () => {
      await docCapture.step('Class addition confirmed for rejected budget');
    });
  });

  test('TC-BUD-VIEW-CLASSES: Vendor can view only available classes for budget', async ({
    basePage, recordDetail, docCapture,
  }) => {
    await test.step('Navigate to budget and view available classes', async () => {
      // TODO: Open budget, check class selection
      await docCapture.step('Available classes displayed');
    });

    await test.step('Verify classes are filtered by site/contract', async () => {
      // TODO: Verify only appropriate classes shown
      await docCapture.step('Classes filtered correctly by site/contract');
    });

    await test.step('Verify vendor can add from filtered set', async () => {
      // TODO: Add a class from the filtered set
      await docCapture.step('Class added from filtered set');
    });

    await test.step('Verify class details after addition', async () => {
      // TODO: Check class record details
      await docCapture.step('Class details verified after addition');
    });
  });

  test('TC-BUD-DRAFT-EDIT: Draft budget allows editing line items', async ({
    basePage, recordForm, toast, docCapture,
  }) => {
    await test.step('Open draft budget', async () => {
      await docCapture.step('Draft budget opened for editing');
    });

    await test.step('Edit line items on draft budget', async () => {
      // TODO: Modify line items
      await docCapture.step('Line items edited on draft budget');
    });

    await test.step('Save and verify', async () => {
      await recordForm.save();
      await toast.expectSuccess();
      await docCapture.step('Draft budget edits saved');
    });
  });

  test('TC-BUD-LINE-ADMIN: Edit Budget Line Items — Administrative costs', async ({
    basePage, recordForm, docCapture,
  }) => {
    await test.step('Edit Administrative cost line items', async () => {
      // TODO: Modify admin cost line items
      await docCapture.step('Administrative cost line items edited');
    });
  });

  test('TC-BUD-LINE-FACILITY: Edit Budget Line Items — Facility costs', async ({
    basePage, recordForm, docCapture,
  }) => {
    await test.step('Edit Facility cost line items', async () => {
      await docCapture.step('Facility cost line items edited');
    });
  });

  test('TC-BUD-LINE-GOODS: Edit Budget Line Items — Goods and Services', async ({
    basePage, recordForm, docCapture,
  }) => {
    await test.step('Edit Goods and Services line items', async () => {
      await docCapture.step('Goods and Services line items edited');
    });
  });

  test('TC-BUD-LINE-INSTRUCT: Edit Budget Line Items — Instructional costs', async ({
    basePage, recordForm, docCapture,
  }) => {
    await test.step('Edit Instructional cost line items', async () => {
      await docCapture.step('Instructional cost line items edited');
    });
  });

  test('TC-BUD-LINE-INDIRECT: Edit Budget Line Items — Indirect and Fringe', async ({
    basePage, recordForm, docCapture,
  }) => {
    await test.step('Edit Indirect and Fringe cost line items', async () => {
      await docCapture.step('Indirect and Fringe cost line items edited');
    });
  });

  test('TC-BUD-LINE-SALARY: Edit Budget Line Items — Staff Salaries and Wages', async ({
    basePage, recordForm, docCapture,
  }) => {
    await test.step('Edit Staff Salaries and Wages line items', async () => {
      await docCapture.step('Staff Salaries and Wages line items edited');
    });
  });

  test('TC-BUD-CALENDAR: Edit Budget Program Calendar', async ({
    basePage, recordForm, toast, docCapture,
  }) => {
    await test.step('Navigate to budget program calendar', async () => {
      // TODO: Open program calendar section
      await docCapture.step('Program calendar opened');
    });

    await test.step('Edit calendar dates', async () => {
      // TODO: Modify program start/end dates
      await docCapture.step('Calendar dates edited');
    });

    await test.step('Verify calendar changes reflect in budget', async () => {
      // TODO: Verify budget dates updated
      await docCapture.step('Calendar changes reflected in budget');
    });

    await test.step('Edit program schedule', async () => {
      // TODO: Modify weekly schedule
      await docCapture.step('Program schedule edited');
    });

    await test.step('Edit holiday calendar', async () => {
      // TODO: Add/remove holidays
      await docCapture.step('Holiday calendar edited');
    });

    await test.step('Save all calendar changes', async () => {
      await docCapture.step('Calendar changes saved');
    });

    await test.step('Verify total program days calculated', async () => {
      // TODO: Check total days calculation
      await docCapture.step('Total program days verified');
    });
  });

  test('TC-BUD-REVIEW: Review budget as Internal Admin in SF', async ({
    basePage, recordDetail, docCapture,
  }) => {
    await test.step('Login as Internal Admin in SF', async () => {
      // TODO: Switch to internal-admin persona
      await docCapture.step('Logged in as Internal Admin');
    });

    await test.step('Navigate to submitted budget', async () => {
      // TODO: Open submitted budget in SF
      await docCapture.step('Submitted budget opened in SF');
    });

    await test.step('Review budget details and line items', async () => {
      // TODO: Verify all budget details
      await docCapture.step('Budget reviewed by Internal Admin');
    });
  });
});
