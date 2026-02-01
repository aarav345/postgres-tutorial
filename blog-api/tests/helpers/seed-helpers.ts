import { BcryptUtil } from '../../src/common/utils/bcrypt.util';
import prisma from '../../src/database/prisma.client';
import { TestHelpers } from './test-helpers';

/**
 * Isolated test context - each test suite gets its own instance
 */
export class TestContext {
    regularToken: string = '';
    adminToken: string = '';
    regularUserId: number = 0;
    adminUserId: number = 0;
    testCategoryId: number = 0;

    // Track created resources for cleanup
    private createdPostIds: number[] = [];

    /**
     * Create test users (regular + admin)
     */
    async seedUsers() {
        const hashedPassword = await BcryptUtil.hash('Password123!');
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(7);

        const regularUser = await prisma.user.create({
        data: {
            email: `test-user-${timestamp}-${random}@example.com`,
            username: `testuser-${timestamp}-${random}`,
            password: hashedPassword,
            role: 'USER',
        },
        });

        const adminUser = await prisma.user.create({
        data: {
            email: `test-admin-${timestamp}-${random}@example.com`,
            username: `testadmin-${timestamp}-${random}`,
            password: hashedPassword,
            role: 'ADMIN',
        },
        });

        this.regularUserId = regularUser.id;
        this.adminUserId = adminUser.id;
        this.regularToken = TestHelpers.generateToken(regularUser.id, 'USER');
        this.adminToken = TestHelpers.generateToken(adminUser.id, 'ADMIN');
    }

    /**
     * Create test category
     */
    async seedCategory() {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(7);

        const category = await prisma.category.create({
        data: {
            name: `Test Category ${timestamp}`,
            slug: `test-category-${timestamp}-${random}`,
            description: 'Integration test category',
        },
        });

        this.testCategoryId = category.id;
        return category;
    }

    /**
     * Create test post
     */
    async seedPost(overrides: any = {}) {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(7);

        const post = await prisma.post.create({
        data: {
            title: overrides.title || `Test Post ${timestamp}`,
            slug: overrides.slug || `test-post-${timestamp}-${random}`,
            content: overrides.content || 'Test post content with sufficient length for validation.',
            excerpt: overrides.excerpt || 'Test excerpt',
            published: overrides.published ?? false,
            publishedAt: overrides.published ? new Date() : null,
            featured: overrides.featured ?? false,
            authorId: overrides.authorId || this.regularUserId,
            categoryId: overrides.categoryId !== undefined ? overrides.categoryId : this.testCategoryId,
            viewCount: overrides.viewCount || 0,
        },
        });

        this.createdPostIds.push(post.id);
        return post;
    }

    /**
     * Clean up posts created in this context
     */
    async cleanupPosts() {
        await prisma.post.deleteMany({
        where: {
            OR: [
            { authorId: { in: [this.regularUserId, this.adminUserId] } },
            { id: { in: this.createdPostIds } },
            ],
        },
        });
        this.createdPostIds = [];
    }

    /**
     * Full cleanup - call in afterAll
     */
    async cleanup() {
        // Clean in reverse dependency order
        await prisma.post.deleteMany({
        where: {
            authorId: { in: [this.regularUserId, this.adminUserId] },
        },
        });

        if (this.testCategoryId) {
        await prisma.category.deleteMany({
            where: { id: this.testCategoryId },
        });
        }

        await prisma.refreshToken.deleteMany({
        where: {
            userId: { in: [this.regularUserId, this.adminUserId] },
        },
        });

        await prisma.user.deleteMany({
        where: { id: { in: [this.regularUserId, this.adminUserId] } },
        });
    }
    }

    /**
     * Helper to clean entire test database (use sparingly)
     */
    export async function cleanDatabase() {
    const tables = ['Post', 'Comment', 'Like', 'PostTag', 'Tag', 'Category', 'RefreshToken', 'User'];

    for (const table of tables) {
        try {
            await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${table}" RESTART IDENTITY CASCADE;`);
        } catch (error) {
        // Table might not exist or be empty
            console.warn(`Warning: Could not truncate ${table}`);
        }
    }
}