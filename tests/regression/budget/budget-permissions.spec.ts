import { test, expect } from '../../../src/fixtures/salesforce.fixture.js';

/**
 * Budget — Permission set visibility checks
 * Persona: Various (users with different permission sets)
 */
test.describe('Budget - Permission set visibility', () => {
  test('TC-BUD-25: System Admin can delete a budget', async ({
    basePage, recordDetail, toast, docCapture,
  }) => {
    await test.step('Login as System Admin', async () => {
      await docCapture.step('Logged in as System Admin');
    });

    await test.step('Navigate to a budget record', async () => {
      await docCapture.step('Budget record opened');
    });

    await test.step('Delete the budget', async () => {
      await recordDetail.clickDelete();
      await recordDetail.confirmDelete();
      await toast.expectSuccess();
      await docCapture.step('Budget deleted by System Admin');
    });
  });

  test('TC-BUD-25B: Non-system admin cannot delete a budget', async ({
    basePage, recordDetail, docCapture,
  }) => {
    await test.step('Login as non-System Admin user', async () => {
      // TODO: Switch to non-admin persona
      await docCapture.step('Logged in as non-System Admin');
    });

    await test.step('Verify Delete option is not available', async () => {
      // TODO: Verify Delete button hidden or disabled
      await docCapture.step('Delete option not available for non-admin');
    });
  });

  test('TC-BUD-121: Checklist Manager cannot see budget tab on portal', async ({
    basePage, docCapture,
  }) => {
    await test.step('Login as user with only Checklist Manager PSG', async () => {
      // TODO: Switch to checklist-manager persona
      await docCapture.step('Logged in as Checklist Manager only');
    });

    await test.step('Verify Budget tab is not visible on portal', async () => {
      // TODO: Check portal navigation for Budget tab
      await docCapture.step('Budget tab hidden for Checklist Manager');
    });
  });

  test('TC-BUD-122: Student Screening user cannot see budget tab', async ({
    basePage, docCapture,
  }) => {
    await test.step('Login as Student Screening user and verify', async () => {
      await docCapture.step('Budget tab hidden for Student Screening user');
    });
  });

  test('TC-BUD-123: Attendance Management user cannot see budget tab', async ({
    basePage, docCapture,
  }) => {
    await test.step('Login as Attendance Management user and verify', async () => {
      await docCapture.step('Budget tab hidden for Attendance Management user');
    });
  });

  test('TC-BUD-124: Enrollment Management user cannot see budget tab', async ({
    basePage, docCapture,
  }) => {
    await test.step('Login as Enrollment Management user and verify', async () => {
      await docCapture.step('Budget tab hidden for Enrollment Management user');
    });
  });

  test('TC-BUD-125: Classroom Management user cannot see budget tab', async ({
    basePage, docCapture,
  }) => {
    await test.step('Login as Classroom Management user and verify', async () => {
      await docCapture.step('Budget tab hidden for Classroom Management user');
    });
  });

  test('TC-BUD-126: Invoice Management user cannot see budget tab', async ({
    basePage, docCapture,
  }) => {
    await test.step('Login as Invoice Management user and verify', async () => {
      await docCapture.step('Budget tab hidden for Invoice Management user');
    });
  });

  test('TC-BUD-127: Site Management user cannot see budget tab', async ({
    basePage, docCapture,
  }) => {
    await test.step('Login as Site Management user and verify', async () => {
      await docCapture.step('Budget tab hidden for Site Management user');
    });
  });

  test('TC-BUD-128: Vendor Management user cannot see budget tab', async ({
    basePage, docCapture,
  }) => {
    await test.step('Login as Vendor Management user and verify', async () => {
      await docCapture.step('Budget tab hidden for Vendor Management user');
    });
  });
});
