import { db } from '@/db/client';
import { courses, courseBriefs, briefEvents } from '@/db/schema';
import { beforeEach, afterEach, vi } from 'vitest';

// Mock auth
export const TEST_USER_ID = 'test-user-123';
vi.mock('@/lib/auth', () => ({
  requireUserId: vi.fn().mockResolvedValue(TEST_USER_ID),
}));

// Clean database between tests
export function useCleanDatabase() {
  beforeEach(async () => {
    await db.delete(briefEvents);
    await db.delete(courses);
    await db.delete(courseBriefs);
  });

  afterEach(async () => {
    await db.delete(briefEvents);
    await db.delete(courses);
    await db.delete(courseBriefs);
  });
}

// Helper to create test Request objects
export function createTestRequest(method: string, url: string, body?: any): Request {
  const reqInit: RequestInit = {
    method,
    headers: { 'content-type': 'application/json' },
  };
  
  if (body) {
    reqInit.body = JSON.stringify(body);
  }
  
  return new Request(new URL(url, 'http://localhost:3000'), reqInit);
}