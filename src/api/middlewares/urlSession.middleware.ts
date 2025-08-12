import { Request, Response, NextFunction } from 'express';
import { ExpressMiddleware } from '../../core/types/middleware.type';

// Extend Express.Session to allow custom 'redirect' property
import 'express-session';
declare module 'express-session' {
    interface SessionData {
        redirect?: string;
    }
}

const storeUrlSession: ExpressMiddleware = (req: Request, res: Response, next: NextFunction) => {
    if (req.session) {
        req.session.redirect = req.query.redirect as string;
    }
    next();
};

export default storeUrlSession;
