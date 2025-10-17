import { describe, it, expect } from 'vitest';
import { GET, POST } from '../course-briefs/route';
import { db } from '@/db/client';
import { courseBriefs } from '@/db/schema';
import { TEST_USER_ID, useCleanDatabase, createTestRequest } from './test-helpers';

describe('/api/course-briefs', () => {
  useCleanDatabase();

  describe('GET /api/course-briefs', () => {
    it('returns empty list when no briefs exist', async () => {
      const req = createTestRequest('GET', 'http://localhost:3000/api/course-briefs');
      const res = await GET(req);
      const body = await res.json();
      
      expect(res.status).toBe(200);
      expect(body.items).toEqual([]);
    });

    it('returns user\'s briefs', async () => {
      await db.insert(courseBriefs).values([
        {
          id: 'b1',
          ownerUserId: TEST_USER_ID,
          source: 'manual',
          modeState: 'collecting',
          topic: 'Brief 1',
        },
        {
          id: 'b2',
          ownerUserId: 'other-user',
          source: 'manual',
          modeState: 'collecting',
          topic: 'Other Brief',
        },
      ]);

      const req = createTestRequest('GET', 'http://localhost:3000/api/course-briefs');
      const res = await GET(req);
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.items).toHaveLength(1);
      expect(body.items[0]).toMatchObject({
        id: 'b1',
        topic: 'Brief 1',
      });
    });
  });

  describe('POST /api/course-briefs', () => {
    it('creates a new brief', async () => {
      const req = createTestRequest('POST', 'http://localhost:3000/api/course-briefs', {
        source: 'manual',
        topic: 'New Brief',
      });

      const res = await POST(req);
      const body = await res.json();

      expect(res.status).toBe(201);
      expect(body).toMatchObject({
        topic: 'New Brief',
        source: 'manual',
        mode_state: 'collecting',
      });

      // Verify in database
      const [brief] = await db
        .select()
        .from(courseBriefs)
        .where({ id: body.id });

      expect(brief).toMatchObject({
        topic: 'New Brief',
        ownerUserId: TEST_USER_ID,
        source: 'manual',
        modeState: 'collecting',
      });
    });

    it('validates request body', async () => {
      const req = createTestRequest('POST', 'http://localhost:3000/api/course-briefs', {
        // Missing required source
        topic: 'Invalid Brief',
      });

      const res = await POST(req);
      const body = await res.json();

      expect(res.status).toBe(400);
      expect(body.error.code).toBe('BAD_REQUEST');
    });
  });
});