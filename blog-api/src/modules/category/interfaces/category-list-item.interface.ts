import type { Prisma } from '@/generated/prisma';

export type CategoryListItem = Prisma.CategoryGetPayload<{
    select: {
        id: true;
        name: true;
        slug: true;
        description: true;
        createdAt: true;
        _count: {
            select: {
                posts: true;
            };
        };
    };
}>;
