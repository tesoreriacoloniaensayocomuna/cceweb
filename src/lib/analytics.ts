import { getDb } from "../database/db";
import { pageViews } from "../database/schema";
import { v4 as uuidv4 } from 'uuid';
import { server$ } from "@builder.io/qwik-city";

/**
 * Función que se ejecuta en el servidor pero puede ser llamada desde el cliente.
 * Se usará en un useVisibleTask$ para asegurar que solo contamos visitas reales.
 */
export const trackPageViewServer = server$(async function(path: string, category: string) {
    try {
        // 1. Evitar trackeo si el usuario está logueado como admin
        // Nota: En server$, accedemos a las cookies a través de 'this.cookie'
        const sessionToken = this.cookie.get('better-auth.session_token');
        if (sessionToken) return;

        // 2. Cooldown de 30 minutos por sección para este usuario
        const cookieName = `pv_tracked_${category}`;
        if (this.cookie.get(cookieName)) return;

        const db = getDb(this.env);
        await db.insert(pageViews).values({
            id: uuidv4(),
            path,
            category,
            timestamp: new Date()
        });

        // Marcar como visitado por 30 minutos
        this.cookie.set(cookieName, 'true', { 
            path: '/', 
            maxAge: 30 * 60,
            httpOnly: true,
            sameSite: 'lax'
        });

        return { success: true };
    } catch (error) {
        console.error('Error tracking page view:', error);
        return { error: 'Failed to track' };
    }
});

// Mantengo la función original por compatibilidad o uso interno, pero la marco como depreciada para rutas públicas
export async function trackPageView(path: string, category: string, env: any, cookie: any) {
    // ...
}
