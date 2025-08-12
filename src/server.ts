import "dotenv/config";
import Express from 'express';
import logColor from 'cli-color';
import { Server } from 'http';
import { Mongoose } from "mongoose";

import AppConfig from './config/appconfig';
import connectDB from './database/connect';
import Utils from './utils';
import { createApp } from './app';
import { Logger } from './services';

// Create Express application
const ExpressApp: Express.Application = createApp();

// Port configuration
const PORT = process.env.PORT || AppConfig.PORT;

// Initiate server & DB connection
// This is wrapped in an async IIFE to handle async/await properly
(async () => {
    try {
        const mongoConn: Mongoose = await connectDB(process.env.MONGO_URI!);
        const server: Server = ExpressApp.listen(PORT, () => Utils.printStartupInfo(mongoConn, PORT));
        Utils.handleGraceFullShutdown(server);
    } catch (error: any) {
        Logger.error('Error starting backend server', {
            actualError: error.message,
            errorStack: error.toString(),
            ...Logger.getErrorOrigin(error),
        });
        console.log(logColor.red(error));
        process.exit(1);
    }
})();

export default ExpressApp;