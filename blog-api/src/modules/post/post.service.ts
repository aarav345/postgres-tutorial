import type  { Post, Prisma } from '@/generated/prisma';
import PostsRepository from './post.repository';
import { type CreatePostDto } from './dto/create-post.dto.js';
import { type UpdatePostDto } from './dto/update-post.dto.js';
import { slugify } from '@/common/utils/slugify.util';
import { AlreadyExistsError, AppError, NotFoundError } from '@/common/errors/app.error';
import type { 
    FeaturedPostItem, 
    PopularPostItem,
} from './post.select';
import { MESSAGES } from '@/common/constants/messages.constant';

export class PostsService {
    async create(data: CreatePostDto, authorId: number): Promise<Post> {
        // Generate slug from title if not provided
        const slug = data.slug || slugify(data.title);

        // Check if post with same slug already exists
        const existing = await PostsRepository.exists(slug);
        if (existing) {
            throw new AlreadyExistsError(MESSAGES.POST.ALREADY_EXISTS);
        }

        // If publishing, set publishedAt
        const publishedAt = data.published ? new Date() : null;

        return PostsRepository.create({
            title: data.title,
            slug,
            content: data.content,
            excerpt: data.excerpt,
            featured: data.featured || false,
            published: data.published || false,
            publishedAt,
            author: {
                connect: { id: authorId },
            },
            ...(data.categoryId && {
                    category: {
                    connect: { id: data.categoryId },
                },
            }),
        });
    }

    async findById(id: number, includeRelations = false): Promise<Post> {
        const post = await PostsRepository.findById(id, includeRelations);

        if (!post) {
            throw new NotFoundError(MESSAGES.POST.NOT_FOUND);
        }

        return post;
    }

    async findBySlug(slug: string, includeRelations = false): Promise<Post> {
        const post = await PostsRepository.findBySlug(slug, includeRelations);

        if (!post) {
            throw new NotFoundError(MESSAGES.POST.NOT_FOUND);
        }

        return post;
    }

    async findAll(params: {
        page?: number;
        limit?: number;
        search?: string;
        categoryId?: number;
        authorId?: number;
        published?: boolean;
        featured?: boolean;
    }) {
        const page = params.page || 1;
        const limit = params.limit || 10;
        const skip = (page - 1) * limit;

        const where: Prisma.PostWhereInput = {
            ...(params.published !== undefined && { published: params.published }),
            ...(params.categoryId && { categoryId: params.categoryId }),
            ...(params.authorId && { authorId: params.authorId }),
            ...(params.featured !== undefined && { featured: params.featured }),
            ...(params.search && {
                OR: [
                    { title: { contains: params.search, mode: 'insensitive' } },
                    { excerpt: { contains: params.search, mode: 'insensitive' } },
                    { content: { contains: params.search, mode: 'insensitive' } },
                ],
            }),
        };

        const [posts, total] = await Promise.all([
            PostsRepository.findAll({
                skip,
                take: limit,
                where,
                orderBy: params.published 
                    ? { publishedAt: 'desc' }
                    : { createdAt: 'desc' },
            }),
            PostsRepository.count(where),
        ]);

        return {
            data: posts,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
                hasNext: page < Math.ceil(total / limit),
                hasPrev: page > 1,
            },
        };
    }

    async findPublished(params: {
        page?: number;
        limit?: number;
        search?: string;
        categoryId?: number;
        authorId?: number;
        featured?: boolean;
    }) {
        const page = params.page || 1;
        const limit = params.limit || 10;
        const skip = (page - 1) * limit;

        const [posts, total] = await Promise.all([
            PostsRepository.findPublished({
                skip,
                take: limit,
                categoryId: params.categoryId,
                authorId: params.authorId,
                search: params.search,
                featured: params.featured,
            }),
            PostsRepository.count({
                    published: true,
                    ...(params.categoryId && { categoryId: params.categoryId }),
                    ...(params.authorId && { authorId: params.authorId }),
                    ...(params.featured !== undefined && { featured: params.featured }),
                    ...(params.search && {
                    OR: [
                        { title: { contains: params.search, mode: 'insensitive' } },
                        { excerpt: { contains: params.search, mode: 'insensitive' } },
                        { content: { contains: params.search, mode: 'insensitive' } },
                    ],
                }),
            }),
        ]);

        return {
        data: posts,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            hasNext: page < Math.ceil(total / limit),
            hasPrev: page > 1,
        },
        };
    }

    async findByAuthor(
        authorId: number,
        params: {
        page?: number;
        limit?: number;
        published?: boolean;
        }
    ) {
        const page = params.page || 1;
        const limit = params.limit || 10;
        const skip = (page - 1) * limit;

        const [posts, total] = await Promise.all([
        PostsRepository.findByAuthor(authorId, {
            skip,
            take: limit,
            published: params.published,
        }),
        PostsRepository.count({
            authorId,
            ...(params.published !== undefined && { published: params.published }),
        }),
        ]);

        return {
        data: posts,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            hasNext: page < Math.ceil(total / limit),
            hasPrev: page > 1,
        },
        };
    }

    async findByCategory(
        categoryId: number,
        params: {
        page?: number;
        limit?: number;
        published?: boolean;
        }
    ) {
        const page = params.page || 1;
        const limit = params.limit || 10;
        const skip = (page - 1) * limit;

        const [posts, total] = await Promise.all([
            PostsRepository.findByCategory(categoryId, {
                skip,
                take: limit,
                published: params.published,
            }),
            PostsRepository.count({
                categoryId,
                ...(params.published !== undefined && { published: params.published }),
            }),
        ]);

        return {
            data: posts,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
                hasNext: page < Math.ceil(total / limit),
                hasPrev: page > 1,
            },
        };
    }

    async findFeatured(limit = 5): Promise<FeaturedPostItem[]> {
        return PostsRepository.findFeatured(limit);
    }

    async findPopular(params: { limit?: number; days?: number }): Promise<PopularPostItem[]> {
        return PostsRepository.findPopular(params);
    }

    async findRelated(postId: number, categoryId: number | null, limit = 5): Promise<PopularPostItem[]> {
        return PostsRepository.findRelated(postId, categoryId, limit);
    }

    async update(
        id: number,
        data: UpdatePostDto,
        userId: number,
        userRole: string
    ): Promise<Post> {
        // Check if post exists
        const existing = await PostsRepository.findById(id);
        if (!existing) {
            throw new NotFoundError(MESSAGES.POST.NOT_FOUND);
        }

        // Authorization: Only author or admin can update
        if (existing.authorId !== userId && userRole !== 'ADMIN') {
            throw new AppError(MESSAGES.POST.NOT_AUTHORIZED_UPDATE, 403);
        }

        // If slug is being updated, check for conflicts
        if (data.slug && data.slug !== existing.slug) {
            const slugExists = await PostsRepository.exists(data.slug);
            if (slugExists) {
                throw new AlreadyExistsError(MESSAGES.POST.ALREADY_EXISTS);
            }
        }

        // Generate new slug if title is updated but slug is not provided
        const slug = data.slug || (data.title ? slugify(data.title) : existing.slug);

        // If publishing for the first time, set publishedAt
        const publishedAt = data.published && !existing.published ? new Date() : existing.publishedAt;

        return PostsRepository.update(id, {
            ...(data.title && { title: data.title }),
            ...(data.slug && { slug }),
            ...(data.content && { content: data.content }),
            ...(data.excerpt !== undefined && { excerpt: data.excerpt }),
            ...(data.featured !== undefined && { featured: data.featured }),
            ...(data.published !== undefined && { 
                published: data.published,
                publishedAt,
            }),
            ...(data.categoryId !== undefined && {
                category: data.categoryId
                ? { connect: { id: data.categoryId } }
                : { disconnect: true },
            }),
        });
    }

    async delete(id: number, userId: number, userRole: string): Promise<Post> {
        const post = await PostsRepository.findById(id);
        if (!post) {
            throw new NotFoundError(MESSAGES.POST.NOT_FOUND);
        }

        // Authorization: Only author or admin can delete
        if (post.authorId !== userId && userRole !== 'ADMIN') {
            throw new AppError(MESSAGES.POST.NOT_AUTHORIZED_DELETE, 403);
        }

        return PostsRepository.delete(id);
    }

    async publish(id: number, userId: number, userRole: string): Promise<Post> {
        const post = await PostsRepository.findById(id);
        if (!post) {
            throw new NotFoundError(MESSAGES.POST.NOT_FOUND);
        }

        // Authorization: Only author or admin can publish
        if (post.authorId !== userId && userRole !== 'ADMIN') {
            throw new AppError(MESSAGES.POST.NOT_AUTHORIZED_PUBLISH, 403);
        }

        if (post.published) {
            throw new AppError(MESSAGES.POST.POST_ALREADY_PUBLISHED, 400);
        }

        return PostsRepository.publish(id);
    }

    async unpublish(id: number, userId: number, userRole: string): Promise<Post> {
        const post = await PostsRepository.findById(id);
        if (!post) {
            throw new NotFoundError(MESSAGES.POST.NOT_FOUND);
        }

        // Authorization: Only author or admin can unpublish
        if (post.authorId !== userId && userRole !== 'ADMIN') {
            throw new AppError(MESSAGES.POST.NOT_AUTHORIZED_UNPUBLISH, 403);
        }

        if (!post.published) {
            throw new AppError(MESSAGES.POST.POST_ALREADY_UNPUBLISHED, 400);
        }

        return PostsRepository.unpublish(id);
    }

    async toggleFeatured(id: number): Promise<Post> {
        const post = await PostsRepository.findById(id);
        if (!post) {
            throw new NotFoundError(MESSAGES.POST.NOT_FOUND);
        }

        return PostsRepository.toggleFeatured(id);
    }

    async incrementViewCount(id: number): Promise<Post> {
        return PostsRepository.incrementViewCount(id);
    }

    async getStatistics(authorId?: number) {
        return PostsRepository.getStatistics(authorId);
    }
}

export default new PostsService();