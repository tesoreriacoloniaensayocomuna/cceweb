import { createAuthClient } from "better-auth/client";

export const authClient = createAuthClient({
    // In production, this should be the live URL. For now, we leave it empty to use relative paths
    // or point to the localhost URL.
    // baseURL: import.meta.env.VITE_BETTER_AUTH_URL || "http://localhost:5173" 
});
