import { Request, Response, NextFunction } from 'express';
import AppConfig from "../../config/appconfig";
import { ExpressMiddleware } from '../../core/types/middleware.type';

/**
 * Middleware to ensure that a user is authenticated before allowing access to the next handler.
 *
 * Checks if the request is authenticated by verifying the presence of `req.isAuthenticated()`
 * and a valid `req.user` object with an `_id` property. If the user is authenticated, the request
 * proceeds to the next middleware or route handler. Otherwise, it responds with a 401 Unauthorized
 * status, an error message, and a `redirectTo` property pointing to the client application's login page.
 *
 * @param req - Express request object, expected to have `isAuthenticated` and `user` properties.
 * @param res - Express response object, used to send a 401 response if authentication fails.
 * @param next - Express next function, called if authentication is successful.
 *
 * @returns Calls `next()` if authenticated, otherwise sends a 401 JSON response.
 */
const ensureAuthenticated: ExpressMiddleware = (req: Request, res: Response, next: NextFunction) => {
    if (req.isAuthenticated && req.isAuthenticated() && req.user && (req.user as any)._id) {
        return next();
    }
    return res.status(401).json({
        error: true,
        msg: 'Unauthorized',
        redirectTo: `${AppConfig.clientAppURL}/login`
    });
};

const Auth = {
    ensureAuthenticated,
};

export default Auth;
