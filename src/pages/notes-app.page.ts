import { expect, Page } from '@playwright/test';
import type { NoteInput } from '../api/notes-api.client';
import type { TestUser } from '../data/test-data';

export class NotesAppPage {
  constructor(readonly page: Page) {}

  async openLogin() {
    await this.page.goto('/notes/app/login');
    await expect(this.page.getByRole('heading', { name: 'Login' })).toBeVisible();
  }

  async openRegister() {
    await this.page.goto('/notes/app/register');
    await expect(this.page.getByRole('heading', { name: 'Register' })).toBeVisible();
  }

  async register(user: TestUser) {
    await this.openRegister();
    await this.page.getByTestId('register-email').fill(user.email);
    await this.page.getByTestId('register-name').fill(user.name);
    await this.page.getByTestId('register-password').fill(user.password);
    await this.page.getByTestId('register-confirm-password').fill(user.password);
    await this.page.getByTestId('register-submit').click();
    await expect(this.page.getByText('User account created successfully')).toBeVisible();
    await this.page.getByRole('link', { name: /log in/i }).click();
    await expect(this.page).toHaveURL(/\/notes\/app\/login/);
  }

  async login(user: Pick<TestUser, 'email' | 'password'>) {
    await this.openLogin();
    await this.page.getByTestId('login-email').fill(user.email);
    await this.page.getByTestId('login-password').fill(user.password);
    await this.page.getByTestId('login-submit').click();
    await expect(this.page.getByTestId('home')).toBeVisible();
  }

  async addNote(note: NoteInput) {
    await this.page.getByTestId('add-new-note').click();
    await this.page.getByTestId('note-category').selectOption(note.category);
    await this.page.getByTestId('note-title').fill(note.title);
    await this.page.getByTestId('note-description').fill(note.description);
    await this.page.getByTestId('note-submit').click();
    await expect(this.noteCard(note.title)).toBeVisible();
  }

  noteCard(title: string) {
    return this.page.getByTestId('note-card').filter({ hasText: title });
  }

  async deleteNote(title: string) {
    const card = this.noteCard(title);
    await card.getByTestId('note-delete').click();
    await this.page.getByTestId('note-delete-confirm').click();
    await expect(card).toHaveCount(0);
  }

  async logout() {
    await this.page.getByTestId('logout').click();
    await expect(this.page).toHaveURL(/\/notes\/app\/?$/);
    await expect(this.page.getByRole('heading', { name: 'Welcome to Notes App' })).toBeVisible();
  }
}
