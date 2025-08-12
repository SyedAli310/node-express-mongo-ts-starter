import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import { Logger } from '../../services';
import { ExpressMiddleware } from '../../core/types/middleware.type';

/**
 * Additional security middleware for enhanced protection
 */

/**
 * Rate limiter for authentication endpoints
 */
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // limit each IP to 5 requests per windowMs for auth
    message: {
        error: true,
        windowMsInMinutes: 15,
        RATE_LIMIT_EXCEEDED: true,
        message: 'Too many authentication attempts, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req: Request, res: Response) => {
        Logger.error('Rate limit exceeded for authentication', {
            ip: req.ip,
            userAgent: req.headers['user-agent'],
            path: req.originalUrl
        }, { ...req.logMeta, email: req.body && req.body.email ? req.body.email : null });

        res.status(429).json({
            error: true,
            windowMsInMinutes: 15,
            RATE_LIMIT_EXCEEDED: true,
            message: 'Too many authentication attempts, please try again later.'
        });
    }
});

/**
 * Validate request body size and structure
 */
const validateRequestSize: ExpressMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const contentLength = req.get('content-length');
    const maxSize = 10 * 1024 * 1024; // 10MB limit

    if (contentLength && parseInt(contentLength) > maxSize) {
        return res.status(413).json({
            error: true,
            message: 'Request entity too large'
        });
    }
    next();
};

/**
 * Security headers middleware
 */
const securityHeaders: ExpressMiddleware = (req: Request, res: Response, next: NextFunction) => {
    // Remove server information
    res.removeHeader('X-Powered-By');

    // Add security headers
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

    next();
};

const Security = {
    authLimiter,
    validateRequestSize,
    securityHeaders,
};

export default Security;
