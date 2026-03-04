import { test, expect } from '../../../src/fixtures/salesforce.fixture.js';

/**
 * Enrollment — Edit, Deactivate, Validation & Defects (TC 34–47)
 * Personas: Ravi Krishna (Vendor), Enrollment Specialist
 */
test.describe('Enrollment - Edit and management', () => {
  test('TC-ENR-34: Upload docs for submitted enrollment', async ({
    basePage, docCapture,
  }) => {
    // User: Ravi Krishna
    await test.step('Upload additional documents for submitted enrollment', async () => {
      // TODO: Upload docs on submitted enrollment record
      await docCapture.step('Documents uploaded for submitted enrollment');
    });
  });

  test('TC-ENR-35: Create enrollment for existing student', async ({
    basePage, recordForm, docCapture,
  }) => {
    // User: Ravi Krishna
    await test.step('Create new enrollment for already-existing student', async () => {
      // TODO: Search for existing student, create new enrollment
      await docCapture.step('Enrollment created for existing student');
    });
  });

  test('TC-ENR-36: Step 1 data updates preserve on Step 2', async ({
    basePage, recordForm, docCapture,
  }) => {
    // User: Ravi Krishna
    await test.step('Fill Step 1 data and navigate to Step 2', async () => {
      // TODO: Enter data in step 1, move to step 2
      await docCapture.step('Step 1 data entered');
    });

    await test.step('Navigate back to Step 1 and verify data preserved', async () => {
      // TODO: Go back to step 1, verify data not lost
      await docCapture.step('Step 1 data preserved after navigation');
    });
  });

  test('TC-ENR-38: Deactivate a record in Active status', async ({
    basePage, recordDetail, toast, docCapture,
  }) => {
    // User: Ravi Krishna
    await test.step('Find active enrollment and deactivate', async () => {
      // TODO: Open active enrollment, click Deactivate
      await docCapture.step('Active enrollment deactivated');
    });
  });

  test('TC-ENR-39: View record after deactivation', async ({
    basePage, recordDetail, docCapture,
  }) => {
    await test.step('View deactivated enrollment record', async () => {
      // TODO: Verify status changed and fields updated
      await docCapture.step('Deactivated enrollment record viewed');
    });
  });
});

test.describe('Enrollment - Defect validations', () => {
  test('TC-ENR-40: Info request on submitted enrollment shows on portal', async ({
    basePage, docCapture,
  }) => {
    await test.step('Verify information request appears on vendor portal', async () => {
      // TODO: Check portal shows info request from specialist
      await docCapture.step('Information request visible on portal');
    });
  });

  test('TC-ENR-41: Admission Date field showing blank', async ({
    basePage, recordDetail, docCapture,
  }) => {
    await test.step('Verify Admission Date field on enrollment screen', async () => {
      // TODO: Check if Admission Date field is blank (defect)
      await docCapture.step('Admission Date field behavior documented');
    });
  });

  test('TC-ENR-42: Inactive to Active update clears Discharge Date', async ({
    basePage, recordDetail, docCapture,
  }) => {
    await test.step('Update enrollment from Inactive to Active', async () => {
      // TODO: Change status from Inactive to Active
      await docCapture.step('Status changed from Inactive to Active');
    });

    await test.step('Verify Discharge Date is blank', async () => {
      // TODO: Verify Discharge Date cleared
      await docCapture.step('Discharge Date cleared on reactivation');
    });
  });

  test('TC-ENR-43: First date of attendance before DOB validation', async ({
    basePage, recordForm, docCapture,
  }) => {
    await test.step('Attempt to set first date of attendance before DOB', async () => {
      // TODO: Enter invalid date
      await docCapture.step('First date of attendance before DOB behavior documented');
    });
  });

  test('TC-ENR-44: Vendor unable to navigate back after DOB validation error', async ({
    basePage, docCapture,
  }) => {
    await test.step('Trigger DOB validation error', async () => {
      // TODO: Enter invalid DOB
      await docCapture.step('DOB validation error triggered');
    });

    await test.step('Attempt to navigate back to previous step', async () => {
      // TODO: Click Back button
      await docCapture.step('Back navigation behavior after DOB error documented');
    });
  });

  test('TC-ENR-45: Vendor unable to navigate back after DOB validation (variant)', async ({
    basePage, docCapture,
  }) => {
    await test.step('Test alternate DOB validation navigation scenario', async () => {
      // TODO: Different flow variant of TC-44
      await docCapture.step('DOB validation navigation variant documented');
    });
  });

  test('TC-ENR-46: Error when trying to Mark as Complete/Current Status', async ({
    basePage, toast, docCapture,
  }) => {
    await test.step('Attempt to mark enrollment as Complete or Current', async () => {
      // TODO: Click Mark as Complete/Current Status
      await docCapture.step('Mark status error behavior documented');
    });
  });

  test('TC-ENR-47: Student Birthdate and Program Type eligibility validation', async ({
    basePage, recordForm, docCapture,
  }) => {
    await test.step('Enter student birthdate and select program type', async () => {
      // TODO: Enter DOB that doesn't match program eligibility
      await docCapture.step('Birthdate and program type entered');
    });

    await test.step('Verify eligibility validation', async () => {
      // TODO: Check for validation message about age/program mismatch
      await docCapture.step('Eligibility validation behavior documented');
    });
  });
});
