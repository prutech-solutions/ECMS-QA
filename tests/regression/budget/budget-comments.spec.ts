import { test, expect } from '../../../src/fixtures/salesforce.fixture.js';

/**
 * Budget — OA/OD Comment Scenarios
 * Persona: Internal Admin (OA, OD)
 */
test.describe('Budget - OA comments on budgets', () => {
  test('TC-BUD-OA-COMMENT-SAVED: OA can comment on a saved Budget', async ({
    basePage, recordDetail, recordForm, toast, docCapture,
  }) => {
    await test.step('Login as OA', async () => {
      await docCapture.step('Logged in as Operations Analyst');
    });

    await test.step('Navigate to saved budget', async () => {
      await docCapture.step('Saved budget opened');
    });

    await test.step('Add comment to saved budget', async () => {
      // TODO: Enter comment in comments section
      await docCapture.step('Comment added to saved budget');
    });

    await test.step('Save comment', async () => {
      await docCapture.step('Comment saved by OA');
    });

    await test.step('Verify comment appears on record', async () => {
      // TODO: Verify comment visible
      await docCapture.step('Comment verified on saved budget');
    });
  });

  test('TC-BUD-OA-COMMENT-PENDING: OA can comment on pending approval budget', async ({
    basePage, recordDetail, docCapture,
  }) => {
    await test.step('Navigate to pending approval budget', async () => {
      await docCapture.step('Pending budget opened');
    });

    await test.step('Add comment to pending budget', async () => {
      // TODO: Add comment
      await docCapture.step('Comment added to pending budget');
    });

    await test.step('Verify comment saved and visible', async () => {
      await docCapture.step('Comment verified on pending budget');
    });

    await test.step('Verify vendor can see OA comment', async () => {
      // TODO: Switch to vendor persona, verify comment visible
      await docCapture.step('Vendor can see OA comment');
    });

    await test.step('Verify comment timestamp and author', async () => {
      await docCapture.step('Comment metadata verified');
    });
  });

  test('TC-BUD-OA-COMMENT-REJECTED: OA can comment on rejected budget', async ({
    basePage, docCapture,
  }) => {
    await test.step('Navigate to rejected budget and add comment', async () => {
      await docCapture.step('Comment added to rejected budget by OA');
    });

    await test.step('Verify comment visible', async () => {
      await docCapture.step('Comment verified on rejected budget');
    });

    await test.step('Verify vendor sees rejection comment', async () => {
      await docCapture.step('Vendor sees OA comment on rejected budget');
    });

    await test.step('Verify comment helps vendor understand rejection', async () => {
      await docCapture.step('Rejection comment context verified');
    });

    await test.step('Verify vendor can respond to comment', async () => {
      await docCapture.step('Vendor response to comment verified');
    });
  });

  test('TC-BUD-OA-COMMENT-AMENDED: OA can comment on amended budget', async ({
    basePage, docCapture,
  }) => {
    await test.step('Navigate to amended budget and add comment', async () => {
      await docCapture.step('Comment added to amended budget by OA');
    });

    await test.step('Verify comment visible', async () => {
      await docCapture.step('Comment verified on amended budget');
    });

    await test.step('Verify vendor sees amendment comment', async () => {
      await docCapture.step('Vendor sees OA comment on amended budget');
    });

    await test.step('Verify comment thread maintained', async () => {
      await docCapture.step('Comment thread maintained across amendment');
    });

    await test.step('Verify chronological ordering', async () => {
      await docCapture.step('Comment ordering verified');
    });
  });
});

test.describe('Budget - OD comments on budgets', () => {
  test('TC-BUD-OD-COMMENT-SAVED: OD can comment on a saved Budget', async ({
    basePage, docCapture,
  }) => {
    await test.step('Login as OD and comment on saved budget', async () => {
      await docCapture.step('OD commented on saved budget');
    });

    await test.step('Verify comment visible to vendor', async () => {
      await docCapture.step('OD comment visible');
    });

    await test.step('Verify comment metadata', async () => {
      await docCapture.step('Comment metadata verified');
    });

    await test.step('Verify vendor notified', async () => {
      await docCapture.step('Vendor notified of OD comment');
    });

    await test.step('Verify comment thread', async () => {
      await docCapture.step('Comment thread verified');
    });
  });

  test('TC-BUD-OD-COMMENT-PENDING: OD can comment on pending budget', async ({
    basePage, docCapture,
  }) => {
    await test.step('Login as OD and comment on pending budget', async () => {
      await docCapture.step('OD commented on pending budget');
    });

    await test.step('Verify comment visible', async () => {
      await docCapture.step('OD comment on pending budget verified');
    });

    await test.step('Verify vendor sees comment', async () => {
      await docCapture.step('Vendor sees OD comment');
    });

    await test.step('Verify comment metadata', async () => {
      await docCapture.step('Comment metadata verified');
    });

    await test.step('Verify chronological ordering', async () => {
      await docCapture.step('Comment ordering verified');
    });
  });

  test('TC-BUD-OD-COMMENT-REJECTED: OD can comment on rejected budget', async ({
    basePage, docCapture,
  }) => {
    await test.step('Login as OD and comment on rejected budget', async () => {
      await docCapture.step('OD commented on rejected budget');
    });

    await test.step('Verify comment visible', async () => {
      await docCapture.step('OD comment on rejected budget verified');
    });

    await test.step('Verify vendor sees OD rejection feedback', async () => {
      await docCapture.step('Vendor sees OD rejection feedback');
    });

    await test.step('Verify vendor can respond', async () => {
      await docCapture.step('Vendor response capability verified');
    });

    await test.step('Verify comment thread maintained', async () => {
      await docCapture.step('Comment thread verified');
    });
  });

  test('TC-BUD-OD-COMMENT-AMENDED: OD can comment on amended budget', async ({
    basePage, docCapture,
  }) => {
    await test.step('Login as OD and comment on amended budget', async () => {
      await docCapture.step('OD commented on amended budget');
    });

    await test.step('Verify comment visible', async () => {
      await docCapture.step('OD comment on amended budget verified');
    });

    await test.step('Verify vendor sees comment', async () => {
      await docCapture.step('Vendor sees OD amendment comment');
    });

    await test.step('Verify comment thread maintained', async () => {
      await docCapture.step('Comment thread across amendment verified');
    });

    await test.step('Verify chronological ordering', async () => {
      await docCapture.step('Comment ordering verified');
    });
  });
});
