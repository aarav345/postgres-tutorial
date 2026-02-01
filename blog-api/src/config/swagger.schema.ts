/**
 * Centralized Swagger Schema Definitions
 * 
 * This file contains all reusable schema definitions for Swagger documentation.
 * Benefits:
 * - Single source of truth for API contracts
 * - Type-safe schemas
 * - Easy to maintain and update
 * - Consistent across all endpoints
 */


export const SwaggerSchemas = {
  // ==================== AUTH SCHEMAS ====================
    
    RegisterRequest: {
        type: 'object',
        required: ['username', 'email', 'password'],
        properties: {
            username: {
                type: 'string',
                minLength: 3,
                maxLength: 50,
                example: 'johndoe',
                description: 'Unique username for the user',
            },
            email: {
                type: 'string',
                format: 'email',
                example: 'john@example.com',
                description: 'Valid email address',
            },
            password: {
                type: 'string',
                minLength: 8,
                example: 'SecureP@ss123',
                description: 'Password must be at least 8 characters and contain uppercase, lowercase, and number',
                pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)$',
            },
        },
    },

    LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
            email: {
                type: 'string',
                format: 'email',
                example: 'john@example.com',
            },
            password: {
                type: 'string',
                minLength: 8,
                example: 'SecureP@ss123',
            },
        },
    },

    RefreshTokenRequest: {
        type: 'object',
        required: ['refreshToken'],
        properties: {
            refreshToken: {
                type: 'string',
                example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                description: 'Valid refresh token',
            },
        },
    },

    AuthResponse: {
        type: 'object',
        properties: {
            success: {
                type: 'boolean',
                example: true,
            },
            data: {
                type: 'object',
                properties: {
                    user: {
                        $ref: '#/components/schemas/User',
                    },
                    accessToken: {
                        type: 'string',
                        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                    },
                },
            },
            message: {
                type: 'string',
                example: 'Login successful',
            },
        },
    },

  // ==================== USER SCHEMAS ====================

    User: {
        type: 'object',
        properties: {
            id: {
                type: 'number',
                format: 'int64',
                example: '1',
            },
            username: {
                type: 'string',
                example: 'johndoe',
            },
            email: {
                type: 'string',
                format: 'email',
                example: 'john@example.com',
            },
            role: {
                type: 'string',
                enum: ['USER', 'ADMIN'],
                example: 'USER',
            },
            createdAt: {
                type: 'string',
                format: 'date-time',
                example: '2024-01-15T10:30:00.000Z',
            },
            updatedAt: {
                type: 'string',
                format: 'date-time',
                example: '2024-01-15T10:30:00.000Z',
            },
        },
    },

    CreateUserRequest: {
        type: 'object',
        required: ['username', 'email', 'password'],
        properties: {
            username: {
                type: 'string',
                minLength: 3,
                maxLength: 50,
                example: 'johndoe',
            },
            email: {
                type: 'string',
                format: 'email',
                example: 'john@example.com',
            },
            password: {
                type: 'string',
                minLength: 8,
                example: 'SecureP@ss123',
            },
            role: {
                type: 'string',
                enum: ['USER', 'ADMIN'],
                example: 'USER',
            },
        },
    },

    UpdateUserRequest: {
        type: 'object',
        properties: {
            username: {
                type: 'string',
                minLength: 3,
                maxLength: 50,
                example: 'johndoe_updated',
            },
            email: {
                type: 'string',
                format: 'email',
                example: 'john.updated@example.com',
            },
            role: {
                type: 'string',
                enum: ['USER', 'ADMIN'],
                example: 'ADMIN',
            },
        },
    },

    ChangePasswordRequest: {
        type: 'object',
        required: ['currentPassword', 'newPassword', 'confirmPassword'],
        properties: {
            currentPassword: {
                type: 'string',
                example: 'OldP@ss123',
                description: 'Current password for verification',
            },
            newPassword: {
                type: 'string',
                minLength: 8,
                example: 'NewSecureP@ss456',
                description: 'New password (minimum 8 characters)',
            },
            confirmPassword: {
                type: 'string',
                minLength: 8,
                example: 'NewSecureP@ss456',
                description: 'New password (minimum 8 characters)',
            }
        },
    },

  // ==================== POST SCHEMAS ====================

    Post: {
        type: 'object',
        properties: {
            id: {
                type: 'number',
                format: 'int64',
                example: '550e8400-e29b-41d4-a716-446655440000',
            },
            title: {
                type: 'string',
                example: 'Getting Started with TypeScript',
            },
            slug: {
                type: 'string',
                example: 'getting-started-with-typescript',
            },
            content: {
                type: 'string',
                example: 'TypeScript is a typed superset of JavaScript...',
            },
            excerpt: {
                type: 'string',
                example: 'Learn the basics of TypeScript in this comprehensive guide.',
            },
            published: {
                type: 'boolean',
                example: true,
            },
            authorId: {
                type: 'string',
                format: 'uuid',
                example: '550e8400-e29b-41d4-a716-446655440000',
            },
            categoryId: {
                type: 'string',
                format: 'uuid',
                example: '660e8400-e29b-41d4-a716-446655440000',
            },
            author: {
                $ref: '#/components/schemas/User',
            },
            category: {
                $ref: '#/components/schemas/Category',
            },
            createdAt: {
                type: 'string',
                format: 'date-time',
                example: '2024-01-15T10:30:00.000Z',
            },
            updatedAt: {
                type: 'string',
                format: 'date-time',
                example: '2024-01-15T10:30:00.000Z',
            },
        },
    },

    CreatePostRequest: {
        type: 'object',
        required: ['title', 'content', 'categoryId'],
        properties: {
            title: {
                type: 'string',
                minLength: 3,
                maxLength: 200,
                example: 'Getting Started with TypeScript',
            },
            content: {
                type: 'string',
                minLength: 10,
                example: 'TypeScript is a typed superset of JavaScript that compiles to plain JavaScript...',
            },
            excerpt: {
                type: 'string',
                maxLength: 500,
                example: 'Learn the basics of TypeScript in this comprehensive guide.',
            },
            categoryId: {
                type: 'string',
                format: 'uuid',
                example: '660e8400-e29b-41d4-a716-446655440000',
            },
            published: {
                type: 'boolean',
                example: false,
                default: false,
            },
        },
    },

    UpdatePostRequest: {
        type: 'object',
        properties: {
        title: {
            type: 'string',
            minLength: 3,
            maxLength: 200,
            example: 'Updated: Getting Started with TypeScript',
        },
        content: {
            type: 'string',
            minLength: 10,
            example: 'Updated content...',
        },
        excerpt: {
            type: 'string',
            maxLength: 500,
            example: 'Updated excerpt...',
        },
        categoryId: {
            type: 'string',
            format: 'uuid',
            example: '660e8400-e29b-41d4-a716-446655440000',
        },
        published: {
            type: 'boolean',
            example: true,
        },
        },
    },

  // ==================== CATEGORY SCHEMAS ====================

  Category: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        format: 'uuid',
        example: '660e8400-e29b-41d4-a716-446655440000',
      },
      name: {
        type: 'string',
        example: 'Technology',
      },
      slug: {
        type: 'string',
        example: 'technology',
      },
      description: {
        type: 'string',
        example: 'Posts about technology and programming',
      },
      createdAt: {
        type: 'string',
        format: 'date-time',
        example: '2024-01-15T10:30:00.000Z',
      },
      updatedAt: {
        type: 'string',
        format: 'date-time',
        example: '2024-01-15T10:30:00.000Z',
      },
    },
  },

  CreateCategoryRequest: {
    type: 'object',
    required: ['name'],
    properties: {
      name: {
        type: 'string',
        minLength: 2,
        maxLength: 50,
        example: 'Technology',
      },
      description: {
        type: 'string',
        maxLength: 500,
        example: 'Posts about technology and programming',
      },
    },
  },

  UpdateCategoryRequest: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        minLength: 2,
        maxLength: 50,
        example: 'Updated Technology',
      },
      description: {
        type: 'string',
        maxLength: 500,
        example: 'Updated description...',
      },
    },
  },

  // ==================== COMMON RESPONSE SCHEMAS ====================

  SuccessResponse: {
    type: 'object',
    properties: {
      success: {
        type: 'boolean',
        example: true,
      },
      data: {
        type: 'object',
      },
      message: {
        type: 'string',
        example: 'Operation successful',
      },
    },
  },

  PaginationMeta: {
    type: 'object',
    properties: {
      page: {
        type: 'integer',
        example: 1,
        description: 'Current page number',
      },
      limit: {
        type: 'integer',
        example: 10,
        description: 'Items per page',
      },
      total: {
        type: 'integer',
        example: 100,
        description: 'Total number of items',
      },
      totalPages: {
        type: 'integer',
        example: 10,
        description: 'Total number of pages',
      },
    },
  },

  PaginatedResponse: {
    type: 'object',
    properties: {
      success: {
        type: 'boolean',
        example: true,
      },
      data: {
        type: 'array',
        items: {
          type: 'object',
        },
      },
      pagination: {
        $ref: '#/components/schemas/PaginationMeta',
      },
    },
  },

  ErrorResponse: {
    type: 'object',
    properties: {
      success: {
        type: 'boolean',
        example: false,
      },
      message: {
        type: 'string',
        example: 'Error message',
      },
      statusCode: {
        type: 'integer',
        example: 400,
      },
      correlationId: {
        type: 'string',
        example: '1234567890-abc123',
        description: 'Request correlation ID for tracking',
      },
      errors: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            field: {
              type: 'string',
              example: 'email',
            },
            message: {
              type: 'string',
              example: 'Invalid email format',
            },
          },
        },
      },
    },
  },
};

// ==================== COMMON PARAMETERS ====================

export const SwaggerParameters = {
  PageQuery: {
    in: 'query',
    name: 'page',
    schema: {
      type: 'integer',
      minimum: 1,
      default: 1,
    },
    description: 'Page number for pagination',
  },

  LimitQuery: {
    in: 'query',
    name: 'limit',
    schema: {
      type: 'integer',
      minimum: 1,
      maximum: 100,
      default: 10,
    },
    description: 'Number of items per page',
  },

  SortQuery: {
    in: 'query',
    name: 'sort',
    schema: {
      type: 'string',
      example: '-createdAt',
    },
    description: 'Sort field (prefix with - for descending)',
  },

  SearchQuery: {
    in: 'query',
    name: 'search',
    schema: {
      type: 'string',
      example: 'typescript',
    },
    description: 'Search term',
  },

  IdParam: {
    in: 'path',
    name: 'id',
    required: true,
    schema: {
      type: 'string',
      format: 'uuid',
    },
    description: 'Resource ID',
  },

  SlugParam: {
    in: 'path',
    name: 'slug',
    required: true,
    schema: {
      type: 'string',
    },
    description: 'Resource slug',
  },

  UsernameParam: {
    in: 'path',
    name: 'username',
    required: true,
    schema: {
      type: 'string',
    },
    description: 'Username',
  },
};

// ==================== COMMON RESPONSES ====================

export const SwaggerResponses = {
  Success200: {
    description: 'Successful operation',
    content: {
      'application/json': {
        schema: {
          $ref: '#/components/schemas/SuccessResponse',
        },
      },
    },
  },

  Created201: {
    description: 'Resource created successfully',
    content: {
      'application/json': {
        schema: {
          $ref: '#/components/schemas/SuccessResponse',
        },
      },
    },
  },

  NoContent204: {
    description: 'Successful operation with no content',
  },

  BadRequest400: {
    description: 'Bad request - validation error',
    content: {
      'application/json': {
        schema: {
          $ref: '#/components/schemas/ErrorResponse',
        },
        example: {
          success: false,
          message: 'Validation failed',
          statusCode: 400,
          correlationId: '1234567890-abc123',
          errors: [
            {
              field: 'email',
              message: 'Invalid email format',
            },
          ],
        },
      },
    },
  },

  Unauthorized401: {
    description: 'Unauthorized - authentication required',
    content: {
      'application/json': {
        schema: {
          $ref: '#/components/schemas/ErrorResponse',
        },
        example: {
          success: false,
          message: 'Authentication required',
          statusCode: 401,
          correlationId: '1234567890-abc123',
        },
      },
    },
  },

  Forbidden403: {
    description: 'Forbidden - insufficient permissions',
    content: {
      'application/json': {
        schema: {
          $ref: '#/components/schemas/ErrorResponse',
        },
        example: {
          success: false,
          message: 'Insufficient permissions',
          statusCode: 403,
          correlationId: '1234567890-abc123',
        },
      },
    },
  },

  NotFound404: {
    description: 'Resource not found',
    content: {
      'application/json': {
        schema: {
          $ref: '#/components/schemas/ErrorResponse',
        },
        example: {
          success: false,
          message: 'Resource not found',
          statusCode: 404,
          correlationId: '1234567890-abc123',
        },
      },
    },
  },

  Conflict409: {
    description: 'Conflict - resource already exists',
    content: {
      'application/json': {
        schema: {
          $ref: '#/components/schemas/ErrorResponse',
        },
        example: {
          success: false,
          message: 'A record with this value already exists',
          statusCode: 409,
          correlationId: '1234567890-abc123',
        },
      },
    },
  },

  ServerError500: {
    description: 'Internal server error',
    content: {
      'application/json': {
        schema: {
          $ref: '#/components/schemas/ErrorResponse',
        },
        example: {
          success: false,
          message: 'An unexpected error occurred',
          statusCode: 500,
          correlationId: '1234567890-abc123',
        },
      },
    },
  },
};