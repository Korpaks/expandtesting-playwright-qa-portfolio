import { APIRequestContext, expect } from '@playwright/test';
import type { TestUser } from '../data/test-data';

export type Category = 'Home' | 'Work' | 'Personal';
export type NoteInput = { title: string; description: string; category: Category };
export type Note = NoteInput & { id: string; completed: boolean; created_at?: string; updated_at?: string };
type Envelope<T> = { success: boolean; status: number; message: string; data: T };

export class NotesApiClient {
  readonly basePath = '/notes/api';
  token?: string;

  constructor(private readonly request: APIRequestContext) {}

  private headers(): Record<string, string> {
    return this.token ? { 'x-auth-token': this.token } : {};
  }

  async register(user: TestUser) {
    const response = await this.request.post(`${this.basePath}/users/register`, { data: user });
    return { response, body: (await response.json()) as Envelope<unknown> };
  }

  async login(email: string, password: string) {
    const response = await this.request.post(`${this.basePath}/users/login`, { data: { email, password } });
    const body = (await response.json()) as Envelope<{ token: string; id: string; name: string; email: string }>;
    if (response.ok()) this.token = body.data.token;
    return { response, body };
  }

  async createUser(user: TestUser) {
    const registration = await this.register(user);
    expect(registration.response.status(), registration.body.message).toBe(201);
    const login = await this.login(user.email, user.password);
    expect(login.response.status(), login.body.message).toBe(200);
    expect(login.body.data.token).toBeTruthy();
    return login.body.data;
  }

  async profile() {
    const response = await this.request.get(`${this.basePath}/users/profile`, { headers: this.headers() });
    return { response, body: (await response.json()) as Envelope<{ id: string; name: string; email: string }> };
  }

  async createNote(note: NoteInput) {
    const response = await this.request.post(`${this.basePath}/notes`, { headers: this.headers(), data: note });
    return { response, body: (await response.json()) as Envelope<Note> };
  }

  async getNotes() {
    const response = await this.request.get(`${this.basePath}/notes`, { headers: this.headers() });
    return { response, body: (await response.json()) as Envelope<Note[]> };
  }

  async getNote(id: string) {
    const response = await this.request.get(`${this.basePath}/notes/${id}`, { headers: this.headers() });
    return { response, body: (await response.json()) as Envelope<Note> };
  }

  async updateNote(id: string, update: NoteInput & { completed: boolean }) {
    const response = await this.request.put(`${this.basePath}/notes/${id}`, { headers: this.headers(), data: update });
    return { response, body: (await response.json()) as Envelope<Note> };
  }

  async deleteNote(id: string) {
    const response = await this.request.delete(`${this.basePath}/notes/${id}`, { headers: this.headers() });
    return { response, body: (await response.json()) as Envelope<null> };
  }

  async deleteAccount() {
    if (!this.token) return;
    const response = await this.request.delete(`${this.basePath}/users/delete-account`, { headers: this.headers() });
    this.token = undefined;
    return response;
  }
}
