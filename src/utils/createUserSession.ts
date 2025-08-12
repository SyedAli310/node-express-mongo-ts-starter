
import { UAParser } from 'ua-parser-js';
import { Types } from 'mongoose';
import axios from "axios";
import { Request } from 'express';

import { UserSession } from '../database/models';
import { Logger } from '../services';

export async function createUserSession(req: Request, userId: Types.ObjectId): Promise<any> {
    try {        
        const parser = new UAParser();
        const ua = req.headers['user-agent'];
        const deviceInfo = parser.setUA(ua as string).getResult();

        // get location data from IP
        const userIP = req.ip || req.headers['x-forwarded-for'] || '';
        const response = await axios.get(`https://ipapi.co/${Array.isArray(userIP) ? userIP[0] : userIP}/json/`);
        const locationData = response.data;
    
        const sessionCreated = await UserSession.create({
            userId: userId,
            sessionId: req.sessionID,
            ip: req.ip || req.headers['x-forwarded-for'],
            userAgent: ua,
            device: `${deviceInfo.os.name} ${deviceInfo.os.version} - ${deviceInfo.browser.name} ${deviceInfo.browser.version}`,
            location: locationData // optional, async call
        });

        if (!sessionCreated) {
            return {
                error: true,
                msg: `Failed to create user session for ${userId}`
            };
        }

        return {
            error: false,
            msg: `User session created successfully for ${userId}`,
            sessionId: sessionCreated._id.toString(),
            userId
        }
    } catch (error: any) {
        Logger.error(`Error creating user session for ${userId}`, { actualError: error.message, errorStack: error.toString(), ...Logger.getErrorOrigin(error) }, req.logMeta);
        return {
            error: true,
            msg: `Failed to create user session for ${userId}`,
            actualError: error instanceof Error ? error.message : String(error),
            origin: Logger.getErrorOrigin(error)
        }
    }
}