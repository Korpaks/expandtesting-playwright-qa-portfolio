import { test, expect } from '../../src/fixtures/test';
import { uniqueText, uniqueUser } from '../../src/data/test-data';

test.describe('React Notes user journeys', () => {
  test('registers a new user and arrives at login', async ({ notesApp, notesApi }) => {
    const user = uniqueUser('ui-register');
    await notesApp.register(user);
    await expect(notesApp.page).toHaveURL(/\/notes\/app\/login/);
    await notesApi.login(user.email, user.password);
  });

  test('shows feedback for invalid credentials', async ({ notesApp, page }) => {
    await notesApp.openLogin();
    await page.getByTestId('login-email').fill(uniqueUser().email);
    await page.getByTestId('login-password').fill('WrongPassword!9');
    await page.getByTestId('login-submit').click();
    await expect(page.getByText('Incorrect email address or password')).toBeVisible();
  });

  test('logs in and logs out', async ({ notesApp, registeredUser }) => {
    await notesApp.login(registeredUser);
    await notesApp.logout();
  });

  test('creates a note and displays its business fields', async ({ notesApp, registeredUser }) => {
    const note = { title: uniqueText('ui-note'), description: 'A meaningful browser assertion.', category: 'Work' as const };
    await notesApp.login(registeredUser);
    await notesApp.addNote(note);
    const card = notesApp.noteCard(note.title);
    await expect(card).toContainText(note.description);
    await expect(card.getByTestId('note-view')).toBeVisible();
  });

  test('deletes a note through the confirmation dialog', async ({ notesApp, registeredUser }) => {
    const note = { title: uniqueText('ui-delete'), description: 'Delete me', category: 'Personal' as const };
    await notesApp.login(registeredUser);
    await notesApp.addNote(note);
    await notesApp.deleteNote(note.title);
  });
});
