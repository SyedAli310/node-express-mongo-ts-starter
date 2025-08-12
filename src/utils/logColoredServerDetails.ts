import { Mongoose } from "mongoose";
import logColor from "cli-color";
import figlet from "figlet";
import os from "os";

import AppConfig from '../config/appconfig';

export function logColoredServerDetails(mongoConn: Mongoose, PORT: number | string): void {
    const cpus = os.cpus().length;
    const network = os.networkInterfaces(); 
    const evnBaseURL = `${AppConfig.apiBaseURL}/api-docs`;
    const lines = [
        logColor.green('🚀 Server started successfully!'),
        '',
        logColor.blueBright.bold('Server Machine: ') + logColor.yellow.bold(require("os").hostname()),
        logColor.blueBright.bold('Build: ') + logColor.cyanBright.bold(`${AppConfig.appName.toLowerCase()}@${AppConfig.appVersion}`),
        logColor.blueBright.bold('Listening on Port: ') + logColor.magentaBright.bold(PORT),
        logColor.blueBright.bold('MongoDB Host(s): ') + logColor.redBright.bold(mongoConn.connections.map((conn: any) => conn.host).join(', ')),
        logColor.blueBright.bold('Database Name: ') + logColor.green.bold(mongoConn.connections[0].name),
        // '',
        // logColor.xterm(200)('CPU Cores: ') + logColor.white(cpus),
        // logColor.xterm(200)('Network Interfaces: ') + logColor.white(Object.keys(network).join(', ')),
        '',
        logColor.xterm(180)('API Docs at: ') +
        logColor.cyan(`${evnBaseURL}`),
        '',
        logColor.xterm(240)('Press Ctrl+C to stop the server.')
    ];
    const plainLines = [
        '🚀 Server started successfully!',
        '',
        `Server Machine: ${require("os").hostname()}`,
        `Build: ${AppConfig.appName.toLowerCase()}@${AppConfig.appVersion}`,
        `Listening on Port: ${PORT}`,
        `MongoDB Host(s): ${mongoConn.connections.map((conn: any) => conn.host).join(', ')}`,
        `Database Name: ${mongoConn.connections[0].name}`,
        // '',
        // `CPU Cores: ${cpus}`,
        // `Network Interfaces: ${Object.keys(network).join(', ')}`,
        '',
        'API Docs at: ' +
        `${evnBaseURL}`,
        '',
        'Press Ctrl+C to stop the server.'
    ];
    const maxLength = Math.max(...plainLines.map(l => l.length));
    const horizontal = '─'.repeat(maxLength + 2);
    // Rounded corners: ╭ ─ ╮ │ ╰ ╯
    console.log(logColor.xterm(240)(`╭${horizontal}╮`));
    // Fun ASCII Art using figlet
    const art = figlet.textSync('ts-node', {
        font: 'Standard',
        width: maxLength,
        horizontalLayout: 'default',
        verticalLayout: 'default'
    }).split('\n');

    art.forEach(line => {
        const totalPad = maxLength - line.length;
        const leftPad = Math.floor(totalPad / 2);
        const rightPad = totalPad - leftPad;
        console.log(logColor.xterm(240)(`│ ${' '.repeat(leftPad)}${logColor.xterm(45)(line)}${' '.repeat(rightPad)} │`));
    });

    console.log(logColor.xterm(240)(`├${horizontal}┤`));

    lines.forEach((line, idx) => {
        const pad = ' '.repeat(maxLength - plainLines[idx].length);
        console.log(logColor.xterm(240)(`│ ${line}${pad} │`));
    });
    console.log(logColor.xterm(240)(`╰${horizontal}╯`));
}