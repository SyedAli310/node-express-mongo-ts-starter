import { Document, Types } from "mongoose";

export interface IUserSession extends Document {
    _id: Types.ObjectId;
    userId: Types.ObjectId;
    sessionId: string;
    loginTime: Date;
    lastSeen: Date;
    ip: string;
    userAgent: string;
    device: string;
    location: IUserSessionLocation;
    isActive: boolean;
    isCurrentSession?: boolean; // Indicates if this is the current session
    createdAt?: Date;
    updatedAt?: Date;
}

export interface IUserSessionLocation {
    error?: boolean;
    city: string;
    continent_code: string;
    country: string;
    country_code: string;
    country_code_iso3: string;
    country_name: string;
    currency: string;
    currency_name: string;
    ip: string;
    latitude: number;
    longitude: number;
    postal: string;
    region: string;
    region_code: string;
    version: string;
}