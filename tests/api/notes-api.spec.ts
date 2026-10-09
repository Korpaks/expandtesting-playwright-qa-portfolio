import { test, expect } from '../../src/fixtures/test';
import { uniqueText, uniqueUser } from '../../src/data/test-data';

test.describe('Notes REST API', () => {
  test('health check returns a healthy service contract', async ({ request }) => {
    const response = await request.get('/notes/api/health-check');
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toMatchObject({ success: true, status: 200 });
    expect(body.message).toMatch(/running|healthy/i);
  });

  test('registers a unique user', async ({ notesApi }) => {
    const user = uniqueUser('register');
    const { response, body } = await notesApi.register(user);
    expect(response.status()).toBe(201);
    expect(body).toMatchObject({ success: true, status: 201 });
    await notesApi.login(user.email, user.password);
  });

  test('rejects a duplicate email without exposing sensitive data', async ({ notesApi }) => {
    const user = uniqueUser('duplicate');
    await notesApi.createUser(user);
    const { response, body } = await notesApi.register(user);
    expect(response.status()).toBe(409);
    expect(body.success).toBe(false);
    expect(JSON.stringify(body)).not.toContain(user.password);
  });

  test('rejects invalid login safely', async ({ notesApi }) => {
    const { response, body } = await notesApi.login(uniqueUser().email, 'WrongPassword!9');
    expect(response.status()).toBe(401);
    expect(body.success).toBe(false);
    expect(body.data).toBeFalsy();
  });

  test('returns the authenticated profile', async ({ notesApi, registeredUser }) => {
    const { response, body } = await notesApi.profile();
    expect(response.status()).toBe(200);
    expect(body.data).toMatchObject({ email: registeredUser.email, name: registeredUser.name });
    expect(body.data).not.toHaveProperty('password');
  });

  test('creates and reads a note', async ({ notesApi, registeredUser }) => {
    const input = { title: uniqueText('api-create'), description: 'Verified through POST then GET.', category: 'Work' as const };
    const created = await notesApi.createNote(input);
    expect(created.response.status()).toBe(200);
    expect(created.body.data).toMatchObject({ ...input, completed: false });
    const fetched = await notesApi.getNote(created.body.data.id);
    expect(fetched.response.status()).toBe(200);
    expect(fetched.body.data).toMatchObject(input);
  });

  test('lists the current user notes', async ({ notesApi, registeredUser }) => {
    const title = uniqueText('api-list');
    await notesApi.createNote({ title, description: 'Isolation check', category: 'Home' });
    const { response, body } = await notesApi.getNotes();
    expect(response.status()).toBe(200);
    expect(body.data).toEqual(expect.arrayContaining([expect.objectContaining({ title })]));
  });

  test('updates title, category, and completion state', async ({ notesApi, registeredUser }) => {
    const created = await notesApi.createNote({ title: uniqueText('before'), description: 'Before update', category: 'Home' });
    const update = { title: uniqueText('after'), description: 'After update', category: 'Personal' as const, completed: true };
    const changed = await notesApi.updateNote(created.body.data.id, update);
    expect(changed.response.status()).toBe(200);
    expect(changed.body.data).toMatchObject(update);
  });

  test('deletes a note and confirms it is no longer retrievable', async ({ notesApi, registeredUser }) => {
    const created = await notesApi.createNote({ title: uniqueText('delete'), description: 'Temporary', category: 'Work' });
    const deleted = await notesApi.deleteNote(created.body.data.id);
    expect(deleted.response.status()).toBe(200);
    const missing = await notesApi.getNote(created.body.data.id);
    expect(missing.response.status()).toBe(404);
    expect(missing.body.success).toBe(false);
  });

  test('requires authentication for protected note routes', async ({ request }) => {
    const response = await request.get('/notes/api/notes');
    expect(response.status()).toBe(401);
    expect((await response.json()).success).toBe(false);
  });

  test('validates note category instead of accepting arbitrary data', async ({ request, notesApi, registeredUser }) => {
    const response = await request.post('/notes/api/notes', {
      headers: { 'x-auth-token': notesApi.token! },
      data: { title: 'Invalid category', description: 'Negative contract test', category: 'Secret' },
    });
    expect(response.status()).toBe(400);
    expect((await response.json()).success).toBe(false);
  });
});

