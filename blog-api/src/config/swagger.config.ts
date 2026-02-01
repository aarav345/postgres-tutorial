import swaggerJsdoc from 'swagger-jsdoc';
import type { SwaggerUiOptions } from 'swagger-ui-express';
import { SwaggerSchemas, SwaggerResponses } from './swagger.schema';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Blog API',
    version: process.env.APP_VERSION || '1.0.0',
    description: `
# Blog API Documentation

A comprehensive RESTful API for blog management with authentication, posts, categories, and user management.

## Features
- 🔐 JWT-based authentication with refresh tokens
- 📝 Full CRUD operations for posts, categories, and users
- 🔍 Advanced filtering, pagination, and sorting
- 📊 Health monitoring endpoints
- 🔒 Role-based access control (RBAC)

## Authentication

Most endpoints require authentication. To authenticate:

1. Register a new user at \`POST /api/auth/register\` or login at \`POST /api/auth/login\`
2. Copy the \`accessToken\` from the response
3. Click the **Authorize** button (🔓) at the top of this page
4. Enter: \`Bearer YOUR_ACCESS_TOKEN\`
5. Click **Authorize** and then **Close**

Your token will be included in all subsequent requests automatically.

## Rate Limiting
API requests are rate-limited to prevent abuse. Current limits:
- 100 requests per 15 minutes per IP address

## Correlation IDs
Every response includes an \`X-Correlation-Id\` header for request tracking and debugging.
    `,
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
    schemas: SwaggerSchemas,
    responses: SwaggerResponses,
  },
  tags: [
    {
      name: 'Health',
      description: 'Health check endpoints for monitoring and Kubernetes probes',
    },
    {
      name: 'Auth',
      description: 'Authentication and authorization endpoints - register, login, refresh tokens',
    },
    {
      name: 'Users',
      description: 'User management endpoints - CRUD operations for users',
    },
    {
      name: 'Posts',
      description: 'Blog post management endpoints - create, read, update, delete posts',
    },
    {
      name: 'Categories',
      description: 'Category management endpoints - organize posts by category',
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