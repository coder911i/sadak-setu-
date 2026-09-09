import swaggerJsdoc from 'swagger-jsdoc';
import { config } from './index';

const host = config.env === 'production' ? process.env.HOST || '0.0.0.0' : 'localhost';
const protocol = config.env === 'production' ? (process.env.USE_HTTPS === 'true' ? 'https' : 'http') : 'http';
const serverUrl = `${protocol}://${host}:${config.port}${config.apiPrefix}`;

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Sadak Setu API Documentation',
      version: '1.0.0',
      description:
        'Production backend API specification for Sadak Setu — AI-Powered Road Health & Maintenance Intelligence System.',
      contact: {
        name: 'Sadak Setu Engineering Team',
      },
    },
    servers: [
      {
        url: serverUrl,
        description: config.env === 'production' ? 'Production Server' : 'Development Server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.ts', './src/app.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
