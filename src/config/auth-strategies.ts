import { Strategy as GoogleStrategy, Profile as GoogleProfile } from "passport-google-oauth20";
import { Strategy as LocalStrategy } from "passport-local";
import { VerifyCallback } from "passport-oauth2";

import { WELCOME_TEMPLATE } from "../email-templates";
import { emailSender as mailer } from "../services";
import { User } from "../database/models";
import { UserStatus } from "../core/constants/Constants";

const GoogleAuthStrategy = new GoogleStrategy(
    {
        clientID: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        callbackURL: "/api/v1/auth/google/callback",
    },
    async (accessToken: string, refreshToken: string, profile: GoogleProfile, done: VerifyCallback) => {
        const { id, displayName, name, photos, emails } = profile;
        const { familyName, givenName } = name || {};
        const value = photos?.[0]?.value;
        const email = emails?.[0]?.value;
        try {
            const googleUser = await User.findOne({ googleId: id });
            if (googleUser) {
                if (googleUser.status !== UserStatus.ACTIVE) {
                    return done(null, false, {
                        message: `Your account is ${UserStatus.getById(googleUser.status).toLowerCase()}. Please contact support.`,
                        error: true,
                        userStatus: googleUser.status,
                        actualError: `ACCOUNT_${UserStatus.getById(googleUser?.status)?.toUpperCase() || UserStatus.getById(UserStatus.DISABLED).toUpperCase()}`
                    } as any);
                }
                if (googleUser.isAccountLocked()) {
                    return done(null, false, {
                        message: "Your account is temporarily locked",
                        accountLocked: true,
                        accountLockedUntil: googleUser.accountLockedUntil,
                        error: true,
                        actualError: "ACCOUNT_LOCKED",
                        STATUS_CODE: 403,
                        STATUS_CODE_NAME: "Forbidden"
                    } as any);
                }
                done(null, googleUser);
            } else {
                const emailUser = await User.findOne({ email });
                if (emailUser) {
                    if (emailUser.status !== UserStatus.ACTIVE) {
                        return done(null, false, {
                            message: `Your account is ${UserStatus.getById(emailUser.status).toLowerCase()}. Please contact support.`,
                            error: true,
                            userStatus: emailUser.status,
                            actualError: `ACCOUNT_${UserStatus.getById(emailUser?.status)?.toUpperCase() || UserStatus.getById(UserStatus.DISABLED).toUpperCase()}`
                        } as any);
                    }
                    emailUser.googleId = id;
                    emailUser.image = value;
                    await emailUser.save();
                    done(null, emailUser);
                    return;
                }
                const newUser = await User.create({
                    googleId: id,
                    displayName,
                    firstName: givenName,
                    lastName: familyName?.trim() ?? "",
                    email,
                    password: null,
                    image: value,
                    isEmailVerified: true,
                });
                if (email) {
                    await mailer.send(
                        [email],
                        `💸 Greetings 💸`,
                        WELCOME_TEMPLATE({ displayName })
                    );
                }
                done(null, newUser);
            }
        } catch (error) {
            console.log(error);
            done(error as Error, false);
        }
    }
);

const LocalAuthStrategy = new LocalStrategy(
    {
        usernameField: "email",
        passwordField: "password",
        session: true,
        passReqToCallback: false,
    },
    async function (username: string, password: string, done) {
        try {
            const user = await User.findOne({ email: username });
            if (!user) {
                return done(null, false, {
                    message: `Invalid email or password`,
                    error: true,
                    actualError: "NON_EXISTENT_EMAIL"
                } as any);
            }
            if (user.googleId && !user?.password) {
                return done(null, false, {
                    message: `Password not set for ${username}`,
                    error: true,
                    actualError: "PASSWORD_UNSET",
                    canSetPassword: !user?.password
                } as any);
            }
            const passwordMatches = await user.comparePassword(password);
            if (!passwordMatches) {
                await user.incrementFailedLogins();
                return done(null, false, {
                    message: `Invalid email or password`,
                    error: true,
                    actualError: "INCORRECT_PASSWORD"
                } as any);
            }
            if (user.status !== UserStatus.ACTIVE) {
                return done(null, false, {
                    message: `Your account is ${UserStatus.getById(user.status).toLowerCase()}. Please contact support.`,
                    error: true,
                    userStatus: user.status,
                    actualError: `ACCOUNT_${UserStatus.getById(user?.status)?.toUpperCase() || UserStatus.getById(UserStatus.DISABLED).toUpperCase()}`
                } as any);
            }
            return done(null, user);
        } catch (error: any) {
            console.log("Local strategy authentication error:", error);
            return done(null, false, {
                message: "An unexpected error occurred. Please try again later.",
                error: true,
                actualError: error.message
            } as any);
        }
    }
);

export {
    GoogleAuthStrategy,
    LocalAuthStrategy,
};
