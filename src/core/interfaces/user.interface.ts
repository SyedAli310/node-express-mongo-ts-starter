import { Types, Document } from "mongoose";

export interface IUser extends Document {
    _id: Types.ObjectId;
    googleId?: string;
    facebookId?: string;
    displayName: string;
    firstName?: string;
    lastName?: string;
    email: string;
    image?: string;
    password?: string;
    friendsList: Array<Types.ObjectId>;
    pendingFriendRequests: Array<Types.ObjectId>;
    upi?: string;
    favoriteGroups: Array<Types.ObjectId>;
    resetPasswordToken?: string | null;
    resetPasswordTokenExpiry?: number | null;
    isEmailVerified: boolean;
    emailVerificationToken?: string | null;
    emailVerificationTokenExpiry?: number | null;
    status: number;
    failedLoginAttempts: number;
    accountLockedUntil?: Date;
    lastLogin?: Date;
    lastPasswordChange?: Date;
    loginHistory: ILoginHistory[];
    emailNotificationsEnabled: boolean;
    isDeleted: boolean;
    createdAt?: Date;
    updatedAt?: Date;

    isAccountLocked: () => boolean;
    incrementFailedLogins: () => Promise<any>;
    resetFailedLogins: () => Promise<any>;
    addLoginHistory: (ip: string | string[] | undefined, userAgent: string | undefined, success: boolean) => void;
    comparePassword: (userPassword: string) => Promise<boolean>;
}
export interface ILoginHistory {
    ip: string;
    userAgent: string;
    timestamp: Date;
    success: boolean;
}
