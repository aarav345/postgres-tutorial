import prisma from '@/database/prisma.client';
import type { Category, Prisma } from '../../generated/prisma';
import { type CategoryListItem } from './interfaces/category-list-item.interface';

export class CategoriesRepository {
    async create(data: Prisma.CategoryCreateInput): Promise<Category> {
        return prisma.category.create({
            data,
        });
    }

    async findById(id: number, includePosts = false): Promise<CategoryListItem | null> {
        return prisma.category.findUnique({
        where: { id },
        include: includePosts
            ? {
                posts: {
                select: {
                    id: true,
                    title: true,
                    slug: true,
                    published: true,
                    createdAt: true,
                },
                where: {
                    published: true, // Only include published posts by default
                },
                orderBy: {
                    createdAt: 'desc',
                },
                },
                _count: {
                    select: {
                        posts: true,
                    },
                },
            }
            : {
                _count: {
                select: {
                    posts: true,
                },
                },
            },
        });
    }

    async findBySlug(slug: string, includePosts = false): Promise<Category | null> {
        return prisma.category.findUnique({
        where: { slug },
        include: includePosts
            ? {
                posts: {
                select: {
                    id: true,
                    title: true,
                    slug: true,
                    published: true,
                    createdAt: true,
                },
                where: {
                    published: true,
                },
                orderBy: {
                    createdAt: 'desc',
                },
                },
                _count: {
                    select: {
                        posts: true,
                    },
                },
            }
            : {
                _count: {
                select: {
                    posts: true,
                },
                },
            },
        });
    }

    async findByName(name: string): Promise<Category | null> {
        return prisma.category.findUnique({
            where: { name },
        });
    }

    async findByNameOrSlug(name: string, slug: string): Promise<Category | null> {
        return prisma.category.findFirst({
            where: {
                OR: [{ name }, { slug }],
            },
        });
    }

    async findAll(params: {
        skip?: number;
        take?: number;
        where?: Prisma.CategoryWhereInput;
        includePosts?: boolean;
    }) {
        const { skip = 0, take = 10, where, includePosts = false } = params;

        return prisma.category.findMany({
        skip,
        take,
        where,
        select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            createdAt: true,
            _count: {
                select: {
                    posts: true,
                },
            },
            ...(includePosts && {
            posts: {
                select: {
                    id: true,
                    title: true,
                    slug: true,
                    published: true,
                    createdAt: true,
                },
                where: {
                    published: true,
                },
                take: 5, // Limit posts per category in list view
                orderBy: {
                    createdAt: 'desc',
                },
            },
            }),
        },
        orderBy: {
            name: 'asc', // Alphabetical order for categories
        },
        });
    }

    async findAllWithPostCount(): Promise<Array<Category & { _count: { posts: number } }>
    > {
        return prisma.category.findMany({
        include: {
            _count: {
                select: {
                    posts: true,
                },
            },
        },
        orderBy: {
            name: 'asc',
        },
        });
    }

    async findPopular(limit = 10): Promise<CategoryListItem[]> {
        return prisma.category.findMany({
            take: limit,
            include: {
                _count: {
                    select: {
                        posts: true,
                    },
                },
            },
            orderBy: {
                posts: {
                    _count: 'desc',
                },
            },
        });
    }

    async count(where?: Prisma.CategoryWhereInput): Promise<number> {
        return prisma.category.count({ where });
    }

    async update(id: number, data: Prisma.CategoryUpdateInput): Promise<Category> {
        return prisma.category.update({
            where: { id },
            data,
        });
    }

    async delete(id: number): Promise<Category> {
        return prisma.category.delete({
            where: { id },
        });
    }

    async deleteMany(where: Prisma.CategoryWhereInput): Promise<Prisma.BatchPayload> {
        return prisma.category.deleteMany({
            where,
        });
    }

    // Check if category exists before creating
    async exists(name: string, slug: string): Promise<boolean> {
        const category = await prisma.category.findFirst({
            where: {
                OR: [{ name }, { slug }],
            },
        });
        return !!category;
    }

    // Get categories with at least one published post
    async findWithPublishedPosts(): Promise<Category[]> {
        return prisma.category.findMany({
        where: {
            posts: {
                some: { // some means atleast one
                    published: true,
                },
            },
        },
        include: {
            _count: {
                select: {
                    posts: true,
                },
            },
        },
        orderBy: {
            name: 'asc',
        },
        });
    }
}

export default new CategoriesRepository();