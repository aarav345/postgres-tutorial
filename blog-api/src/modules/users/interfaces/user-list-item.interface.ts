import { Prisma } from '@/generated/prisma';

export type UserListItem = Prisma.UserGetPayload<{
    select: {
        id: true;
        email: true;
        username: true;
        role: true;
        createdAt: true;
        updatedAt: true;
        _count: {
        select: {
            posts: true;
            comments: true;
        };
        };
    };
}>;
