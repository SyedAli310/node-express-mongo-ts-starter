import logColor from "cli-color";
import { Server } from "http";

export function handleGraceFullShutdown (server: Server) {
    const shutdown = async () => {
        console.log(logColor.red("\nShutting down server..."));
        server.close(() => {
            console.log(logColor.blueBright("HTTP server closed."));
            process.exit(0);
        });
    };
    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
};
