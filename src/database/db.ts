import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client/web';
import * as schema from './schema';

let dbInstance: any = null;

// Provide a fallback dummy URL to prevent crashes during Static Site Generation (SSG)
export function getDb(env: any) {
    if (dbInstance) return dbInstance;

    const url = env.get("TURSO_DATABASE_URL") || "libsql://dummy-for-build.turso.io";
    const authToken = env.get("TURSO_AUTH_TOKEN") || "dummy";

    const client = createClient({
      url,
      authToken,
    });

    dbInstance = drizzle(client, { schema });
    return dbInstance;
}
