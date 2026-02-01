import swaggerJsdoc from 'swagger-jsdoc';
import type { SwaggerUiOptions } from 'swagger-ui-express';

const swaggerDefinition = {
    openapi: '3.0.0',
    info: {
        title: 'Blog API',
        version: process.env.APP_VERSION || '1.0.0',
        description: 'A comprehensive RESTful API for blog management with authentication, posts, categories, and user management',
        contact: {
            name: 'API Support',
            email: 'support@blogapi.com',
        },
        license: {
            name: 'MIT',
            url: 'https://opensource.org/licenses/MIT',
        },
    },
    servers: [
        {
            url: process.env.API_BASE_URL || 'http://localhost:3000',
            description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server',
        },
    ],
    components: {
        securitySchemes: {
        bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            description: 'Enter your JWT token in the format: Bearer <token>',
        },
        },
        schemas: {
        Error: {
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
                type: 'number',
                example: 400,
            },
            errors: {
                type: 'array',
                items: {
                type: 'object',
                },
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
                type: 'object',
                properties: {
                page: {
                    type: 'number',
                    example: 1,
                },
                limit: {
                    type: 'number',
                    example: 10,
                },
                total: {
                    type: 'number',
                    example: 100,
                },
                totalPages: {
                    type: 'number',
                    example: 10,
                },
                },
            },
            },
        },
        User: {
            type: 'object',
            properties: {
            id: {
                type: 'string',
                format: 'uuid',
                example: '123e4567-e89b-12d3-a456-426614174000',
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
            fullName: {
                type: 'string',
                example: 'John Doe',
            },
            role: {
                type: 'string',
                enum: ['USER', 'ADMIN'],
                example: 'USER',
            },
            createdAt: {
                type: 'string',
                format: 'date-time',
            },
            updatedAt: {
                type: 'string',
                format: 'date-time',
            },
            },
        },
        Post: {
            type: 'object',
            properties: {
            id: {
                type: 'number',
                format: 'int64',
            },
            title: {
                type: 'string',
                example: 'My Blog Post',
            },
            slug: {
                type: 'string',
                example: 'my-blog-post',
            },
            content: {
                type: 'string',
                example: 'This is the content of my blog post...',
            },
            excerpt: {
                type: 'string',
                example: 'A brief summary...',
            },
            published: {
                type: 'boolean',
                example: true,
            },
            authorId: {
                type: 'string',
                format: 'uuid',
            },
            categoryId: {
                type: 'string',
                format: 'uuid',
            },
            createdAt: {
                type: 'string',
                format: 'date-time',
            },
            updatedAt: {
                type: 'string',
                format: 'date-time',
            },
            },
        },
        Category: {
            type: 'object',
            properties: {
            id: {
                type: 'number',
                format: 'int64',
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
                example: 'Posts about technology',
            },
            createdAt: {
                type: 'string',
                format: 'date-time',
            },
            updatedAt: {
                type: 'string',
                format: 'date-time',
            },
            },
        },
        },
        responses: {
        UnauthorizedError: {
            description: 'Authentication required',
            content: {
            'application/json': {
                schema: {
                    $ref: '#/components/schemas/Error',
                },
                example: {
                    success: false,
                    message: 'Authentication required',
                    statusCode: 401,
                },
            },
            },
        },
        ForbiddenError: {
            description: 'Insufficient permissions',
            content: {
            'application/json': {
                schema: {
                    $ref: '#/components/schemas/Error',
                },
                example: {
                    success: false,
                    message: 'Insufficient permissions',
                    statusCode: 403,
                },
            },
            },
        },
        NotFoundError: {
            description: 'Resource not found',
            content: {
            'application/json': {
                schema: {
                    $ref: '#/components/schemas/Error',
                },
                example: {
                    success: false,
                    message: 'Resource not found',
                    statusCode: 404,
                },
            },
            },
        },
        ValidationError: {
            description: 'Validation error',
            content: {
            'application/json': {
                schema: {
                    $ref: '#/components/schemas/Error',
                },
                example: {
                    success: false,
                    message: 'Validation failed',
                    statusCode: 400,
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
        },
    },
    tags: [
        {
        name: 'Health',
            description: 'Health check endpoints for monitoring',
        },
        {
        name: 'Auth',
            description: 'Authentication and authorization endpoints',
        },
        {
        name: 'Users',
            description: 'User management endpoints',
        },
        {
        name: 'Posts',
            description: 'Blog post management endpoints',
        },
        {
        name: 'Categories',
            description: 'Category management endpoints',
        },
    ],
};

// Options for swagger-jsdoc
const options: swaggerJsdoc.Options = {
    swaggerDefinition,
    // Path to the API specs
    apis: [
        './src/health/*.route.ts',
        './src/modules/**/*.route.ts',
        './src/modules/**/*.controller.ts',
        './src/routes/*.ts',
    ],
};

// Initialize swagger-jsdoc
export const swaggerSpec = swaggerJsdoc(options);

// Swagger UI options
export const swaggerUiOptions: SwaggerUiOptions = {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Blog API Documentation',
    customfavIcon: '/favicon.ico',
    swaggerOptions: {
        persistAuthorization: true,
        displayRequestDuration: true,
        filter: true,
        tryItOutEnabled: true,
    },
};