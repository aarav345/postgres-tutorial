import prisma from '../../database/prisma.client';
import { User, Prisma } from '../../generated/prisma';

export class UsersRepository {
  async create(data: Prisma.UserCreateInput): Promise<User> {
    return prisma.user.create({
      data,
    });
  }

  async findById(id: number): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
      include: {
        posts: {
          select: {
            id: true,
            title: true,
            slug: true,
            published: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            posts: true,
            comments: true,
            likes: true,
          },
        },
      },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  async findByUsername(username: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { username },
    });
  }

  async findByEmailOrUsername(email: string, username: string): Promise<User | null> {
    return prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });
  }

    async findAll(params: {
        skip: number;
        take: number;
        where?: Prisma.UserWhereInput;
    }) {
        const { skip, take, where } = params;
        
        return prisma.user.findMany({
        skip,
        take,
        where,
        select: {
            id: true,
            email: true,
            username: true,
            role: true,
            createdAt: true,
            updatedAt: true,
            _count: {
            select: {
                posts: true,
                comments: true,
            },
            },
        },
        orderBy: {
            createdAt: 'desc',
        },
        });
    }

  async count(where?: Prisma.UserWhereInput): Promise<number> {
    return prisma.user.count({ where });
  }

  async update(id: number, data: Prisma.UserUpdateInput): Promise<User> {
    return prisma.user.update({
      where: { id },
      data,
    });
  }

  async delete(id: number): Promise<User> {
    return prisma.user.delete({
      where: { id },
    });
  }
}

export default new UsersRepository();