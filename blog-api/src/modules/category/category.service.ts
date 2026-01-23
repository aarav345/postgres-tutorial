import { type Category } from "@/generated/prisma";
import CategoriesRepository from "./category.repository";
import { type CreateCategoryDto } from "./dto/create-category.dto";
import { type UpdateCategoryDto } from "./dto/update-category.dto";
import { slugify } from "@/common/utils/slugify.util";
import { AppError } from "@/common/errors/app.error";


export class CategoriesService {
    async create(data: CreateCategoryDto): Promise<Category> {
        // Generate slug from name if not provided
        const slug = data.slug || slugify(data.name);

        // Check if category with same name or slug already exists
        const existing = await CategoriesRepository.findByNameOrSlug(data.name, slug);
        if (existing) {
            if (existing.name === data.name) {
                throw new AppError("Category with this name already exists", 409);
            }
            if (existing.slug === slug) {
                throw new AppError("Category with this slug already exists");
            }
        }

        return CategoriesRepository.create({
            name: data.name,
            slug,
            description: data.description,
        });
    }

    async findById(id: number, includePosts = false): Promise<Category> {
        const category = await CategoriesRepository.findById(id, includePosts);
        
        if (!category) {
            throw new AppError("Category id not found", 404);
        }

        return category;
    }

    async findBySlug(slug: string, includePosts = false): Promise<Category> {
        const category = await CategoriesRepository.findBySlug(slug, includePosts);
        
        if (!category) {
            throw new AppError("Category slug not found", 404);
        }

        return category;
    }

    async findAll(params: {
        page?: number;
        limit?: number;
        search?: string;
        includePosts?: boolean;
    }) {
        const page = params.page || 1;
        const limit = params.limit || 10;
        const skip = (page - 1) * limit;

        const where = params.search
        ? {
            OR: [
                { name: { contains: params.search, mode: 'insensitive' as const } },
                { description: { contains: params.search, mode: 'insensitive' as const } },
            ],
            }
        : undefined;

        const [categories, total] = await Promise.all([
            CategoriesRepository.findAll({
                skip,
                take: limit,
                where,
                includePosts: params.includePosts,
            }),
            CategoriesRepository.count(where),
        ]);

        return {
            data: categories,
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

    async findAllWithPostCount(): Promise<Category[]> {
        return CategoriesRepository.findAllWithPostCount();
    }

    async findPopular(limit = 10): Promise<Category[]> {
        return CategoriesRepository.findPopular(limit);
    }

    async findWithPublishedPosts(): Promise<Category[]> {
        return CategoriesRepository.findWithPublishedPosts();
    }

    async update(id: number, data: UpdateCategoryDto): Promise<Category> {
        // Check if category exists
        const existing = await CategoriesRepository.findById(id);
        if (!existing) {
            throw new Error("Category not found");
        }

        // If name or slug is being updated, check for conflicts
        if (data.name || data.slug) {
            const newName = data.name || existing.name;
            const newSlug = data.slug || (data.name ? slugify(data.name) : existing.slug);

            // Check if another category has the same name or slug
            const conflict = await CategoriesRepository.findByNameOrSlug(newName, newSlug);
            if (conflict && conflict.id !== id) {
                if (conflict.name === newName) {
                    throw new Error("Another category with this name already exists");
                }
                if (conflict.slug === newSlug) {
                    throw new Error("Another category with this slug already exists");
                }
            }

            return CategoriesRepository.update(id, {
                name: data.name,
                slug: newSlug,
                description: data.description,
            });
        }

        return CategoriesRepository.update(id, {
            description: data.description,
        });
    }

    async delete(id: number): Promise<Category> {
        // Check if category exists
        const category = await CategoriesRepository.findById(id, false);

        if (!category) {
            throw new Error("Category not found");
        }

        // Check if category has posts
        if (category._count && category._count.posts > 0) {
            throw new Error(
                `Cannot delete category with ${category._count.posts} associated posts. Please reassign or delete the posts first.`
            );
        }

        return CategoriesRepository.delete(id);
    }

    async forceDelete(id: number): Promise<Category> {
        // Delete category even if it has posts (posts will be orphaned or handled by Prisma cascade)
        const category = await CategoriesRepository.findById(id);
        if (!category) {
            throw new Error("Category not found");
        }

        return CategoriesRepository.delete(id);
    }

    async exists(name: string, slug?: string): Promise<boolean> {
        const slugToCheck = slug || slugify(name);
        return CategoriesRepository.exists(name, slugToCheck);
    }

    async getStatistics() {
        const [total, withPosts, popular] = await Promise.all([
            CategoriesRepository.count(),
            CategoriesRepository.count({
                posts: {
                    some: {
                        published: true,
                    },
                },
            }),
            CategoriesRepository.findPopular(5),
        ]);

        return {
            total,
            withPublishedPosts: withPosts,
            empty: total - withPosts,
            popular: popular.map(cat => ({
                id: cat.id,
                name: cat.name,
                slug: cat.slug,
                postCount: cat._count?.posts || 0,
            })),
        };
    }
}

export default new CategoriesService();