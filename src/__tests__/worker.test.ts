import { describe, it, expect } from 'vitest';
import worker from '../src/index';

describe('axiomid-piverify Worker', () => {
  it('handles health check endpoint', async () => {
    const req = new Request('https://verify.axiomid.app/health');
    const res = await worker.fetch(req);
    expect(res.status).toBe(200);
    const json = await res.json() as { status: string };
    expect(json.status).toBe('healthy');
  });

  it('handles DID resolution request', async () => {
    const req = new Request('https://verify.axiomid.app/did:axiom:pi:test');
    const res = await worker.fetch(req);
    expect(res.status).toBe(200);
  });
});
