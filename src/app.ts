import express from 'express';
import passport from "passport";

import { setupMiddleware } from './config/middleware';
import { initPassport } from './config/passport';
import { setupSwagger } from './config/swagger';
import { setupRouters } from './api/routers';

/**
 * Creates and configures an Express application instance.
 *
 * This function sets up the Express app with the following:
 * - Trusts the first proxy (useful for deployments behind a reverse proxy).
 * - Initializes Passport.js for authentication.
 * - Applies global middleware (e.g., body parsers, CORS).
 * - Sets up Swagger documentation for API endpoints.
 * - Registers all API routers.
 *
 * @returns {express.Application} The configured Express application instance.
 */
export const createApp = (): express.Application => {
    const app: express.Application = express();
    
    // Trust proxy setup
    app.set("trust proxy", 1);

    // Initialize Passport.js
    initPassport(passport);
    
    // Setup middlewares
    setupMiddleware(app);
    
    // Setup Swagger documentation
    setupSwagger(app);
    
    // Setup API routers
    setupRouters(app);
    
    return app;
};