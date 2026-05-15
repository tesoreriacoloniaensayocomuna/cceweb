import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { getDb } from "../database/db";
import * as schema from "../database/schema";

import { eq } from 'drizzle-orm';

import { admin } from "better-auth/plugins";

let authInstance: any = null;

export function getAuth(env: any, request?: Request) {
    const secret = env.get("BETTER_AUTH_SECRET") || "fallback_secret_for_ssg_build";
    
    // Si no hay BETTER_AUTH_URL, intentamos deducirla del request o fallback a localhost
    let url = env.get("BETTER_AUTH_URL");
    if (!url && request) {
        const origin = new URL(request.url).origin;
        url = origin;
    }
    if (!url) url = "http://localhost:5173";

    if (authInstance && authInstance._lastSecret === secret && authInstance._lastUrl === url) {
        return authInstance;
    }
    
    authInstance = betterAuth({
        database: drizzleAdapter(getDb(env), {
            provider: "sqlite",
            schema: {
                user: schema.user,
                session: schema.session,
                account: schema.account,
                verification: schema.verification
            }
        }),
        emailAndPassword: {
            enabled: true,
        },
        user: {
            additionalFields: {
                role: { type: "string" },
                status: { type: "string" },
                banned: { type: "boolean" },
                banReason: { type: "string" },
                banExpires: { type: "date" }
            }
        },
        plugins: [
            admin()
        ],
        secret,
        baseURL: url,
    });
    
    authInstance._lastSecret = secret;
    authInstance._lastUrl = url;
    
    return authInstance;
}

/**
 * Obtiene la sesión pero fuerza una lectura de la DB para tener el rol/estado más reciente.
 * Incluye un reintento para evitar fallos transitorios en navegación rápida.
 */
export async function getSessionWithLatestUser(event: any) {
    let session: any = null;
    let retries = 0;
    const maxRetries = 2;

    const fetchSession = async () => {
        const auth = getAuth(event.env, event.request);
        return await auth.api.getSession({
            headers: event.request.headers
        });
    };

    try {
        const allCookies = event.request.headers.get('cookie') || '';
        const hasSessionCookie = allCookies.includes('better-auth.session_token');

        session = await fetchSession();

        if (!session && hasSessionCookie) {
            while (!session && retries < maxRetries) {
                retries++;
                await new Promise(resolve => setTimeout(resolve, 500 * retries));
                session = await fetchSession();
            }
        }

        if (!session) return null;

        // Si llegamos aquí, tenemos sesión. Intentamos hidratar con datos frescos de la DB
        try {
            const db = getDb(event.env);
            const dbUser = await db.select().from(schema.user).where(eq(schema.user.id, session.user.id)).limit(1);
            
            if (dbUser.length > 0) {
                return {
                    ...session,
                    user: { ...session.user, ...dbUser[0] }
                };
            }
        } catch (dbError) {
            console.error("[AUTH] DB User hydration failed, returning basic session:", dbError);
        }

        return session;
    } catch (e) {
        console.error("[AUTH] Critical error in getSessionWithLatestUser:", e);
        return session;
    }
}
