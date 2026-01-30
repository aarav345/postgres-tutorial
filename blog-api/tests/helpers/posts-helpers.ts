import type { Post, Category } from '../../src/generated/prisma';

export class PostHelpers {
  /**
   * Generate a mock post object
   */
  static mockPost(overrides: Partial<Post> = {}): Post {
    return {
      id: 1,
      title: 'Test Post',
      slug: 'test-post',
      content: 'This is a test post content with enough length to pass validation requirements.',
      excerpt: 'This is a test post excerpt',
      published: false,
      publishedAt: null,
      featured: false,
      categoryId: null,
      authorId: 1,
      viewCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    } as Post;
  }

  /**
   * Generate a mock published post
   */
  static mockPublishedPost(overrides: Partial<Post> = {}): Post {
    return this.mockPost({
      published: true,
      publishedAt: new Date(),
      ...overrides,
    });
  }

  /**
   * Generate a mock draft post
   */
  static mockDraftPost(overrides: Partial<Post> = {}): Post {
    return this.mockPost({
      published: false,
      publishedAt: null,
      ...overrides,
    });
  }

  /**
   * Generate a mock featured post
   */
  static mockFeaturedPost(overrides: Partial<Post> = {}): Post {
    return this.mockPost({
      published: true,
      publishedAt: new Date(),
      featured: true,
      ...overrides,
    });
  }

  /**
   * Generate a mock post with author
   */
  static mockPostWithAuthor(overrides: Partial<Post> = {}) {
    return {
      ...this.mockPost(overrides),
      author: {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
      },
    };
  }

  /**
   * Generate a mock post with category
   */
  static mockPostWithCategory(overrides: Partial<Post> = {}) {
    return {
      ...this.mockPost({
        categoryId: 1,
        ...overrides,
      }),
      category: {
        id: 1,
        name: 'Technology',
        slug: 'technology',
      },
    };
  }

  /**
   * Generate a mock post with full relations
   */
  static mockPostWithRelations(overrides: Partial<Post> = {}) {
    return {
      ...this.mockPost(overrides),
      author: {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        role: 'USER',
      },
      category: {
        id: 1,
        name: 'Technology',
        slug: 'technology',
        description: 'Tech posts',
      },
      tags: [],
      comments: [],
      _count: {
        comments: 0,
        likes: 0,
      },
    };
  }

  /**
   * Generate a mock post list item
   */
  static mockPostListItem(overrides = {}) {
    return {
      id: 1,
      title: 'Test Post',
      slug: 'test-post',
      excerpt: 'This is a test post excerpt',
      featured: false,
      published: true,
      publishedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      viewCount: 0,
      author: {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
      },
      category: {
        id: 1,
        name: 'Technology',
        slug: 'technology',
      },
      tags: [],
      _count: {
        comments: 0,
        likes: 0,
      },
      ...overrides,
    };
  }

  /**
   * Generate a mock category
   */
  static mockCategory(overrides: Partial<Category> = {}): Category {
    return {
      id: 1,
      name: 'Technology',
      slug: 'technology',
      description: 'All about technology',
      createdAt: new Date(),
      ...overrides,
    } as Category;
  }

  /**
   * Generate multiple mock posts
   */
  static mockPosts(count: number, baseOverrides = {}): Post[] {
    return Array.from({ length: count }, (_, index) =>
      this.mockPost({
        id: index + 1,
        title: `Test Post ${index + 1}`,
        slug: `test-post-${index + 1}`,
        ...baseOverrides,
      })
    );
  }

  /**
   * Generate CreatePostDto
   */
  static mockCreatePostDto(overrides = {}) {
    return {
      title: 'New Test Post',
      slug: 'new-test-post',
      content: 'This is the content of a new test post with sufficient length.',
      excerpt: 'Brief excerpt of the test post',
      categoryId: 1,
      featured: false,
      published: false,
      ...overrides,
    };
  }

  /**
   * Generate UpdatePostDto
   */
  static mockUpdatePostDto(overrides = {}) {
    return {
      title: 'Updated Test Post',
      content: 'Updated content for the test post',
      excerpt: 'Updated excerpt',
      ...overrides,
    };
  }

  /**
   * Mock pagination result for posts
   */
  static mockPaginationResult<T>(data: T[], page = 1, limit = 10, total?: number) {
    const actualTotal = total ?? data.length;
    return {
      data,
      pagination: {
        page,
        limit,
        total: actualTotal,
        totalPages: Math.ceil(actualTotal / limit),
        hasNext: page < Math.ceil(actualTotal / limit),
        hasPrev: page > 1,
      },
    };
  }

  /**
   * Mock post statistics
   */
  static mockPostStatistics(overrides = {}) {
    return {
      total: 10,
      published: 7,
      drafts: 3,
      featured: 2,
      ...overrides,
    };
  }

  /**
   * Generate related posts
   */
  static mockRelatedPosts(currentPostId: number, categoryId: number, count: number) {
    return Array.from({ length: count }, (_, index) =>
      this.mockPostListItem({
        id: currentPostId + index + 1,
        title: `Related Post ${index + 1}`,
        slug: `related-post-${index + 1}`,
        category: {
          id: categoryId,
          name: 'Technology',
          slug: 'technology',
        },
      })
    );
  }
}