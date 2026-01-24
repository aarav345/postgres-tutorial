import { asyncHandler } from '@/common/utils/asyncHandler.util';
import { ResponseUtil } from '@/common/utils/response.util';
import { PaginationUtil } from '@/common/utils/pagination.util';
import CategoriesService from './category.service';
import { MESSAGES } from '@/common/constants/messages.constant';
import type { CreateCategoryDto } from './dto/create-category.dto';
import type { UpdateCategoryDto } from './dto/update-category.dto';
import { type QueryCategoryDto } from './dto/query-category.dto';
import { type CategoryIdSlugDto } from './dto/id-slug.dto';
import { AppError } from '@/common/errors/app.error';



export class CategoriesController {
    // POST /api/v1/categories - Create new category (Admin only)
    createCategory = asyncHandler<CreateCategoryDto, undefined, undefined>(
        async (req, res): Promise<void> => {
            const data = req.validatedBody;
            const category = await CategoriesService.create(data);

            ResponseUtil.success(res, category, MESSAGES.CATEGORY.CREATED, 201);
        }
    );

  // GET /api/v1/categories - Get all categories
    getAllCategories = asyncHandler<undefined, QueryCategoryDto, undefined>(
        async (req, res): Promise<void> => {
            const { page, limit, search, includePosts } = req.validatedQuery;
            const pagination = PaginationUtil.paginate(page, limit);

            const result = await CategoriesService.findAll({
                ...pagination,
                search,
                includePosts: includePosts === "true",
            });

            ResponseUtil.paginated(
                res,
                result.data,
                {
                    page: result.pagination.page,
                    limit: result.pagination.limit,
                    total: result.pagination.total,
                    totalPages: result.pagination.totalPages,
                },
                MESSAGES.CATEGORY.FETCHED
            );
        }
    );

  // GET /api/v1/categories/popular - Get popular categories
    getPopularCategories = asyncHandler<undefined, { limit?: string }, undefined>(
        async (req, res): Promise<void> => {
            const limit = req.query.limit ? Number(req.query.limit) : 10;
            const categories = await CategoriesService.findPopular(limit);

            ResponseUtil.success(
                res,
                categories,
                MESSAGES.CATEGORY.FETCHED
            );
        }
    );

  // GET /api/v1/categories/with-posts - Get categories with published posts
    getCategoriesWithPosts = asyncHandler(
        async (_req, res): Promise<void> => {
            const categories = await CategoriesService.findWithPublishedPosts();

            ResponseUtil.success(
                res,
                categories,
                MESSAGES.CATEGORY.FETCHED
            );
        }
    );

  // GET /api/v1/categories/statistics - Get category statistics (Admin only)
    getCategoryStatistics = asyncHandler(
        async (_req, res): Promise<void> => {
            const statistics = await CategoriesService.getStatistics();

            ResponseUtil.success(
                res,
                statistics,
                MESSAGES.CATEGORY.STATISTICS_FETCHED
            );
        }
    );

  // GET /api/v1/categories/:id - Get category by ID
    getCategoryById = asyncHandler<undefined, { includePosts?: string }, CategoryIdSlugDto>(
            async (req, res): Promise<void> => {
            const { id } = req.validatedParams;
            const includePosts = req.query.includePosts === 'true';
            
            const category = await CategoriesService.findById(Number(id), includePosts);

            ResponseUtil.success(
                res,
                category,
                MESSAGES.CATEGORY.FETCHED
            );
        }
    );

  // GET /api/v1/categories/slug/:slug - Get category by slug
    getCategoryBySlug = asyncHandler<undefined, { includePosts?: string }, CategoryIdSlugDto>(
        async (req, res): Promise<void> => {
            const { slug } = req.validatedParams;
            const includePosts = req.query.includePosts === 'true';

            if (!slug) {
                throw new AppError("Slug is required", 400);
            }

            const category = await CategoriesService.findBySlug(slug, includePosts);

            ResponseUtil.success(
                res,
                category,
                MESSAGES.CATEGORY.FETCHED
            );
        }
    );

    // PUT /api/v1/categories/:id - Update category (Admin only)
    updateCategory = asyncHandler<UpdateCategoryDto, undefined, CategoryIdSlugDto>(
        async (req, res): Promise<void> => {
            const { id } = req.validatedParams;
            const data = req.validatedBody;

            const updatedCategory = await CategoriesService.update(Number(id), data);

            ResponseUtil.success(
                res,
                updatedCategory,
                MESSAGES.CATEGORY.UPDATED
            );
        }
    );

    // DELETE /api/v1/categories/:id - Delete category (Admin only)
    deleteCategory = asyncHandler<undefined, { force?: string }, CategoryIdSlugDto>(
        async (req, res): Promise<void> => {
            const { id } = req.validatedParams;
            const force = req.query.force === 'true';

            if (force) {
                await CategoriesService.forceDelete(Number(id));
            } else {
                await CategoriesService.delete(Number(id));
            }

            ResponseUtil.success(res, null, MESSAGES.CATEGORY.DELETED);
        }
    );
}

export default new CategoriesController();