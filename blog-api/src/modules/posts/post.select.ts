import { type Prisma } from "@/generated/prisma";

const authorSelect = {
    id: true,
    username: true,
    email: true,
} as const;

const authorBasicSelect = {
    id: true,
    username: true,
} as const;

const categorySelect = {
    id: true,
    name: true,
    slug: true,
} as const;

const categoryDetailedSelect = {
    id: true,
    name: true,
    slug: true,
    description: true,
} as const;

const tagSelect = {
    tag: {
        select: {
        id: true,
        name: true,
        slug: true,
        },
    },
} as const;

const commentSelect = {
    user: {
        select: authorBasicSelect,
    },
} as const;

const countSelect = {
    comments: true,
    likes: true,
} as const;

// Base include configurations
const baseInclude = {
    author: { select: authorSelect },
    category: { select: categorySelect },
    _count: { select: countSelect },
} as const;

const fullInclude = {
    author: {
        select: {
        ...authorSelect,
        role: true,
        },
    },
    category: { select: categoryDetailedSelect },
    tags: { include: tagSelect },
    comments: {
        include: commentSelect,
        orderBy: { createdAt: 'desc' as const },
    },
    _count: { select: countSelect },
} as const;

// Select objects for different query types
const listSelect = {
    id: true,
    title: true,
    slug: true,
    excerpt: true,
    featured: true,
    published: true,
    publishedAt: true,
    createdAt: true,
    updatedAt: true,
    viewCount: true,
    author: { select: authorSelect },
    category: { select: categorySelect },
    tags: { include: tagSelect },
    _count: { select: countSelect },
} as const;

const featuredSelect = {
    id: true,
    title: true,
    slug: true,
    excerpt: true,
    featured: true,
    publishedAt: true,
    viewCount: true,
    author: { select: authorBasicSelect },
    category: { select: categorySelect },
    _count: { select: countSelect },
} as const;

const popularSelect = {
    id: true,
    title: true,
    slug: true,
    excerpt: true,
    publishedAt: true,
    viewCount: true,
    author: { select: authorBasicSelect },
    category: { select: categorySelect },
    _count: { select: countSelect },
} as const;


export const PostSelects = {
    author: authorSelect,
    authorBasic: authorBasicSelect,
    category: categorySelect,
    categoryDetailed: categoryDetailedSelect,
    tag: tagSelect,
    comment: commentSelect,
    count: countSelect,
    baseInclude,
    fullInclude,
    listSelect,
    featuredSelect,
    popularSelect,
} as const;


// Auto-generate types from selects - NO REPETITION!
export type PostListItem = Prisma.PostGetPayload<{
    select: typeof PostSelects.listSelect;
}>;

export type FeaturedPostItem = Prisma.PostGetPayload<{
    select: typeof PostSelects.featuredSelect;
}>;

export type PopularPostItem = Prisma.PostGetPayload<{
    select: typeof PostSelects.popularSelect;
}>;

export type PostWithBase = Prisma.PostGetPayload<{
    include: typeof PostSelects.baseInclude;
}>;

export type PostWithFull = Prisma.PostGetPayload<{
    include: typeof PostSelects.fullInclude;
}>;