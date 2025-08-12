import { Request, Response, NextFunction } from 'express';
import { ExpressMiddleware } from '../../core/types/middleware.type';
import { ILogMeta } from '../../core/interfaces/log-meta.interface';

declare global {
    namespace Express {
        interface Request {
            logMeta?: {
                userId: string | null;
                email: string | null;
                ip: string | string[] | undefined;
                path: string;
                method: string;
                userAgent: string | undefined;
                timestamp: string;
            };
        }
    }
}

const logMetadata: ExpressMiddleware = (req: Request, res: Response, next: NextFunction) => {
    req.logMeta = {
        userId: (req.user as any)?.id || null,
        email: (req.user as any)?.email || null,
        ip: (req.headers['x-forwarded-for'] as string | string[]) || req.ip,
        path: req.originalUrl,
        method: req.method,
        userAgent: req.headers['user-agent'],
        timestamp: new Date().toISOString(),
    } as ILogMeta;
    next();
}

export default logMetadata;