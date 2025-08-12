import { Mongoose } from 'mongoose';
import AppConfig from '../config/appconfig';
import { logColoredServerDetails } from './logColoredServerDetails';

// Server details logging (for production/local environments)
export function printStartupInfo(mongoConn: Mongoose, port: number | string) {
    if (process.env.IN_PROD === 'true') {
        console.log(
            `Server machine -> ${require("os").hostname()}` + "\n",
            `Build -> ${AppConfig.appName.toLowerCase() + '@' + AppConfig.appVersion}`  + "\n",
            `Requests port -> ${port}` + "\n",
            `MongoDB Host -> ${mongoConn.connections[0].host}` + "\n",
            `DB Name -> ${mongoConn.connections[0].name}` + "\n"
        );
        return;
    } else {
        logColoredServerDetails(mongoConn, port);
        return;
    }
};