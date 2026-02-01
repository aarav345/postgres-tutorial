import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../src/app';
import prisma from '../../src/database/prisma.client';
import { PostHelpers } from '../helpers/posts-helpers';
import { TestContext } from '../helpers/seed-helpers';

describe('Posts Integration Tests', () => {
    const ctx = new TestContext(); // ✅ Isolated context

    beforeAll(async () => {
        await ctx.seedUsers();
        await ctx.seedCategory();
    });

    afterAll(async () => {
        await ctx.cleanup();
        await prisma.$disconnect();
    });

    beforeEach(async () => {
        await ctx.cleanupPosts();
    });

    describe('POST /api/v1/posts', () => {
        it('should create a draft post successfully', async () => {
            const body = PostHelpers.mockCreatePostDto({
                title: 'Test Draft Post',
                slug: undefined, // Let it auto-generate
                published: false,
                categoryId: ctx.testCategoryId,
            });

            const res = await request(app)
                .post('/api/v1/posts')
                .set('Authorization', `Bearer ${ctx.regularToken}`)
                .send(body);

            expect(res.status).toBe(201);
            expect(res.body.data.published).toBe(false);
            expect(res.body.data.publishedAt).toBeNull();
        });

        it('should create a published post with publishedAt', async () => {
            const body = PostHelpers.mockCreatePostDto({
                title: 'Published Post',
                published: true,
                categoryId: ctx.testCategoryId,
            });

            const res = await request(app)
                .post('/api/v1/posts')
                .set('Authorization', `Bearer ${ctx.regularToken}`)
                .send(body);

            expect(res.status).toBe(201);
            expect(res.body.data.published).toBe(true);
            expect(res.body.data.publishedAt).not.toBeNull();
        });
    });

    describe('DELETE /api/v1/posts/:id', () => {
        it('should allow author to delete own post', async () => {
        const post = await ctx.seedPost({ slug: 'delete-test' });

        const res = await request(app)
            .delete(`/api/v1/posts/${post.id}`)
            .set('Authorization', `Bearer ${ctx.regularToken}`);

        expect(res.status).toBe(200);

        const deleted = await prisma.post.findUnique({ where: { id: post.id } });
        expect(deleted).toBeNull();
        });

        it('should return 403 when non-author tries to delete', async () => {
        const post = await ctx.seedPost({ authorId: ctx.adminUserId });

        const res = await request(app)
            .delete(`/api/v1/posts/${post.id}`)
            .set('Authorization', `Bearer ${ctx.regularToken}`);

        expect(res.status).toBe(403);
        });
    });
});