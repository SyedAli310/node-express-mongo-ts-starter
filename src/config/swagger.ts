import express from 'express';
import fs from 'fs';
import path from 'path';
import swaggerUi from 'swagger-ui-express';

import AppConfig from './appconfig';

/**
 * Sets up Swagger UI documentation for the Express application.
 * 
 * This function configures and serves the Swagger UI at the `/api-docs` endpoint,
 * but only when the application is running in local or development environments.
 * It dynamically updates the OpenAPI specification's version and server URL based
 * on the current application configuration.
 * 
 * @param app - The Express application instance to attach the Swagger UI to.
 */
export const setupSwagger = (app: express.Application): void => {
    if (AppConfig.isLocal) {
        const openApiSpec = JSON.parse(fs.readFileSync(path.join(__dirname, 'openapi.json'), 'utf8'));
        
        // Update version dynamically
        openApiSpec.info.version = AppConfig.appVersion; 
    
        // Set the server URL based on the environment
        openApiSpec.servers = [{
            url: AppConfig.apiBaseURL,
            description: "Local server" 
        }];
        // Serve Swagger UI documentation
        app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiSpec));
    }
}