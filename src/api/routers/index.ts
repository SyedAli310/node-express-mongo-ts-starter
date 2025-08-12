import express, { Request, Response } from 'express';
import mongoose from 'mongoose';

import { UserRouter } from './user.router';
import { AuthRouter } from './auth.router';
import { Logger } from '../../services';
import Middlewares from '../middlewares';
import AppConfig from '../../config/appconfig';
import { NavigationRouter } from './navigation.router';


/**
 * Sets up all API routers and middleware for the Express application.
 *
 * @param app - The Express application instance to which routers and middleware will be attached.
 *
 * @remarks
 * - Registers a `/ping` health check endpoint that returns server status, response time, client IP, and timestamp.
 * - Mounts feature routers for navigation, authentication, users, groups, expenses, resolutions, and categories.
 * - Applies authentication middleware to protected routes.
 * - Handles non-existing routes by redirecting to the client application's 404 page.
 *
 * @example
 * ```typescript
 * import express from 'express';
 * import { setupRouters } from './routers';
 *
 * const app = express();
 * setupRouters(app);
 * ```
 */
export const setupRouters = (app: express.Application): void => {
    // Health check endpoint
    app.get('/ping', (req: any, res: Response) => {
        try {
            const end = process.hrtime(req.startTime);
            const responseTime = (end[0] * 1e9 + end[1]) / 1e6;
            const clientIp = req.headers['x-forwarded-for'] || req.ip;
            res.setHeader('Content-Type', 'application/json');
            return res.status(200).json({
                error: false,
                message: 'pong',
                ping: `${responseTime.toFixed(2)}ms`,
                ip: clientIp,
                timestamp: new Date().toISOString(),
            });
        } catch (error: any) {
            Logger.error('Error pinging server', {
                actualError: error.message,
                errorStack: error.toString(),
                ...Logger.getErrorOrigin(error),
            }, req.logMeta);
            return res.status(500).json({
                error: true,
                message: 'Something went wrong!',
                details: AppConfig.isLocal ? error.message : undefined,
            });
        }
    });

    app.get("/health/db", async (req, res) => {
        try {
            // Ping MongoDB
            await mongoose.connection.db?.admin().ping();
            res.status(200).json({ 
                error: false,
                message: 'DB is healthy and connected',
                status: "ok" 
            });
        } catch (error: any) {
            Logger.error('Error pinging db', {
                actualError: error.message,
                errorStack: error.toString(),
                ...Logger.getErrorOrigin(error),
            }, req.logMeta);
            return res.status(500).json({
                error: true,
                message: 'Something went wrong!',
                details: AppConfig.isLocal ? error.message : undefined,
            });
        }
    });

    // Set up routers
    app.use("/", NavigationRouter);
    app.use("/api/v1/auth", AuthRouter);
    app.use("/api/v1/user", Middlewares.Auth.ensureAuthenticated, Middlewares.CheckUserStatus, UserRouter);

    // Non existing routes handler (404: redirect to client app)
    app.use((req: Request, res: Response) => {
        return res.status(404).json({
            error: true,
            msg: `The requested resource ${req.originalUrl} does not exist`,
            actualError: 'NOT_FOUND',
            redirect: `${AppConfig.clientAppURL}/404`,
        })
    });
}
