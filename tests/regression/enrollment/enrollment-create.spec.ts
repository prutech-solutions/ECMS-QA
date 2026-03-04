import { test, expect } from '../../../src/fixtures/salesforce.fixture.js';

/**
 * Enrollment — Create Student Enrollment Flow (TC 8–24)
 * Persona: Ravi Krishna (Vendor)
 */
test.describe('Enrollment - Create student enrollment', () => {
  test('TC-ENR-8: Student Enrollment tab visible on portal', async ({
    basePage, docCapture,
  }) => {
    await test.step('Navigate to Student Enrollment on portal', async () => {
      // TODO: Navigate to Student Enrollment tab on Experience Cloud
      await docCapture.step('Student Enrollment tab visible and accessible');
    });
  });

  test('TC-ENR-9: Create a new student enrollment', async ({
    basePage, recordForm, docCapture,
  }) => {
    await test.step('Click New to create enrollment', async () => {
      // TODO: Click New Student Enrollment
      await recordForm.waitForFormReady();
      await docCapture.step('New enrollment form opened');
    });
  });

  test('TC-ENR-10: Fill Student Information', async ({
    basePage, recordForm, docCapture,
  }) => {
    await test.step('Fill student information fields', async () => {
      // TODO: Fill first name, last name, DOB, gender, etc.
      await docCapture.step('Student information filled');
    });
  });

  test('TC-ENR-11: Student Information validations', async ({
    basePage, recordForm, docCapture,
  }) => {
    await test.step('Verify required field validations on student info', async () => {
      // TODO: Test required field validation, date formats, etc.
      await docCapture.step('Student info validations verified');
    });
  });

  test('TC-ENR-12: Fill Parents Information', async ({
    basePage, recordForm, docCapture,
  }) => {
    await test.step('Fill parent/guardian information', async () => {
      // TODO: Fill parent name, phone, email, address
      await docCapture.step('Parent information filled');
    });
  });

  test('TC-ENR-13: Parents info validation', async ({
    basePage, recordForm, docCapture,
  }) => {
    await test.step('Verify parent info validations', async () => {
      // TODO: Test parent field validations
      await docCapture.step('Parent info validations verified');
    });
  });

  test('TC-ENR-14: Enrollment Information Requested', async ({
    basePage, recordForm, docCapture,
  }) => {
    await test.step('Fill enrollment-specific information', async () => {
      // TODO: Fill program type, start date, site, class
      await docCapture.step('Enrollment information filled');
    });
  });

  test('TC-ENR-15: Enrollment info — Related Class Creation', async ({
    basePage, recordForm, docCapture,
  }) => {
    await test.step('Select/create related class for enrollment', async () => {
      // TODO: Select class from available classes
      await docCapture.step('Related class created/selected for enrollment');
    });
  });

  test('TC-ENR-16: Create new enrollment for existing student', async ({
    basePage, recordForm, docCapture,
  }) => {
    await test.step('Create enrollment for student that already exists in system', async () => {
      // TODO: Search for existing student, create new enrollment
      await docCapture.step('New enrollment created for existing student');
    });
  });

  test('TC-ENR-17: SAVE Enrollment', async ({
    basePage, recordForm, toast, docCapture,
  }) => {
    await test.step('Save enrollment as draft', async () => {
      // TODO: Click Save (not Submit)
      await docCapture.step('Enrollment saved as draft');
    });
  });

  test('TC-ENR-18: EDIT Enrollment', async ({
    basePage, recordForm, recordDetail, docCapture,
  }) => {
    await test.step('Edit a saved enrollment', async () => {
      // TODO: Open saved enrollment, edit fields
      await docCapture.step('Enrollment edited');
    });
  });

  test('TC-ENR-19: Finish Enrollment', async ({
    basePage, recordForm, docCapture,
  }) => {
    await test.step('Complete all enrollment steps', async () => {
      // TODO: Navigate through all steps and complete
      await docCapture.step('Enrollment flow completed');
    });
  });

  test('TC-ENR-20: View Submitted Enrollment', async ({
    basePage, recordDetail, docCapture,
  }) => {
    await test.step('Submit enrollment', async () => {
      // TODO: Submit the enrollment
      await docCapture.step('Enrollment submitted');
    });

    await test.step('View submitted enrollment details', async () => {
      // TODO: Verify all submitted data is correct
      await docCapture.step('Submitted enrollment details verified');
    });
  });

  test('TC-ENR-22: View Submitted Enrollment Status', async ({
    basePage, recordDetail, docCapture,
  }) => {
    await test.step('Verify enrollment status shows as Submitted', async () => {
      // TODO: Check status field
      await docCapture.step('Enrollment status shows Submitted');
    });
  });

  test('TC-ENR-23: Upload Documents for enrollment', async ({
    basePage, docCapture,
  }) => {
    await test.step('Upload required documents', async () => {
      // TODO: Upload birth certificate, proof of address, etc.
      await docCapture.step('Documents uploaded for enrollment');
    });
  });

  test('TC-ENR-24: Submit Enrollment for approval', async ({
    basePage, toast, docCapture,
  }) => {
    await test.step('Submit enrollment for specialist review', async () => {
      // TODO: Click Submit for Approval
      await docCapture.step('Enrollment submitted for approval');
    });
  });
});
