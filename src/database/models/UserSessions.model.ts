import mongoose from 'mongoose';
import { IUserSession } from '../../core/interfaces/user-session.interface';

const UserSessionSchema = new mongoose.Schema<IUserSession>({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    sessionId: { type: String, required: true },
    loginTime: { type: Date, default: Date.now },
    lastSeen: { type: Date, default: Date.now },
    ip: String,
    userAgent: String,
    device: String, // parsed device info
    location: Object, // city/country
    isActive: { type: Boolean, default: true }
});

export default mongoose.model<IUserSession>('UserSession', UserSessionSchema);