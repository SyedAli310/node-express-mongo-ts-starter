import express, { NextFunction, Request, Response } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import helmet from 'helmet';
import passport from 'passport';
import rateLimiter from "express-rate-limit";
import session from "express-session";
import path from "path";
import MongoStore from "connect-mongo";

import Middlewares from '../api/middlewares';
import AppConfig from './appconfig';
import Utils from '../utils';

/**
 * Sets up and configures all global middleware for the Express application.
 *
 * This function applies a series of middleware to the provided Express app instance,
 * including security, rate limiting, session management, CORS, body parsing, and logging.
 *
 * @param app - The Express application instance to configure middleware for.
 *
 * @remarks
 * The middleware stack includes:
 * - Rate limiting with custom configuration and skip logic for `/ping`.
 * - JSON and URL-encoded body parsing with size limits.
 * - Static serving of the favicon.
 * - Custom and Helmet-provided security headers.
 * - CORS with dynamic origin and credentials support.
 * - Session management using MongoDB as the session store.
 * - Passport.js initialization for authentication.
 * - Logging of request metadata.
 * - Tracking of request start time for performance monitoring.
 *
 * Environment variables required:
 * - `SESSION_SECRET`: Secret key for session encryption.
 * - `MONGO_URI`: MongoDB connection string for session storage.
 * - `IN_PROD`: Indicates if the app is running in production (affects cookie settings).
 *
 * Dependencies:
 * - `Utils.millisecondsIn`: Utility for calculating time in milliseconds.
 * - `AppConfig`: Application configuration, including environment and CORS origins.
 * - `Middlewares`: Custom middleware for security and logging.
 */
export const setupMiddleware = (app: express.Application): void => {
    app.use(
        rateLimiter({
            windowMs: Utils.millisecondsIn(15, 'minute') ?? undefined,
            max: AppConfig.isLocal ? 10000 : 250,
            message: {
                error: true,
                message: 'Too many requests from this IP, please try again later.',
            },
            standardHeaders: true,
            legacyHeaders: false,
            skip: (req: Request) => req.path === '/ping',
        })
    );
    app.use(express.json({ limit: "10mb" }));
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());
    app.use('/favicon.ico', express.static(path.join(__dirname, 'public', 'favicon.ico')));
    app.use(Middlewares.Security.securityHeaders);
    app.use(helmet());
    app.use(cors({
        origin: AppConfig.authorizedOrigins,
        credentials: true,
    }));
    app.use(
        session({
            name: 'appname.sid',
            secret: process.env.SESSION_SECRET!,
            resave: false,
            saveUninitialized: false,
            unset: 'destroy',
            store: MongoStore.create({
                mongoUrl: process.env.MONGO_URI!,
                stringify: false,
                touchAfter: 24 * 3600
            }),
            cookie: {
                maxAge: Utils.millisecondsIn(7, 'day') ?? (1000 * 60 * 60 * 24 * 7),
                secure: process.env.IN_PROD === 'true',
                sameSite: process.env.IN_PROD === 'true' ? 'none' : 'lax',
                httpOnly: true,
                path: '/'
            },
        })
    );
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(Middlewares.ContextMiddleware);
    app.use(Middlewares.LogMetaData);
    app.use((req: any, res: Response, next: NextFunction) => {
        req.startTime = process.hrtime();
        next();
    });
}
