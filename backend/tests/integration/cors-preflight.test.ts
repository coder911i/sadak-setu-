import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import type { Express } from 'express';

let app: Express;

beforeAll(async () => {
  process.env.NODE_ENV = 'production';
  delete process.env.CORS_ORIGIN;
  const { createApp } = await import('../../src/app');
  app = createApp();
});

describe('CORS preflight in production', () => {
  it('answers the login preflight from the deployed frontend origin', async () => {
    const res = await request(app)
      .options('/api/v1/auth/login')
      .set('Origin', 'https://sadak-setu.vercel.app')
      .set('Access-Control-Request-Method', 'POST')
      .set('Access-Control-Request-Headers', 'content-type');

    expect(res.status).toBe(204);
    expect(res.headers['access-control-allow-origin']).toBe('https://sadak-setu.vercel.app');
    expect(res.headers['access-control-allow-credentials']).toBe('true');
    expect(res.headers['access-control-allow-headers']).toContain('Content-Type');
  });

  it('does not send CORS headers or a 500 for a disallowed origin', async () => {
    const res = await request(app)
      .options('/api/v1/auth/login')
      .set('Origin', 'https://evil.example.com')
      .set('Access-Control-Request-Method', 'POST');

    expect(res.status).toBeLessThan(500);
    expect(res.headers['access-control-allow-origin']).toBeUndefined();
  });
});
