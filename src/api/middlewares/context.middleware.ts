// middlewares/context.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { Context } from '../../utils/contextHandler';
import { IUser } from '../../core/interfaces/user.interface';

export function ContextMiddleware(req: Request, res: Response, next: NextFunction) {
    Context.run({ user: req.user as IUser, req }, () => {
        next();
    });
}
