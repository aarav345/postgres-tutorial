import prisma from '@/database/prisma.client';
import type { Post, Prisma } from '@/generated/prisma';
import { type PopularPostItem, PostSelects } from './post.select';
import { type FeaturedPostItem } from './post.select';


export class PostsRepository {
    async create(data: Prisma.PostCreateInput): Promise<Post> {
        return prisma.post.create({
        data,
            include: PostSelects.baseInclude,
        });
    }

    async findById(id: number, includeRelations = false): Promise<Post | null> {
        return prisma.post.findUnique({
            where: { id },
            include: includeRelations ? PostSelects.fullInclude : PostSelects.baseInclude,
        });
    }

    async findBySlug(slug: string, includeRelations = false): Promise<Post | null> {
        return prisma.post.findUnique({
        where: { slug },
            include: includeRelations ? PostSelects.fullInclude : PostSelects.baseInclude,
        });
    }

    async findAll(params: {
        skip?: number;
        take?: number;
        where?: Prisma.PostWhereInput;
        orderBy?: Prisma.PostOrderByWithRelationInput;
    }) {
        const { skip = 0, take = 10, where, orderBy = { createdAt: 'desc' } } = params;

        return prisma.post.findMany({
            skip,
            take,
            where,
            orderBy,
            select: PostSelects.listSelect,
        });
    }

    async findPublished(params: {
        skip?: number;
        take?: number;
        categoryId?: number;
        authorId?: number;
        search?: string;
        featured?: boolean;
    }) {
        const { skip = 0, take = 10, categoryId, authorId, search, featured } = params;

        const where: Prisma.PostWhereInput = {
            published: true,
            ...(categoryId && { categoryId }),
            ...(authorId && { authorId }),
            ...(featured !== undefined && { featured }),
            ...(search && {
                OR: [
                { title: { contains: search, mode: 'insensitive' } },
                { excerpt: { contains: search, mode: 'insensitive' } },
                { content: { contains: search, mode: 'insensitive' } },
                ],
            }),
        };

        return this.findAll({
            skip,
            take,
            where,
            orderBy: { publishedAt: 'desc' },
        });
    }

    async findByAuthor(
        authorId: number,
        params: {
        skip?: number;
        take?: number;
        published?: boolean;
        }
    ) {
        const { skip = 0, take = 10, published } = params;

        return this.findAll({
            skip,
            take,
            where: {
                authorId,
                ...(published !== undefined && { published }),
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findByCategory(
        categoryId: number,
        params: {
        skip?: number;
        take?: number;
        published?: boolean;
        }
    ) {
        const { skip = 0, take = 10, published = true } = params;

        return this.findAll({
            skip,
            take,
            where: {
                categoryId,
                published,
            },
            orderBy: { publishedAt: 'desc' },
        });
    }

    async findFeatured(limit = 5): Promise<FeaturedPostItem[]> {
        return prisma.post.findMany({
        take: limit,
        where: {
            published: true,
            featured: true,
        },
        select: PostSelects.featuredSelect,
            orderBy: {
                publishedAt: 'desc',
            },
        });
    }

    async findPopular(params: { limit?: number; days?: number }) {
        const { limit = 10, days = 30 } = params;
        const dateThreshold = new Date();
        dateThreshold.setDate(dateThreshold.getDate() - days);

        return prisma.post.findMany({
            take: limit,
            where: {
                published: true,
                publishedAt: {
                    gte: dateThreshold,
                },
            },
            select: PostSelects.popularSelect,
            orderBy: [{ viewCount: 'desc' }, { likes: { _count: 'desc' } }],
        });
    }

    async findRelated(
        postId: number,
        categoryId: number | null,
        limit = 5
    ): Promise<PopularPostItem[]> {
        if (!categoryId) {
            return [];
        }

        return prisma.post.findMany({
            take: limit,
            where: {
                published: true,
                categoryId,
                id: {
                    not: postId,
                },
            },
            select: PostSelects.popularSelect, // Same fields as popular
            orderBy: {
                publishedAt: 'desc',
            },
        });
    }

    async count(where?: Prisma.PostWhereInput): Promise<number> {
        return prisma.post.count({ where });
    }

    async update(id: number, data: Prisma.PostUpdateInput): Promise<Post> {
        return prisma.post.update({
        where: { id },
        data,
        include: PostSelects.baseInclude,
        });
    }

    async incrementViewCount(id: number): Promise<Post> {
        return prisma.post.update({
        where: { id },
        data: {
            viewCount: {
            increment: 1,
            },
        },
        });
    }

    async publish(id: number): Promise<Post> {
        return prisma.post.update({
            where: { id },
            data: {
                published: true,
                publishedAt: new Date(),
            },
            include: PostSelects.baseInclude,
        });
    }

    async unpublish(id: number): Promise<Post> {
        return prisma.post.update({
            where: { id },
            data: {
                published: false,
            },
        });
    }

    async toggleFeatured(id: number): Promise<Post> {
        const post = await this.findById(id);
        if (!post) {
            throw new Error('Post not found');
        }

        return prisma.post.update({
            where: { id },
            data: {
                featured: !post.featured,
            },
        });
    }

    async delete(id: number): Promise<Post> {
        return prisma.post.delete({
            where: { id },
        });
    }

    async deleteMany(where: Prisma.PostWhereInput): Promise<Prisma.BatchPayload> {
        return prisma.post.deleteMany({
            where,
        });
    }

    async exists(slug: string): Promise<boolean> {
        const post = await prisma.post.findUnique({
            where: { slug },
            select: { id: true },
        });
        return !!post;
    }

    async getStatistics(authorId?: number) {
        const where: Prisma.PostWhereInput = authorId ? { authorId } : {};

        const [total, published, drafts, featured] = await Promise.all([
            this.count(where),
            this.count({ ...where, published: true }),
            this.count({ ...where, published: false }),
            this.count({ ...where, featured: true }),
        ]);

        return {
            total,
            published,
            drafts,
            featured,
        };
    }
}

export default new PostsRepository();