import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs";
import { UserStatus } from "../../core/constants/Constants";
import { IUser } from '../../core/interfaces/user.interface';
import Utils from "../../utils";

const UserSchema = new Schema<IUser>({
    googleId: {
        type: String
    },
    facebookId: {
        type: String
    },
    displayName: {
        type: String,
        required: true,
    },
    firstName: {
        type: String,
    },
    lastName: {
        type: String,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    image: {
        type: String,
    },
    password: {
        type: String,
        minlength: 6,
    },
    resetPasswordToken: {
        type: String,
        default: null
    },
    resetPasswordTokenExpiry: {
        type: Number,
        default: null
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    emailVerificationToken: {
        type: String,
        default: null
    },
    emailVerificationTokenExpiry: {
        type: Number,
        default: null
    },
    status: {
        type: Number,
        enum: Object.values(UserStatus).filter(v => typeof v === 'number'),
        required: [true, 'User status is required'],
        default: UserStatus.ACTIVE,
    },
    failedLoginAttempts: {
        type: Number,
        default: 0,
        min: 0
    },
    accountLockedUntil: {
        type: Number,
        default: null
    },
    lastLogin: {
        type: Date,
        default: null
    },
    lastPasswordChange: {
        type: Date,
        default: Date.now
    },
    loginHistory: [{
        ip: String,
        userAgent: String,
        timestamp: { type: Date, default: Date.now },
        success: Boolean
    }],
    emailNotificationsEnabled: {
        type: Boolean,
        default: true
    },
    isDeleted: {
        type: Boolean,
    }
},
    { timestamps: true }
);

UserSchema.pre<IUser>("save", async function () {
    if (this.isModified("password")) {
        if (this.password) {
            const salt = await bcrypt.genSalt(12);
            this.password = await bcrypt.hash(this.password, salt);
            this.lastPasswordChange = new Date();
        }
    }
});

UserSchema.methods.isAccountLocked = function(): boolean {
    return !!(this.accountLockedUntil && this.accountLockedUntil > Date.now());
};

UserSchema.methods.incrementFailedLogins = async function() {
    if (this.accountLockedUntil && this.accountLockedUntil < Date.now()) {
        this.accountLockedUntil = null;
        this.failedLoginAttempts = 0;
        return this.save();
    }
    this.failedLoginAttempts += 1;
    if (this.failedLoginAttempts >= 5 && !this.isAccountLocked()) {
        this.accountLockedUntil = Date.now() + Utils.millisecondsIn(5, 'minute')!;
    }
    return this.save();
};

UserSchema.methods.resetFailedLogins = async function() {
    this.failedLoginAttempts = 0;
    this.accountLockedUntil = null;
    this.lastLogin = new Date();
    return this.save();
};

UserSchema.methods.addLoginHistory = function(ip: string, userAgent: string, success: boolean) {
    if (this.loginHistory.length >= 10) {
        this.loginHistory = this.loginHistory.slice(-9);
    }
    this.loginHistory.push({
        ip,
        userAgent,
        timestamp: new Date(),
        success
    });
    return this.save();
};

UserSchema.methods.comparePassword = async function (userPassword: string) {
    const isMatched = await bcrypt.compare(userPassword, this.password);
    return isMatched;
};

export default mongoose.model<IUser>("User", UserSchema);
