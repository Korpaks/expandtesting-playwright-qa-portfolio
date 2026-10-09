import { randomUUID } from 'node:crypto';

export type TestUser = { name: string; email: string; password: string };

export function uniqueUser(prefix = 'pw-portfolio'): TestUser {
  const id = randomUUID().replaceAll('-', '').slice(0, 16);
  return {
    name: `Playwright ${id.slice(0, 6)}`,
    email: `${prefix}-${id}@example.com`,
    password: `Pw!${id}Aa9`,
  };
}

export function uniqueText(prefix: string): string {
  return `${prefix}-${randomUUID().slice(0, 8)}`;
}
