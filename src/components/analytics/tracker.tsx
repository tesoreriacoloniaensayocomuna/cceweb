import { component$, useVisibleTask$ } from "@builder.io/qwik";
import { useLocation } from "@builder.io/qwik-city";
import { trackPageViewServer } from "../../lib/analytics";

interface TrackerProps {
    category?: string;
}

export const PageViewTracker = component$<TrackerProps>((props) => {
    const loc = useLocation();

    // eslint-disable-next-line qwik/no-use-visible-task
    useVisibleTask$(({ track }) => {
        // Trackeamos cuando cambia la URL
        track(() => loc.url.pathname);

        // Determinamos la categoría basada en la ruta si no se provee
        let category = props.category;
        if (!category) {
            const path = loc.url.pathname;
            if (path === '/') category = 'home';
            else if (path.includes('/noticias/')) category = 'news';
            else if (path.includes('/turismo/')) category = 'tourism';
            else if (path.includes('/normativas/')) category = 'regulation';
            else if (path.includes('/proveedores/')) category = 'providers';
            else if (path.includes('/identidad/')) category = 'identity';
            else if (path.includes('/gobierno/')) category = 'government';
            else if (path.includes('/reclamos/')) category = 'complaints';
            else if (path.includes('/servicios/')) category = 'services';
            else category = 'other';
        }

        // Solo trackeamos si NO estamos en una ruta de admin
        if (!loc.url.pathname.startsWith('/admin') && !loc.url.pathname.startsWith('/login')) {
            trackPageViewServer(loc.url.pathname, category);
        }
    });

    return null; // Componente invisible
});
