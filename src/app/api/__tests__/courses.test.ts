import { describe, it, expect } from 'vitest';
import { GET, POST } from '../courses/route';
import { db } from '@/db/client';
import { courses } from '@/db/schema';
import { TEST_USER_ID, useCleanDatabase, createTestRequest } from './test-helpers';

describe('/api/courses', () => {
  useCleanDatabase();

  describe('GET /api/courses', () => {
    it('returns empty list when no courses exist', async () => {
      const req = createTestRequest('GET', 'http://localhost:3000/api/courses');
      const res = await GET(req);
      const body = await res.json();
      
      expect(res.status).toBe(200);
      expect(body.items).toEqual([]);
    });

    it('returns user\'s courses filtered by status', async () => {
      // Create test courses
      await db.insert(courses).values([
        {
          id: 'c1',
          ownerUserId: TEST_USER_ID,
          title: 'Course 1',
          slug: 'course-1',
          status: 'draft',
        },
        {
          id: 'c2',
          ownerUserId: TEST_USER_ID,
          title: 'Course 2',
          slug: 'course-2',
          status: 'published',
        },
        {
          id: 'c3',
          ownerUserId: 'other-user',
          title: 'Other Course',
          slug: 'other-course',
          status: 'draft',
        },
      ]);

      // Test filtering by status
      const req = createTestRequest('GET', 'http://localhost:3000/api/courses?status=draft');
      const res = await GET(req);
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.items).toHaveLength(1);
      expect(body.items[0]).toMatchObject({
        id: 'c1',
        title: 'Course 1',
        status: 'draft',
      });
    });

    it('returns courses matching search query', async () => {
      await db.insert(courses).values([
        {
          id: 'c1',
          ownerUserId: TEST_USER_ID,
          title: 'React Basics',
          slug: 'react-basics',
          status: 'draft',
        },
        {
          id: 'c2',
          ownerUserId: TEST_USER_ID,
          title: 'Advanced TypeScript',
          slug: 'advanced-typescript',
          status: 'draft',
        },
      ]);

      const req = createTestRequest('GET', 'http://localhost:3000/api/courses?query=react');
      const res = await GET(req);
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.items).toHaveLength(1);
      expect(body.items[0]).toMatchObject({
        id: 'c1',
        title: 'React Basics',
      });
    });
  });

  describe('POST /api/courses', () => {
    it('creates a new course', async () => {
      const req = createTestRequest('POST', 'http://localhost:3000/api/courses', {
        title: 'New Course',
        summary: 'Course description',
      });

      const res = await POST(req);
      const body = await res.json();

      expect(res.status).toBe(201);
      expect(body).toMatchObject({
        slug: 'new-course',
        status: 'draft',
      });

      // Verify in database
      const [course] = await db
        .select()
        .from(courses)
        .where({ id: body.id });

      expect(course).toMatchObject({
        title: 'New Course',
        summary: 'Course description',
        ownerUserId: TEST_USER_ID,
        status: 'draft',
        visibility: 'private',
      });
    });

    it('handles duplicate slugs', async () => {
      // Create first course
      await db.insert(courses).values({
        id: 'c1',
        ownerUserId: TEST_USER_ID,
        title: 'Test Course',
        slug: 'test-course',
        status: 'draft',
      });

      // Try to create course with same title
      const req = createTestRequest('POST', 'http://localhost:3000/api/courses', {
        title: 'Test Course',
      });

      const res = await POST(req);
      const body = await res.json();

      expect(res.status).toBe(201);
      expect(body.slug).not.toBe('test-course');
      expect(body.slug).toMatch(/^test-course-[a-z0-9]{6}$/);
    });

    it('validates request body', async () => {
      const req = createTestRequest('POST', 'http://localhost:3000/api/courses', {
        // Missing required title
        summary: 'Invalid course',
      });

      const res = await POST(req);
      const body = await res.json();

      expect(res.status).toBe(400);
      expect(body.error.code).toBe('BAD_REQUEST');
    });
  });
});