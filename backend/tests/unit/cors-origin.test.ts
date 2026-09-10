import { describe, it, expect } from 'vitest';
import { parseCorsOrigins, isOriginAllowed, normalizeOrigin } from '../../src/config';

describe('CORS origin configuration', () => {
  it('trims whitespace and trailing slashes from configured origins', () => {
    const origins = parseCorsOrigins(' https://app.example.com/ , https://admin.example.com ', 'production');
    expect(origins).toContain('https://app.example.com');
    expect(origins).toContain('https://admin.example.com');
  });

  it('always allows the deployed frontend origin, even when CORS_ORIGIN is unset', () => {
    const origins = parseCorsOrigins(undefined, 'production');
    expect(isOriginAllowed('https://sadak-setu.vercel.app', origins)).toBe(true);
  });

  it('allows the deployed frontend origin when CORS_ORIGIN lists unrelated values', () => {
    const origins = parseCorsOrigins('http://localhost:3000', 'production');
    expect(isOriginAllowed('https://sadak-setu.vercel.app', origins)).toBe(true);
  });

  it('excludes localhost origins from the production defaults', () => {
    const origins = parseCorsOrigins(undefined, 'production');
    expect(isOriginAllowed('http://localhost:5173', origins)).toBe(false);
  });

  it('matches wildcard patterns for Vercel preview deployments', () => {
    const origins = parseCorsOrigins(undefined, 'production');
    expect(isOriginAllowed('https://sadak-setu-git-main-koijn.vercel.app', origins)).toBe(true);
    expect(isOriginAllowed('https://evil.com', origins)).toBe(false);
  });

  it('does not let a wildcard span subdomain boundaries', () => {
    expect(isOriginAllowed('https://sadak-setu-x.attacker.vercel.app', ['https://sadak-setu-*.vercel.app'])).toBe(false);
  });

  it('normalizes origins case-insensitively', () => {
    expect(normalizeOrigin('HTTPS://Sadak-Setu.Vercel.App/')).toBe('https://sadak-setu.vercel.app');
  });
});
