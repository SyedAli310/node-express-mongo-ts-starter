import passport from "passport";
import crypto from "crypto";
import { Request, Response, NextFunction } from "express";

import { User, UserSession } from "../../database/models";
import { emailSender as mailer, Logger } from "../../services";
import { WELCOME_TEMPLATE } from "../../email-templates";
import AppConfig from "../../config/appconfig";
import { IUser } from "../../core/interfaces/user.interface";
import { UserStatus } from "../../core/constants/Constants";
import { IAuthenticatedRequest } from "../../core/interfaces/auth-request.interface";
import Utils from "../../utils";

const GoogleLogin = (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate("google", { scope: ["profile", "email"] })(req, res);
};

const FacebookLogin = (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate("facebook", { scope: ["public_profile", "email"] })(req, res);
};

const UserLogin = (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.json({
                error: true,
                msg: `Missing required fields`,
            });
        }
        passport.authenticate("local", {}, function (error: any, user: IUser, info: any) {
            if (error) {
                return res.json({
                    error: true,
                    msg: "Error authenticating user",
                    actualError: error.message,
                });
            }
            if (!user) {
                return res.json({
                    error: true,
                    msg: info.message || "Authentication failed",
                    canSetPassword: info?.canSetPassword ?? false,
                    userStatus: info?.userStatus ?? null,
                    actualError: info?.actualError ?? 'NA'
                });
            }
            req.logIn(user, async function (error: any) {
                if (error) {
                    return res.json({
                        error: true,
                        msg: "Failed to log in",
                        actualError: error.message
                    });
                }
                await user.resetFailedLogins();
                await user.addLoginHistory(req.logMeta?.ip, req.logMeta?.userAgent, true);
                await Utils.createUserSession(req, user._id);
                const userResponse = JSON.parse(JSON.stringify(user));
                delete userResponse['password'];
                delete userResponse['emailVerificationToken'];
                delete userResponse['emailVerificationTokenExpiry'];
                delete userResponse['resetPasswordToken'];
                delete userResponse['resetPasswordTokenExpiry'];
                delete userResponse['googleId'];
                res.json({
                    error: false,
                    msg: "Login successful",
                    user: userResponse,
                });
            });
        })(req, res, next);
    } catch (error: any) {
        Logger.error('Error Logging in', { actualError: error.message, errorStack: error.toString(), ...Logger.getErrorOrigin(error) }, req.logMeta);
        res.json({
            error: true,
            msg: "Error logging in",
            actualError: error.message,
        });
    }
};

const UserSignup = async (req: Request, res: Response) => {
    try {
        const { firstName, lastName, email, password } = req.body;
        const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
        if (!firstName || !lastName || !email || !password) {
            return res.json({
                error: true,
                msg: `Missing required fields ${!firstName ? "[firstName]" : ""} ${!lastName ? "[lastName]" : ""} ${!email ? "[email]" : ""} ${!password ? "[password]" : ""}`,
            });
        }
        const isEmailValid = emailRegex.test(email);
        if (!isEmailValid) {
            return res.json({
                error: true,
                msg: "Invalid email address",
            });
        }
        const userWithSameEmail = await User.findOne({ email: { $regex: new RegExp("^" + email + "$", "i") } });
        if (userWithSameEmail) {
            return res.json({
                error: true,
                msg: `Email already exists`,
            });
        }
        const emailVerificationToken = crypto.randomBytes(32).toString("hex");
        const displayName = `${firstName?.trim() + " " + lastName?.trim()}`;
        const newUser = await User.create({
            googleId: null,
            displayName,
            firstName,
            lastName,
            email,
            password,
            isEmailVerified: process.env.ENV !== "PROD",
            emailVerificationToken: process.env.ENV !== "PROD" ? null : emailVerificationToken,
            emailVerificationTokenExpiry: process.env.ENV !== "PROD" ? null : Date.now() + 3600000,
            image: `https://ui-avatars.com/api/?name=${displayName}&background=random`,
        });
        if (!newUser) {
            return res.status(400).json({
                error: true,
                msg: "Error signing up",
            });
        }
        await mailer.send(
            [email],
            `💸 Greetings 💸`,
            WELCOME_TEMPLATE({ displayName: displayName })
        );

        // Send verification email if required [PLACEHOLDER]

        return res.status(201).json({
            error: false,
            msg: "Account created",
            newUser,
        });
    } catch (error: any) {
        Logger.error('Error signing up', { actualError: error.message, errorStack: error.toString(), ...Logger.getErrorOrigin(error) }, req.logMeta);
        res.json({
            error: true,
            msg: "Couldn't signup",
            actualError: error.message,
        });
    }
};

const UserLogout = async (req: Request, res: Response) => {
    if (!req.isAuthenticated() || !req.user) {
        return res.status(200).json({
            error: true,
            msg: 'Not authenticated'
        });
    }
    await UserSession.deleteOne({ userId: (req.user as IUser)._id, sessionId: req.sessionID });
    req.logout(req.user, (error: any) => {
        if (error) {
            return res.status(200).json({
                error: true,
                msg: 'Error logging out',
                actualError: error.message
            });
        }
        req.session.destroy(() => {
            res.status(200).json({
                error: false,
                msg: 'Logged out successfully'
            });
        });
    });
};

const GoogleAuthCallback = (req: Request, res: Response, next: NextFunction) => {
    const successRedirect = req.session.redirect;
    passport.authenticate("google", (err: any, user: IUser, info: any) => {
        if (err || !user) {
            // Send error info to frontend
            // Redirect to login and send error info to frontend
            if (info?.accountLocked) {
                return res.redirect(
                    `${AppConfig.clientAppURL}/login?error=${true}&message=${encodeURIComponent("account_locked")}&lockedUntill=${encodeURIComponent(info?.accountLockedUntil)}`
                );
            }
            return res.redirect(
                `${AppConfig.clientAppURL}/login?error=${true}&message=${encodeURIComponent("auth_failed")}&userStatus=${encodeURIComponent(info?.userStatus || UserStatus.DISABLED)}`
            );
        }
        req.logIn(user, async (err) => {
            if (err) {
                return res.status(500).json({
                    error: true,
                    msg: "Login failed",
                    actualError: err.message,
                });
            }
            // On success, redirect
            await user.resetFailedLogins();
            await user.addLoginHistory(req.logMeta?.ip, req.logMeta?.userAgent, true);
            await Utils.createUserSession(req, user._id);
            return res.redirect(
                !!successRedirect
                    ? `${AppConfig.clientAppURL}/` + successRedirect
                    : `${AppConfig.clientAppURL}/groups`
            );
        });
    })(req, res, next);
};

const FacebookAuthCallback = (req: Request, res: Response, next: NextFunction) => {
    const successRedirect = req.session.redirect;
    passport.authenticate("facebook", (err: any, user: IUser, info: any) => {
        if (err || !user) {
            // Send error info to frontend
            // Redirect to login and send error info to frontend
            return res.redirect(
                `${AppConfig.clientAppURL}/login?error=${true}&message=${encodeURIComponent("auth_failed")}&userStatus=${encodeURIComponent(info?.userStatus || UserStatus.DISABLED)}`
            );
        }
        req.logIn(user, async (err) => {
            if (err) {
                return res.status(500).json({
                    error: true,
                    msg: "Login failed",
                    actualError: err.message,
                });
            }
            // On success, redirect
            await user.resetFailedLogins();
            await user.addLoginHistory(req.logMeta?.ip, req.logMeta?.userAgent, true);
            await Utils.createUserSession(req, user._id);
            return res.redirect(
                !!successRedirect
                    ? `${AppConfig.clientAppURL}/` + successRedirect
                    : `${AppConfig.clientAppURL}/groups`
            );
        });
    })(req, res, next);
};

const CheckLoginStatus = (req: Request | IAuthenticatedRequest, res: Response) => {
    try {
        if (req.isAuthenticated()) {
            const loggedInUser: IUser = (req.user as IUser);
            return res.json({
                success: true,
                user: {
                    _id: loggedInUser._id,
                    displayName: loggedInUser.displayName,
                    email: loggedInUser.email,
                    image: loggedInUser.image,
                    pendingFriendRequests: loggedInUser.pendingFriendRequests,
                    isEmailVerified: !!loggedInUser.googleId || loggedInUser?.isEmailVerified,
                    emailVerificationTokenExpiry: loggedInUser.emailVerificationTokenExpiry,
                    isPasswordSet: loggedInUser?.password != null && !!loggedInUser?.password,
                    isGoogleAccount: loggedInUser?.googleId != null,
                    isFacebookAccount: loggedInUser?.facebookId != null,
                    status: loggedInUser.status,
                },
                auth: req.isAuthenticated(),
            });
        }
        return res.json({
            success: false,
            user: null,
            auth: req.isAuthenticated(),
        });
    } catch (error: any) {
        Logger.error('Error fetching auth status', { actualError: error.message, errorStack: error.toString(), ...Logger.getErrorOrigin(error) }, req.logMeta);
        return res.json({
            success: false,
            user: null,
            auth: req.isAuthenticated(),
        });
    }
};

const ForgotPassword = async (req: Request, res: Response) => {
    const { userEmail } = req.body;
    try {
        if (!userEmail) {
            return res.json({
                error: true,
                msg: `Provide email to reset password`,
            });
        }
        const user = await User.findOne({ email: userEmail });
        if (!user) {
            return res.json({
                error: false,
                msg: "If this email exists, a reset link has been sent.",
            });
        }
        if (user.isAccountLocked()) {
            return res.json({
                error: true,
                msg: "Your account is temporarily locked",
                accountLocked: true,
                accountLockedUntil: user.accountLockedUntil,
                actualError: "ACCOUNT_LOCKED",
            });
        }
        if (user.status !== UserStatus.ACTIVE) {
            return res.json({
                error: true,
                msg: `Your account is ${UserStatus.getById(user.status).toLowerCase()}. Please contact support.`,
                userStatus: user.status,
                actualError: `ACCOUNT_${UserStatus.getById(user?.status)?.toUpperCase() || UserStatus.getById(UserStatus.DISABLED).toUpperCase()}`
            });
        }
        if (!user?.password) {
            return res.json({
                error: true,
                msg: `Password not set for ${user.email}`,
            });
        }
        const resetPasswordToken = crypto.randomBytes(32).toString("hex");
        user.resetPasswordToken = resetPasswordToken;
        user.resetPasswordTokenExpiry = Date.now() + 3600000; // 1 hour
        await user.save();
        
        // Send Reset email if required [PLACEHOLDER]

        return res.status(200).json({
            error: false,
            msg: "If this email exists, a reset link has been sent.",
        });
    } catch (error: any) {
        Logger.error('Error in forget password', { actualError: error.message, errorStack: error.toString(), ...Logger.getErrorOrigin(error) }, req.logMeta);
        res.json({
            error: true,
            msg: "Error resetting password",
            actualError: error.message,
        });
    }
};

const ResetPassword = async (req: Request, res: Response) => {
    const { token, newPassword, logoutOtherSessions } = req.body as { token: string, newPassword: string, logoutOtherSessions?: boolean };
    try {
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordTokenExpiry: { $gt: Date.now() },
        });
        if (!user) {
            return res.json({
                error: true,
                msg: `Invalid or expired token.`,
                isTokenExpired: true,
            });
        }
        if (user.isAccountLocked()) {
            return res.json({
                error: true,
                msg: "Your account is temporarily locked",
                accountLocked: true,
                accountLockedUntil: user.accountLockedUntil,
                actualError: "ACCOUNT_LOCKED",
            });
        }
        if (user.status !== UserStatus.ACTIVE) {
            return res.json({
                error: true,
                msg: `Your account is ${UserStatus.getById(user.status).toLowerCase()}. Please contact support.`,
                userStatus: user.status,
                actualError: `ACCOUNT_${UserStatus.getById(user?.status)?.toUpperCase() || UserStatus.getById(UserStatus.DISABLED).toUpperCase()}`
            });
        }
        if (!newPassword?.length || newPassword.length < 6) {
            return res.json({
                error: true,
                msg: `Password should be 6 characters`,
            });
        }
        const isNewAndOldPasswordSame = await user.comparePassword(newPassword);
        if (isNewAndOldPasswordSame) {
            return res.json({
                error: true,
                msg: `New password can't match the old one`
            });
        }
        if (logoutOtherSessions === true) {
            await Utils.deleteUserSessions(user._id, req.sessionID);
        }
        user.password = newPassword;
        user.resetPasswordToken = null;
        user.resetPasswordTokenExpiry = null;
        await user.save();
        return res.status(200).json({
            error: false,
            msg: "Password updated successfully",
        });
    } catch (error: any) {
        Logger.error('Error resetting password', { actualError: error.message, errorStack: error.toString(), ...Logger.getErrorOrigin(error) }, req.logMeta);
        res.json({
            error: true,
            msg: "Error resetting password",
            actualError: error.message,
        });
    }
};

const VerifyEmail = async (req: Request, res: Response) => {
    const { token } = req.params;
    try {
        const user = await User.findOne({
            emailVerificationToken: token,
            emailVerificationTokenExpiry: { $gt: Date.now() },
        });
        if (!user) {
            return res.redirect("/groups?tokenExpired=true");
        }
        user.isEmailVerified = true;
        user.emailVerificationToken = null;
        user.emailVerificationTokenExpiry = null;
        await user.save();
        return res.redirect("/groups");
    } catch (error: any) {
        Logger.error('Error verifying email', { actualError: error.message, errorStack: error.toString(), ...Logger.getErrorOrigin(error) }, req.logMeta);
        return res.status(500).json({
            error: true,
            msg: "Something went wrong during verification",
            actualError: error?.message,
        });
    }
};

const ResendVerificationLink = async (req: Request, res: Response) => {
    const email = (req.user as IUser).email;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(200).json({
                error: true,
                msg: `No user with email ${email}`,
            });
        }
        if (user.isEmailVerified) {
            return res.status(200).json({
                error: true,
                msg: `Email already verified for ${user.displayName}`,
            });
        }
        const emailVerificationToken = crypto.randomBytes(32).toString("hex");
        user.emailVerificationToken = emailVerificationToken;
        user.emailVerificationTokenExpiry = Date.now() + 3600000;
        await user.save();
        res.status(200).json({
            error: false,
            msg: "A verification link has been sent",
        });

        // Send verification email if required [PLACEHOLDER]
        
        return;
    } catch (error: any) {
        Logger.error('Error sending verification link', { actualError: error.message, errorStack: error.toString(), ...Logger.getErrorOrigin(error) }, req.logMeta);
        res.status(500).json({
            error: true,
            msg: "Something went wrong while sending verification link",
            actualError: error.message,
        });
    }
};

const SetPassword = async (req: Request, res: Response) => {
    const { password } = req.body;
    try {
        const loggedInUser = req.user as any;
        if (!password?.trim()) {
            return res.status(200).json({
                error: true,
                msg: 'Please provde password'
            });
        }
        if (password?.length < 6) {
            return res.status(200).json({
                error: true,
                msg: 'Password should be atleast 6 characters'
            });
        }
        if (!!loggedInUser.password) {
            return res.status(200).json({
                error: true,
                msg: `Password already set for ${loggedInUser.displayName}`
            });
        }
        if (!loggedInUser.googleId) {
            return res.status(200).json({
                error: true,
                msg: 'Only available for Google accounts'
            });
        }
        const userToUpdate = await User.findById(loggedInUser._id);
        if (!userToUpdate) {
            return res.status(200).json({
                error: true,
                msg: 'User not found'
            });
        }
        userToUpdate.password = password;
        await userToUpdate.save();
        return res.status(200).json({
            error: false,
            msg: 'Password set successfully'
        });
    } catch (error: any) {
        Logger.error('Error setting password', { actualError: error.message, errorStack: error.toString(), ...Logger.getErrorOrigin(error) }, req.logMeta);
        return res.status(200).json({
            error: true,
            msg: 'Error setting password',
            actualError: error.message
        });
    }
};

const ChangePassword = async (req: Request, res: Response) => {
    const { oldPassword, newPassword, logoutOtherSessions } = req.body as { oldPassword: string, newPassword: string, logoutOtherSessions?: boolean };
    try {
        const loggedInUser = await User.findById((req.user as IUser)._id);
        if (!loggedInUser) {
            return res.status(200).json({
                error: true,
                msg: 'User not found'
            });
        }
        if (!oldPassword?.trim()) {
            return res.status(200).json({
                error: true,
                msg: 'Please provide old password'
            });
        }
        const passwordMatches = await loggedInUser.comparePassword(oldPassword);
        if (!passwordMatches) {
            return res.status(200).json({
                error: true,
                msg: `Incorrect password for ${loggedInUser.displayName}`
            });
        }
        if (!newPassword?.trim()) {
            return res.status(200).json({
                error: true,
                msg: 'Please provide password'
            });
        }
        if (newPassword?.length < 6) {
            return res.status(200).json({
                error: true,
                msg: 'Password should be atleast 6 characters'
            });
        }
        if (!loggedInUser.password) {
            return res.status(200).json({
                error: true,
                msg: `Password not set for ${loggedInUser.displayName}`
            });
        }
        const isNewAndOldPasswordSame = await loggedInUser.comparePassword(newPassword);
        if (isNewAndOldPasswordSame) {
            return res.json({
                error: true,
                msg: `New password can't match the old one`
            });
        }
        if (logoutOtherSessions === true) {
            await Utils.deleteUserSessions(loggedInUser._id, req.sessionID);
        }
        loggedInUser.password = newPassword;
        await loggedInUser.save();
        return res.status(200).json({
            error: false,
            msg: 'Password changed successfully'
        });
    } catch (error: any) {
        Logger.error('Error changing password', { actualError: error.message, errorStack: error.toString(), ...Logger.getErrorOrigin(error) }, req.logMeta);
        return res.status(200).json({
            error: true,
            msg: 'Error changing password',
            actualError: error.message
        });
    }
};

export default {
    GoogleLogin,
    GoogleAuthCallback,
    FacebookLogin,
    FacebookAuthCallback,
    UserLogin,
    UserSignup,
    UserLogout,
    CheckLoginStatus,
    ForgotPassword,
    ResetPassword,
    VerifyEmail,
    ResendVerificationLink,
    SetPassword,
    ChangePassword,
};
