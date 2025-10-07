import { createClient } from '@base44/sdk';
// import { getAccessToken } from '@base44/sdk/utils/auth-utils';

// Create a client with authentication required
export const base44 = createClient({
  appId: "68becc1fe8f4f1372ccb6d42", 
  requiresAuth: true // Ensure authentication is required for all operations
});
