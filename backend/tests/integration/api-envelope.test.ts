import { describe, it, expect } from 'vitest';
import request from 'supertest';
import createApp from '../../src/app';

describe('API Infrastructure & Standard Envelope', () => {
  const app = createApp();

  it('GET /health should return 200 with standard health status', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('UP');
    expect(res.body.data.service).toBe('sadak-setu-backend');
  });

  it('GET /api/v1/non-existent-endpoint should return 404 in standard error envelope', async () => {
    const res = await request(app).get('/api/v1/non-existent-endpoint');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBeDefined();
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});
