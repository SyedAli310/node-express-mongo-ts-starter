// init dotenv
require("dotenv").config();
import AppConfig from "../config/appconfig";

// nodemailer import
const nodemailer = require("nodemailer");

import type { SendMailOptions } from 'nodemailer';
import { WELCOME_TEMPLATE } from "../email-templates";

const createBrevoTransport = () => {
    return nodemailer.createTransport({
        host: "smtp-relay.brevo.com",
        port: 587,
        auth: {
            user: process.env.GOOGLE_MAIL_USER,
            pass: process.env.BREVO_SMTP_KEY,
        },
    });
};

const send = async (
    recipients: string[] = [],
    subject: string = "💸 Greetings 💸",
    template: string = '',
    contextUser: any = null
): Promise<any> => {
    if (AppConfig.env !== 'PROD') {
        return;
    }
    try {
        // const newAccessToken = await OAuth2_Client.getAccessToken(); // for Google Auth 2.0 Transport
        const currentTransporter = createBrevoTransport();
        const mailOptions: SendMailOptions = {
            from: `TS Node <${process.env.GOOGLE_MAIL_USER}>`,
            to: recipients,
            subject: subject && subject.trim() ? subject : "💸 Greetings 💸",
            html: template && template.trim() ? template : WELCOME_TEMPLATE({ displayName: "User" }),
        };
        return new Promise((resolve, reject) => {
            currentTransporter.sendMail(mailOptions, (error: Error | null, info: any) => {
                error
                    ? reject({ error: true, actualError: error })
                    : resolve({ error: false, info });
            });
        });
    } catch (error: any) {
        return {
            error: true,
            actualError: error.message,
        };
    }
};

export default { send };
