import mongoose, { Types } from "mongoose";
import { Logger } from "../services";
import { UserSession } from "../database/models";

/**
 * Delete all sessions for a user.
 * @param userId User's ObjectId as string
 * @param exceptSessionId Optional: session ID to keep (for ChangePassword)
 */
export async function deleteUserSessions(userId: Types.ObjectId, exceptSessionId?: string): Promise<any> {
    try {
        const sessionCollection = mongoose.connection.collection('sessions');
        
        const query: any = {
            "session.passport.user": userId.toString()
        };
        if (exceptSessionId) {
            query._id = { $ne: exceptSessionId };
        }
    
        const fetchedSessions = await sessionCollection.find(query).toArray();
        if (fetchedSessions.length === 0) {
            return;
        }
    
        const sessionsDeleted = await sessionCollection.deleteMany(query);
        if (!sessionsDeleted) {
            return {
                error: true,
                msg: `Failed to delete user sessions for ${userId}`
            }
        }

        // delete from UserSession model if it exists exept for the sessionId to keep
        const deleteUserSessionsQuery: any = { userId: userId };
        if (exceptSessionId) {
            deleteUserSessionsQuery.sessionId = { $ne: exceptSessionId };
        }
        const userSessionDeleted = await UserSession.deleteMany(deleteUserSessionsQuery);
        if (!userSessionDeleted) {
            return {
                error: true,
                msg: `Failed to delete user sessions from UserSession model for ${userId}`
            }
        }
        
    } catch (error: any) {
        Logger.error(`Error deleting user session for ${userId}`, { actualError: error.message, errorStack: error.toString(), ...Logger.getErrorOrigin(error) });
        return {
            error: true,
            msg: `Failed to delete user sessions for ${userId}`,
            actualError: error.message,
            origin: Logger.getErrorOrigin(error)
        };
    }
}