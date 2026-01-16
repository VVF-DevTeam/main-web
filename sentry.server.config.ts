// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
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
