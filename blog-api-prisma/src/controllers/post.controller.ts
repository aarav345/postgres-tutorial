import { Request, Response } from 'express';
import prisma from '../lib/prisma';


export class PostController {
    static async getAllPosts(req: Request, res: Response) {
        try {
            const { page = '1', limit = '10', search, published } = req.query;

            const skip = (Number(page) - 1) * Number(limit);

            const where: any = {};

            // WHERE title ILIKE '%search%' OR content ILIKE '%search%' -- case insensitive since ILIKE
            if (search) {
                where.OR = [
                    {title: { contains: search as string, mode: 'insensitive' }},
                    {content: { contains: search as string, mode: 'insensitive' }}
                ];
            } 

            if (published !== undefined) {
                where.published = published === 'true'; // published comes as "true" or "false" (string) --> Convert it to boolean
            }


            // Running DB queries in parallel improves performance
            const [posts, total] = await Promise.all([
                prisma.post.findMany({
                    where,
                    // LIMIT 10 OFFSET 10
                    skip,
                    take: Number(limit),

                    // This avoids N+1 queries.
                    include: {
                        author: {
                            select: { id: true, username: true, email: true},
                        },
                        category: true,
                        _count: {
                            select: { comments: true, likes: true},
                        },
                    },
                    orderBy: { createdAt: 'desc' },
                }),
                prisma.post.count({ where })
            ]);

            res.json({
                posts,
                pagination: {
                    total,
                    page: Number(page),
                    limit: Number(limit),
                    totalPages: Math.ceil(total / Number(limit))
                }
            })
        } catch (error) {
            res.status(500).json({error: 'Failed to fetch posts'})
        }
    }


     // GET /api/posts/:id
    static async getPostById(req: Request, res: Response) {
        try {
            const { id } = req.params;

            const post = await prisma.post.findMany({
                where: { id: Number(id) },
                include: {
                    author: {
                        select: { id: true, username: true, email: true},
                    },
                    category: true,
                    comments: {
                        include: {
                            author: {
                                select: { username: true},
                            },
                        },
                        orderBy: { createdAt: 'desc' },
                    },
                    tags: {
                        include: {
                            tag: true
                        },
                    },
                    _count: {
                        select: { likes: true},
                    }
                }
            });

            if (!post) {
                return res.status(404).json({ error: 'Post not found' });
            }

             // Increment view count
            await prisma.post.update({
                where: { id: Number(id) },
                data: { viewCount: { increment: 1 } },
            });

            res.json(post);
            
        } catch(error) {
            res.status(500).json({ error: 'Failed to fetch post' });
        }
    }


    // POST /api/posts
    /*
    Post (id=10)
    |
    | creates
    v
    PostTag (post_id=10, tag_id=2)
    PostTag (post_id=10, tag_id=5)
    |
    | connects to
    v
    Tag (id=2)
    Tag (id=5)

    */

    static async createPost(req: Request, res: Response) {
        try {
            const { title, content, categoryId, tags } = req.body;
            const authorId = (req as any).userId; // req.user.id

            // Generate slug from title
            const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

            const post = await prisma.post.create({
                data: {
                    title: title,
                    slug: slug,
                    content: content,
                    authorId: authorId,
                    categoryId: categoryId ?? null,
                    // creates rows in the post_tags join table, connecting the newly created post to existing tags using their IDs, all in one transaction.
                    tags: tags
                        ? {
                            create: tags.map((tagId: number) => (
                                { tag: { connect: { id: tagId}}}   // create = create rows in the join table, connect = point a foreign key to an existing row
                            ))
                        } : undefined // “If no tags were sent, DO NOTHING”
                },
                include: {
                    author: {
                        select: { username: true },
                    },
                    category: true,
                    tags: {
                        include: { tag: true },
                    },
                },
            });

            res.status(201).json(post);
        } catch(error) {
            res.status(500).json({ error: 'Failed to create post' });
        }
    }


    // PUT /api/posts/:id
    static async updatePost(req: Request, res: Response) {
        try {
            const { id } = req.params;

            const { title, content, published, categoryId } = req.body;
            const userId = (req as any).userId; // req.user.id
            const existingPost = await prisma.post.findUnique({
                where: { id: Number(id)},
            });

            if (!existingPost) {
                return res.status(404).json({ error: 'Post not found' });
            }

            if (existingPost.authorId !== userId) {
                return res.status(403).json({ error: 'Unauthorized' });
            }

            const post = await prisma.post.update({
                where: { id: Number(id) },
                data: {
                    title: title,
                    content: content,
                    published: published,
                    categoryId: categoryId,
                    publishedAt: published && !existingPost.published ? new Date() : existingPost.publishedAt,
                    include: {
                        author: {
                            select: {
                                username: true
                            },
                            category: true,
                        },
                    }
                }
            });

            res.json(post);

        } catch(error) {
        res.status(500).json({ error: 'Failed to update post' });
        }
    }

    // DELETE /api/posts/:id
    static async deletePost(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const userId = (req as any).userId; // req.user.id

            const post = await prisma.post.findUnique({
                where: {
                    id: Number(id),
                }
            });

            if (!post) {
                return res.status(404).json({ error: 'Post not found' });
            }

            if (post.authorId !== userId) {
                return res.status(403).json({ error: 'Unauthorized' });
            }

            await prisma.post.delete({
                where : { id: Number(id) },
            });

            res.json({ message: 'Post deleted successfully' });

        } catch(error) {
            res.status(500).json({ error: 'Failed to delete post' });
        }
    }


    // POST /api/posts/:id/like

    static async likePost(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const userId = (req as any).userId; // req.user.id

            const like = await prisma.like.create({
                data: {
                    postId: Number(id),
                    userId,
                }
            });

            res.status(201).json(like);
        } catch(error: any) {
            if (error.code === 'P2002') {
                res.status(400).json({ error: 'Already liked' });
            } else {
                res.status(500).json({ error: 'Failed to like post' });
            }
        }
    }


    // DELETE /api/posts/:id/like
    static async unlikePost(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const userId = (req as any).userId; // req.user.id

            await prisma.like.delete({
                where: {
                    postId_userId: {
                        postId: Number(id),
                        userId
                    },
                },
            });

            res.json({ message: 'Post unliked' });
        } catch(error) {
            res.status(500).json({ error: 'Failed to unlike post' });
        }
    }
}