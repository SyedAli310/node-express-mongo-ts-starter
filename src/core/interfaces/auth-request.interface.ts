import { Request } from "express";
import { IUser } from "./user.interface";
import { ILogMeta } from "./log-meta.interface";

export interface IAuthenticatedRequest extends Request {
    user: IUser;
    logMeta: ILogMeta;
}