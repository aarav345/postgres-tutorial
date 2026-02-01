import { Router } from 'express';
import { healthController } from './health.controller';

const router = Router();

/**
 * @swagger
 * /health/live:
 *   get:
 *     tags:
 *       - Health
 *     summary: Liveness probe
 *     description: Check if the application is running (for Kubernetes liveness probe)
 *     responses:
 *       200:
 *         description: Application is alive
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: healthy
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 message:
 *                   type: string
 *                   example: Application is running
 *       503:
 *         description: Application is not responding
 */
router.get('/live', healthController.liveness.bind(healthController));

/**
 * @swagger
 * /health/ready:
 *   get:
 *     tags:
 *       - Health
 *     summary: Readiness probe
 *     description: Check if the application is ready to serve traffic (for Kubernetes readiness probe)
 *     responses:
 *       200:
 *         description: Application is ready
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: healthy
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 uptime:
 *                   type: number
 *                   example: 123.45
 *                 checks:
 *                   type: object
 *                   properties:
 *                     database:
 *                       type: object
 *                       properties:
 *                         status:
 *                           type: string
 *                           example: up
 *                         message:
 *                           type: string
 *                         responseTime:
 *                           type: number
 *                     memory:
 *                       type: object
 *                       properties:
 *                         status:
 *                           type: string
 *                           example: up
 *                         message:
 *                           type: string
 *                         details:
 *                           type: object
 *                     system:
 *                       type: object
 *                       properties:
 *                         status:
 *                           type: string
 *                           example: up
 *                         message:
 *                           type: string
 *                         details:
 *                           type: object
 *                 version:
 *                   type: string
 *                   example: 1.0.0
 *                 environment:
 *                   type: string
 *                   example: production
 *       503:
 *         description: Application is not ready
 */
router.get('/ready', healthController.readiness.bind(healthController));

// Alias for backward compatibility
router.get('/', healthController.readiness.bind(healthController));

export default router;