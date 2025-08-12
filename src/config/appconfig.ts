import dotenv from "dotenv";
dotenv.config();

class AppConfig {
    get env(): string {
        return process.env.ENV?.toUpperCase() || "";
    }

    get appName(): string {
        return "express-mongo-ts-starter";
    }

    get appVersion(): string {
        return '1.0.1';
    }

    get appEmail(): string {
        return 'express-mongo-ts-starter@gmail.com';
    }

    get author(): string {
        return 'Syed Ali (https://github.com/syedali310)';
    }

    get PORT(): number {
        return 5000;
    }

    get clientAppURL(): string {
        switch (this.env) {
            case "LOCAL": return "http://localhost:4200";
            case "DEV": return "https://demo-frontned-dev.com";
            case "PROD": return "https://demo-frontend-prod.com";
            default: return "https://demo-frontend-prod.com";
        }
    }

    get apiBaseURL(): string {
        switch (this.env) {
            case "LOCAL": return `http://localhost:${this.PORT}`;
            case "DEV": return "https://demo-backend-dev.com";
            case "PROD": return "https://demo-backend-prod.com";
            default: return "https://demo-backend-prod.com";
        }
    }

    get isLocal(): boolean {
        return this.env === "LOCAL";
    }

    get isDev(): boolean {
        return this.env === "DEV";
    }

    get isProd(): boolean {
        return this.env === "PROD";
    }

    get authorizedOrigins(): Array<string> {
        switch (this.env) {
            case "LOCAL":
                return ["http://localhost:4200"];
            case "DEV":
                // [NOTE]: localhost:4200 is added for proxying DEV server from local frontend
                return ["https://demo-frontned-dev.com", "http://localhost:4200"];
            case "PROD":
                return ["https://demo-frontend-prod.com"];
            default:
                return ['https://demo-frontend-prod.com'];
        }
    }
}


// export instance of AppConfig to make it singleton
const appConfig = new AppConfig();
export default appConfig;

