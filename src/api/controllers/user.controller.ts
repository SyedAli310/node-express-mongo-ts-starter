import { Response } from "express";
import { User } from "../../database/models";
import { Logger } from "../../services";
import Utils from "../../utils";
import moment from "moment";
import axios from "axios";
import AppConfig from "../../config/appconfig";
import { IAuthenticatedRequest } from "../../core/interfaces/auth-request.interface";

// Get logged in user
async function getLoggedInUser(req: IAuthenticatedRequest, res: Response) {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(200).json({ error: true, msg: `No user found with id: ${req.user._id}` });
        }
        res.status(200).json({ error: false, user });
    } catch (error: any) {
        Logger.error('Error fetching logged in user details', { actualError: error.message, errorStack: error.toString(), ...Logger.getErrorOrigin(error) }, req.logMeta);
        res.status(500).json({ error: true, msg: "Something went wrong, please try again later", actualError: error.message });
    }
}

export default {
    getLoggedInUser,
}
