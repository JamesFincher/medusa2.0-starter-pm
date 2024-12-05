import { loadEnv, defineConfig, Modules } from '@medusajs/framework/utils';

loadEnv(process.env.NODE_ENV || 'development', process.cwd());

const dynamicModules = {};

const stripeApiKey = process.env.STRIPE_API_KEY;
const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

const isStripeConfigured = Boolean(stripeApiKey) && Boolean(stripeWebhookSecret);

if (isStripeConfigured) {
  console.log('Stripe API key and webhook secret found. Enabling payment module');
  dynamicModules[Modules.PAYMENT] = {
    resolve: '@medusajs/medusa/payment',
    options: {
      providers: [
        {
          resolve: '@medusajs/medusa/payment-stripe',
          id: 'stripe',
          options: {
            apiKey: stripeApiKey,
            webhookSecret: stripeWebhookSecret,
            capture: true,
          },
        },
      ],
    },
  };
}

const modules = {
  [Modules.FILE]: {
    resolve: '@medusajs/medusa/file',
    options: {
      providers: [
        {
          resolve: '@medusajs/file-s3',
          options: {
            bucket: process.env.R2_BUCKET_NAME,
            region: 'auto', // for R2
            endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
            credentials: {
              accessKeyId: process.env.R2_ACCESS_KEY,
              secretAccessKey: process.env.R2_SECRET_KEY,
            },
            // If you want files to be publicly accessible
            aws_config_options: {
              signatureVersion: 'v4',
            },
          },
        },
      ],
    },
  },
  [Modules.NOTIFICATION]: {
    resolve: '@medusajs/medusa/notification',
    options: {
      providers: [
        {
          resolve: './src/modules/resend-notification',
          id: 'resend-notification',
          options: {
            channels: ['email'],
            apiKey: process.env.RESEND_API_KEY,
            fromEmail: process.env.RESEND_FROM_EMAIL,
            replyToEmail: process.env.RESEND_REPLY_TO_EMAIL,
            toEmail: process.env.TO_EMAIL,
            enableEmails: process.env.ENABLE_EMAIL_NOTIFICATIONS === 'true',
          },
        },
      ],
    },
  },
  [Modules.CACHE]: {
    resolve: '@medusajs/medusa/cache-redis',
    options: {
      redisUrl: process.env.REDIS_URL,
    },
  },
  [Modules.EVENT_BUS]: {
    resolve: '@medusajs/medusa/event-bus-redis',
    options: {
      redisUrl: process.env.REDIS_URL,
    },
  },
  [Modules.WORKFLOW_ENGINE]: {
    resolve: '@medusajs/medusa/workflow-engine-redis',
    options: {
      redis: {
        url: process.env.REDIS_URL,
      },
    },
  },
};

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    workerMode: process.env.MEDUSA_WORKER_MODE as 'shared' | 'worker' | 'server',
    http: {
      storeCors: process.env.STORE_CORS || '',
      adminCors: process.env.ADMIN_CORS || '',
      authCors: process.env.AUTH_CORS || '',
      jwtSecret: process.env.JWT_SECRET || 'supersecret',
      cookieSecret: process.env.COOKIE_SECRET || 'supersecret',
    },
    redisUrl: process.env.REDIS_URL,
  },
  admin: {
    backendUrl: process.env.BACKEND_URL || 'http://localhost:9000',
    disable: process.env.DISABLE_MEDUSA_ADMIN === 'true',
  },
  modules: {
    ...modules,
    ...dynamicModules,
  },
});
