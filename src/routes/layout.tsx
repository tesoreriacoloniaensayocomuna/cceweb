import { component$, Slot } from '@builder.io/qwik';
import { routeLoader$ } from '@builder.io/qwik-city';
import { getDb } from '../database/db';
import { siteConfig } from '../database/schema';
import { eq } from 'drizzle-orm';

export const useSiteConfig = routeLoader$(async (event) => {
  const db = getDb(event.env);
  const result = await db.select().from(siteConfig).where(eq(siteConfig.id, 'main'));
  
  if (result.length > 0) {
    // Return saved config but ensure we have defaults for missing data
    return {
      logoUrl: result[0].logoUrl,
      showPortalButton: result[0].showPortalButton ?? true,
      portalButtonUrl: result[0].portalButtonUrl || "https://coloniaensayo.gob.ar/portal",
      navbarLinks: result[0].navbarLinks || [
        { label: 'Noticias', path: '/noticias/', visible: true },
        { label: 'Gobierno', path: '/gobierno/', visible: true },
        { label: 'Servicios', path: '/servicios/', visible: true },
        { label: 'Trámites', path: '/tramites/', visible: true },
        { label: 'Turismo', path: '/turismo/', visible: true },
        { label: 'Normativas', path: '/normativas/', visible: true },
        { label: 'Reclamos', path: '/reclamos/', visible: true },
        { label: 'Identidad', path: '/identidad/', visible: true },
        { label: 'Proveedores', path: '/proveedores/', visible: true },
      ],
      heroConfig: result[0].heroConfig || {
        title: "Bienvenidos a <br/>Colonia Ensayo",
        subtitle: "Construyendo una comunidad transparente, moderna y conectada. Accedé a servicios, noticias y trámites de forma ágil.",
        imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuAGp_eIQGMThHTflU270DkxWI5ge5WCl9XvdgTluuNapPd_IeOXAwGaYAV39Uo8dkPY0z0vpq9BNBkdOsqI5i50JnoEI6hW5zH1_FR_lY8oyxqS5dnyZUaYhktLs-3MtAm4Iu1L1V0TtFuWmitzoMwmU8nZNkdjskeafz-EgK6_QawIlYLQI1MBDlmxMemU29__IbrupQGduXTk9y_YBsOBxK23MEGqjewye_FFiTBCTRvs0E5p5AD8CKl6CTucXzMvwCSY7mnwLJo",
        buttons: [
          { label: "Conocé más", url: "#", style: "primary", visible: true },
          { label: "Trámites Online", url: "#", style: "outline", visible: true }
        ]
      },
      footerConfig: result[0].footerConfig || {
        description: "© 2024 Comuna de Colonia Ensayo. Hacia una gestión transparente y moderna.",
        socialLinks: [],
        quickLinks: [
          { label: "Gobierno", url: "/gobierno/", visible: true },
          { label: "Noticias", url: "/noticias/", visible: true },
          { label: "Servicios", url: "/servicios/", visible: true },
          { label: "Contacto", url: "/contacto/", visible: true }
        ]
      },
      contactConfig: result[0].contactConfig || {
        address: "Av. Principal S/N, Colonia Ensayo, Entre Ríos",
        phone: "+54 9 343 000-0000",
        email: "contacto@coloniaensayo.gob.ar",
        schedule: "Lunes a Viernes de 7:00 a 13:00 hs"
      }
    };
  }
  
  // Return default if not configured yet
  return {
    logoUrl: null,
    showPortalButton: true,
    portalButtonUrl: "https://coloniaensayo.gob.ar/portal",
    navbarLinks: [
      { label: 'Noticias', path: '/noticias/', visible: true },
      { label: 'Gobierno', path: '/gobierno/', visible: true },
      { label: 'Servicios', path: '/servicios/', visible: true },
      { label: 'Trámites', path: '/tramites/', visible: true },
      { label: 'Turismo', path: '/turismo/', visible: true },
      { label: 'Normativas', path: '/normativas/', visible: true },
      { label: 'Reclamos', path: '/reclamos/', visible: true },
      { label: 'Identidad', path: '/identidad/', visible: true },
      { label: 'Proveedores', path: '/proveedores/', visible: true },
    ],
    heroConfig: {
      title: "Bienvenidos a <br/>Colonia Ensayo",
      subtitle: "Construyendo una comunidad transparente, moderna y conectada. Accedé a servicios, noticias y trámites de forma ágil.",
      imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuAGp_eIQGMThHTflU270DkxWI5ge5WCl9XvdgTluuNapPd_IeOXAwGaYAV39Uo8dkPY0z0vpq9BNBkdOsqI5i50JnoEI6hW5zH1_FR_lY8oyxqS5dnyZUaYhktLs-3MtAm4Iu1L1V0TtFuWmitzoMwmU8nZNkdjskeafz-EgK6_QawIlYLQI1MBDlmxMemU29__IbrupQGduXTk9y_YBsOBxK23MEGqjewye_FFiTBCTRvs0E5p5AD8CKl6CTucXzMvwCSY7mnwLJo",
      buttons: [
        { label: "Conocé más", url: "#", style: "primary", visible: true },
        { label: "Trámites Online", url: "#", style: "outline", visible: true }
      ]
    },
    footerConfig: {
      description: "© 2024 Comuna de Colonia Ensayo. Hacia una gestión transparente y moderna.",
      socialLinks: [],
      quickLinks: [
        { label: "Gobierno", url: "/gobierno/", visible: true },
        { label: "Noticias", url: "/noticias/", visible: true },
        { label: "Servicios", url: "/servicios/", visible: true },
        { label: "Contacto", url: "/contacto/", visible: true }
      ]
    },
    contactConfig: {
      address: "Av. Principal S/N, Colonia Ensayo, Entre Ríos",
      phone: "+54 9 343 000-0000",
      email: "contacto@coloniaensayo.gob.ar",
      schedule: "Lunes a Viernes de 7:00 a 13:00 hs"
    }
  };
});

import { PageViewTracker } from '../components/analytics/tracker';

export default component$(() => {
  return (
    <>
      <PageViewTracker />
      <Slot />
    </>
  );
});
