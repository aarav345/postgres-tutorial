import './common/types/express';
import express, { type Application } from 'express';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import cors from 'cors';
import morgan from 'morgan';
import compression from 'compression';
import corsConfig from './config/cors.config.js';
import routes from './routes/index.js';
import errorHandler from './common/middlewares/error-handler.middleware';
import { notFound } from './common/middlewares/not-found.middleware';
import cookieParser from 'cookie-parser';
import { requestLogger, logger } from './common/logger/logger';
import { swaggerSpec, swaggerUiOptions } from './config/swagger.config';
import healthRoutes from './health/health.route';


const app: Application = express();


// Trust proxy - important for getting correct IP addresses behind reverse proxies
app.set('trust proxy', 1);

// Request logging middleware (should be first)
app.use(requestLogger);

// Security middlewares
app.use(helmet());
app.use(cors(corsConfig));

// Body parsing
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));


// CORS middleware
app.use(cors(corsConfig));


// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerUiOptions));

// Serve OpenAPI spec as JSON
app.get('/api-docs.json', (_req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
});

// Health check routes (no /api prefix for Kubernetes probes)
app.use('/health', healthRoutes);

// Compression
app.use(compression());

// Logging
if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('combined'));
}


// API routes
app.use('/api/v1', routes);

// 404 handler
app.use(notFound);

// Error handler (must be last)
app.use(errorHandler);


// Log application startup
logger.info({
    env: process.env.NODE_ENV,
    version: process.env.APP_VERSION,
}, 'Application initialized');

export default app;
