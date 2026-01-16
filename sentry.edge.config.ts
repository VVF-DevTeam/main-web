// This file configures the initialization of Sentry for edge features (middleware, edge routes, and so on).
// The config you add here will be used whenever one of the edge features is loaded.
// Note that this config is unrelated to the Vercel Edge Runtime and is also required when running locally.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

// Check if we're running on AWS Amplify or in development
const isAmplify = process.env.AWS_APP_ID !== undefined || process.env.AWS_EXECUTION_ENV !== undefined;
const isDevelopment = process.env.NODE_ENV === 'development';

// Only initialize Sentry if NOT on AWS Amplify and NOT in development
if (!isAmplify && !isDevelopment) {
  Sentry.init({
    dsn: "https://2e45987640d9603e69f8d5fd7a7e6828@o4510616399708160.ingest.us.sentry.io/4510616401281024",

    // Enable sending user PII (Personally Identifiable Information)
    // https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/options/#sendDefaultPii
    sendDefaultPii: true,
  });
}
