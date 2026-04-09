/**
 * Shared configuration for all Shopify extensions
 * This allows you to update the Gadget app URL in one place
 */

// Determine environment based on build configuration

const isDevelopment = process.env.NODE_ENV === 'development';

console.log("process.env.NODE_ENV", process.env.NODE_ENV)
// Environment-specific URLs
export const ENVIRONMENTS = {
  development: {
    appUrl: 'https://quotes-draft-order-request--development.gadget.app',
    apiUrl: 'https://quotes-draft-order-request--development.gadget.app/api/graphql',
  },
  production: {
    appUrl: 'https://quotes-draft-order-request.gadget.app',
    apiUrl: 'https://quotes-draft-order-request.gadget.app/api/graphql'
  },
};

// Select the appropriate environment
const currentEnv = isDevelopment ? ENVIRONMENTS.development : ENVIRONMENTS.production;

export const GADGET_CONFIG = {
  appUrl: currentEnv.appUrl,
  apiUrl: currentEnv.apiUrl,
};