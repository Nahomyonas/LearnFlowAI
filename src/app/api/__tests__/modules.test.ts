import { describe, it, expect } from 'vitest';
import { GET, POST } from '../course-modules/route';
import { db } from '@/db/client';
import { courses, courseBriefs } from '@/db/schema';
import { TEST_USER_ID, useCleanDatabase, createTestRequest } from './test-helpers';

describe('/api/modules', () => {
  useCleanDatabase();

  describe('GET /api/modules', () => {
    it('returns empty list when no modules exist for course', async () => {
      // Create a test course
      const [course] = await db.insert(courses).values({
        id: 'c1',
        ownerUserId: TEST_USER_ID,
        title: 'Test Course',
        slug: 'test-course',
      }).returning();

      const req = createTestRequest('GET', `http://localhost:3000/api/modules?course_id=${course.id}`);
      const res = await GET(req);
      const body = await res.json();
      
      expect(res.status).toBe(200);
      expect(body.items).toEqual([]);
    });

    it('validates course ownership', async () => {
      // Create course owned by different user
      const [course] = await db.insert(courses).values({
        id: 'c1',
        ownerUserId: 'other-user',
        title: 'Other Course',
        slug: 'other-course',
      }).returning();

      const req = createTestRequest('GET', `http://localhost:3000/api/modules?course_id=${course.id}`);
      const res = await GET(req);

      expect(res.status).toBe(403);
    });
  });

  describe('POST /api/modules', () => {
    it('creates a new module', async () => {
      // Create test course
      const [course] = await db.insert(courses).values({
        id: 'c1',
        ownerUserId: TEST_USER_ID,
        title: 'Test Course',
        slug: 'test-course',
      }).returning();

      const req = createTestRequest('POST', 'http://localhost:3000/api/modules', {
        course_id: course.id,
        title: 'New Module',
      });

      const res = await POST(req);
      const body = await res.json();

      expect(res.status).toBe(201);
      expect(body).toMatchObject({
        title: 'New Module',
        status: 'draft',
        position: 1, // First module
      });
    });

    it('validates request body', async () => {
      const req = createTestRequest('POST', 'http://localhost:3000/api/modules', {
        // Missing required course_id
        title: 'Invalid Module',
      });

      const res = await POST(req);
      const body = await res.json();

      expect(res.status).toBe(400);
      expect(body.error.code).toBe('BAD_REQUEST');
    });

    it('validates course ownership', async () => {
      // Create course owned by different user
      const [course] = await db.insert(courses).values({
        id: 'c1',
        ownerUserId: 'other-user',
        title: 'Other Course',
        slug: 'other-course',
      }).returning();

      const req = createTestRequest('POST', 'http://localhost:3000/api/modules', {
        course_id: course.id,
        title: 'New Module',
      });

      const res = await POST(req);

      expect(res.status).toBe(403);
    });
  });
});