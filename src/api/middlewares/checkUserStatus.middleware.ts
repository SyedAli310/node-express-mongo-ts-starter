import { NextFunction, Response, Request } from "express";
import { UserStatus } from "../../core/constants/Constants";
import { ExpressMiddleware } from "../../core/types/middleware.type";
import { IAuthenticatedRequest } from "../../core/interfaces/auth-request.interface";
import { STATUS_CODES } from "http";

const CheckUserStatus: ExpressMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const user = (req as IAuthenticatedRequest)?.user || req.user || null;
    if (!user || !user?.status) {
        return res.status(200).json({
            msg: "User status is not defined or user is not authenticated.",
            error: true,
            actualError: "USER_NOT_AUTHENTICATED",
            STATUS_CODE: 401,
        });
    }

    if (user.status !== UserStatus.ACTIVE) {
        return res.status(200).json({
            msg: `Your account is ${UserStatus.getById(user.status).toLowerCase()}. Please contact support.`,
            error: true,
            actualError: `ACCOUNT_${UserStatus.getById(user.status).toUpperCase()}`,
            STATUS_CODE: 403,
            STATUS_CODE_NAME: STATUS_CODES[403] || "Forbidden"
        });
    }

    next();
}

export default CheckUserStatus;