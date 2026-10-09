import { test as base, expect } from '@playwright/test';
import { NotesApiClient } from '../api/notes-api.client';
import { uniqueUser, type TestUser } from '../data/test-data';
import { NotesAppPage } from '../pages/notes-app.page';

type Fixtures = {
  notesApi: NotesApiClient;
  registeredUser: TestUser;
  notesApp: NotesAppPage;
};

export const test = base.extend<Fixtures>({
  notesApi: async ({ request }, use) => {
    const client = new NotesApiClient(request);
    await use(client);
    await client.deleteAccount().catch(() => undefined);
  },
  registeredUser: async ({ notesApi }, use) => {
    const user = uniqueUser();
    await notesApi.createUser(user);
    await use(user);
  },
  notesApp: async ({ page }, use) => {
    await page.route(/(doubleclick|googlesyndication|googleadservices|admaster)\./, route => route.abort());
    await use(new NotesAppPage(page));
  },
});

export { expect };
