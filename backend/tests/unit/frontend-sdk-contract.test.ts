import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { SadakSetuSdk, getDefaultApiBaseUrl, ApiClient } from '../../../frontend-client/src';
import { createApp } from '../../src/app';

describe('Frontend ↔ Backend Contract & Route Mapping', () => {
  const originalEnv = process.env.NEXT_PUBLIC_API_URL;

  beforeEach(() => {
    process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000/api/v1';
  });

  afterEach(() => {
    process.env.NEXT_PUBLIC_API_URL = originalEnv;
  });

  it('resolves NEXT_PUBLIC_API_URL as default base URL', () => {
    expect(getDefaultApiBaseUrl()).toBe('http://localhost:5000/api/v1');
    const sdk = new SadakSetuSdk();
    expect((sdk.client as any).baseUrl).toBe('http://localhost:5000/api/v1');
  });

  it('throws error when no base URL or NEXT_PUBLIC_API_URL is configured', () => {
    delete process.env.NEXT_PUBLIC_API_URL;
    expect(() => new ApiClient()).toThrowError(/API base URL is required/);
  });

  it('has all required frontend SDK modules wired to backend route contracts', () => {
    const sdk = new SadakSetuSdk({ baseUrl: 'http://test-server/api/v1' });

    // 1. Auth
    expect(typeof sdk.auth.login).toBe('function');
    expect(typeof sdk.auth.register).toBe('function');
    expect(typeof sdk.auth.me).toBe('function');
    expect(typeof sdk.auth.refresh).toBe('function');
    expect(typeof sdk.auth.logout).toBe('function');

    // 2. Roads & Dashboard
    expect(typeof sdk.roads.list).toBe('function');
    expect(typeof sdk.roads.getById).toBe('function');
    expect(typeof sdk.roads.create).toBe('function');
    expect(typeof sdk.roads.getHealth).toBe('function');
    expect(typeof sdk.roads.getHistory).toBe('function');
    expect(typeof sdk.roads.getInspections).toBe('function');
    expect(typeof sdk.roads.getMaintenance).toBe('function');

    // 3. Inspections
    expect(typeof sdk.inspections.list).toBe('function');
    expect(typeof sdk.inspections.getById).toBe('function');
    expect(typeof sdk.inspections.start).toBe('function');
    expect(typeof sdk.inspections.complete).toBe('function');
    expect(typeof sdk.inspections.getFusion).toBe('function');

    // 4. Media & Upload
    expect(typeof sdk.media.upload).toBe('function');
    expect(typeof sdk.media.getById).toBe('function');

    // 5. AI Inference
    expect(typeof sdk.ai.analyzeImage).toBe('function');
    expect(typeof sdk.ai.correctDamage).toBe('function');

    // 6. Maintenance & Verification
    expect(typeof sdk.maintenance.listCases).toBe('function');
    expect(typeof sdk.maintenance.getCaseById).toBe('function');
    expect(typeof sdk.maintenance.createCase).toBe('function');
    expect(typeof sdk.maintenance.assignTeam).toBe('function');
    expect(typeof sdk.maintenance.acceptCase).toBe('function');
    expect(typeof sdk.maintenance.startWork).toBe('function');
    expect(typeof sdk.maintenance.submitRepair).toBe('function');
    expect(typeof sdk.maintenance.closeCase).toBe('function');
    expect(typeof sdk.maintenance.overrideVerification).toBe('function');
    expect(typeof sdk.verification.getByCaseId).toBe('function');
    expect(typeof sdk.verification.override).toBe('function');

    // 7. Telemetry & IoT
    expect(typeof sdk.devices.list).toBe('function');
    expect(typeof sdk.devices.getById).toBe('function');
    expect(typeof sdk.devices.ingestTelemetry).toBe('function');
    expect(typeof sdk.iot.ingestTelemetry).toBe('function');

    // 8. Analytics
    expect(typeof sdk.analytics.overview).toBe('function');
    expect(typeof sdk.analytics.roads).toBe('function');
    expect(typeof sdk.analytics.damage).toBe('function');
    expect(typeof sdk.analytics.maintenance).toBe('function');
    expect(typeof sdk.analytics.verification).toBe('function');
  });

  it('verifies backend app responds to CORS preflight with proper allowed headers', async () => {
    const app = createApp();
    const server = app.listen(0);
    const address = server.address() as any;
    const port = address.port;

    try {
      const res = await fetch(`http://127.0.0.1:${port}/api/v1/auth/login`, {
        method: 'OPTIONS',
        headers: {
          Origin: 'http://localhost:5173',
          'Access-Control-Request-Method': 'POST',
          'Access-Control-Request-Headers': 'Content-Type, Authorization, X-Device-Id, X-Device-Secret',
        },
      });

      expect(res.status).toBe(204);
      expect(res.headers.get('access-control-allow-origin')).toBe('http://localhost:5173');
      expect(res.headers.get('access-control-allow-methods')).toContain('POST');
    } finally {
      server.close();
    }
  });
});
