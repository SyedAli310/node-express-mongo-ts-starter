import { User } from "../database/models";
import { GoogleAuthStrategy, LocalAuthStrategy } from './auth-strategies';
import { PassportStatic } from 'passport';

/**
 * Configures Passport authentication strategies and session handling.
 * 
 * This module sets up Google, Facebook, and Local authentication strategies.
 * It also defines how user instances are serialized and deserialized to and from the session.
 * 
 * Usage:
 *   import initPassport from './passport';
 *   initPassport(passport);
 */
export const initPassport = (passport: PassportStatic) => {
    passport.use(GoogleAuthStrategy);
    passport.use(LocalAuthStrategy);

    passport.serializeUser((user: any, done) => {
        done(null, user.id);
    });

    passport.deserializeUser(async (id, done) => {
        const user = await User.findById(id);
        done(null, user);
    });
};
