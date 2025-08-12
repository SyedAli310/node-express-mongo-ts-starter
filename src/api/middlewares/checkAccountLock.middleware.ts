import { STATUS_CODES } from "http";
import { IUser } from "../../core/interfaces/user.interface";
import { ExpressMiddleware } from "../../core/types/middleware.type";
import { User } from "../../database/models";

const CheckAccountLocked: ExpressMiddleware = async (req, res, next): Promise<any> => {
    let user: IUser | null = null;

    if (!req?.user) {
        if (!req?.body?.email) {
            // this is the case for Google and Facebook login, this is handled in the auth-strategy
            return next();
        }
        user = await User.findOne({ email: req.body.email }) as IUser;
        if (!user) {
            // give control the the controller
            return next();
        }
    } else {
        user = (req.user as IUser) || null;
    }

    if (!user || !user.isAccountLocked()) {
        return next();
    }

    return res.status(200).json({
        msg: "Your account is temporarily locked",
        accountLocked: true,
        accountLockedUntil: user.accountLockedUntil,
        error: true,
        actualError: "ACCOUNT_LOCKED",
        STATUS_CODE: 403,
        STATUS_CODE_NAME: STATUS_CODES[403]
    });
}

export { CheckAccountLocked };