import './common/types/express';
import express, { type Application } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import compression from 'compression';
import corsConfig from './config/cors.config.js';
import routes from './routes/index.js';
import errorHandler from './common/middlewares/error-handler.middleware';
import { notFound } from './common/middlewares/not-found.middleware';

const app: Application = express();

// Security middlewares
app.use(helmet());
app.use(cors(corsConfig));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression
app.use(compression());

// Logging
if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('combined'));
}

// Health check
app.get('/health', (_req, res) => {
    res.status(200).json({ 
        status: 'ok', 
        timestamp: new Date().toISOString() 
    });
});

// API routes
app.use('/api/v1', routes);

// 404 handler
app.use(notFound);

// Error handler (must be last)
app.use(errorHandler);

export default app;
