/**
 * Tests verifying that AI_MODE=live does NOT silently fallback to mock.
 * Correction requirement: live mode must fail hard when AI service is unreachable.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// We can't easily import AiClient in isolation because it reads config at import time.
// Test the behavior by directly checking the logic — live mode must throw, not return mock data.

describe('AiClient — TASK 8 Correction: AI_MODE=live must NOT silently fallback', () => {
  it('should throw AI_SERVICE_UNAVAILABLE when live service is unreachable', async () => {
    // Simulate live mode with an unreachable service URL
    const originalMode = process.env.AI_MODE;
    const originalUrl = process.env.AI_SERVICE_URL;

    process.env.AI_MODE = 'live';
    process.env.AI_SERVICE_URL = 'http://localhost:19999'; // Nothing running here

    // Dynamic re-import to pick up new env
    vi.resetModules();
    const { AiClient } = await import('../../src/integrations/ai/ai-client');
    const client = new AiClient();

    await expect(
      client.analyzeImage('https://example.com/road.jpg', 28.6, 77.2)
    ).rejects.toMatchObject({
      code: 'AI_SERVICE_UNAVAILABLE',
      statusCode: 503,
    });

    process.env.AI_MODE = originalMode;
    process.env.AI_SERVICE_URL = originalUrl;
    vi.resetModules();
  });

  it('should NOT return MOCK_ENGINE source when AI_MODE=live', async () => {
    // Even if AI service returns 500, it should throw — not return mock data
    process.env.AI_MODE = 'live';
    process.env.AI_SERVICE_URL = 'http://localhost:19999';

    vi.resetModules();
    const { AiClient } = await import('../../src/integrations/ai/ai-client');
    const client = new AiClient();

    let threw = false;
    let result: any = null;

    try {
      result = await client.analyzeImage('https://example.com/road.jpg');
    } catch (err: any) {
      threw = true;
      // Verify it's NOT silently returning mock data
      expect(result).toBeNull();
      // Error must expose the failure, not hide it
      expect(err.code).toMatch(/AI_SERVICE/);
    }

    expect(threw).toBe(true);

    process.env.AI_MODE = undefined;
    vi.resetModules();
  });

  it('mock mode should return MOCK_ENGINE source normally', async () => {
    process.env.AI_MODE = 'mock';

    vi.resetModules();
    const { AiClient } = await import('../../src/integrations/ai/ai-client');
    const client = new AiClient();

    const result = await client.analyzeImage('https://example.com/road.jpg', 28.6, 77.2);

    // Mock mode works fine
    expect(result.source).toBe('MOCK_ENGINE');
    expect(result.detections).toBeInstanceOf(Array);
    expect(result.detections.length).toBeGreaterThan(0);

    process.env.AI_MODE = undefined;
    vi.resetModules();
  });
});
