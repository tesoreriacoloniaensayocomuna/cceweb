import { component$ } from '@builder.io/qwik';
import { routeAction$, routeLoader$, Form, z, zod$ } from '@builder.io/qwik-city';
import { getDb } from '../../../../database/db';
import { siteConfig } from '../../../../database/schema';
import { eq } from 'drizzle-orm';

export const useGetContactSettings = routeLoader$(async (event) => {
    const db = getDb(event.env);
    const result = await db.select().from(siteConfig).where(eq(siteConfig.id, 'main'));
    if (result.length > 0 && result[0].contactConfig) {
      return result[0].contactConfig;
    }
    return {
      address: "Av. Principal S/N, Colonia Ensayo, Entre Ríos",
      phone: "+54 9 343 000-0000",
      email: "contacto@coloniaensayo.gob.ar",
      schedule: "Lunes a Viernes de 7:00 a 13:00 hs",
      mapUrl: ""
    };
});

export const useSaveContactSettings = routeAction$(async (data, event) => {
    const db = getDb(event.env);
    
    const contactConfigData = {
        address: data.address as string,
        phone: data.phone as string,
        email: data.email as string,
        schedule: data.schedule as string,
        mapUrl: data.mapUrl as string
    };

    const existing = await db.select().from(siteConfig).where(eq(siteConfig.id, 'main'));
    if (existing.length > 0) {
        await db.update(siteConfig).set({
            contactConfig: contactConfigData,
            updatedAt: new Date()
        }).where(eq(siteConfig.id, 'main'));
    } else {
        await db.insert(siteConfig).values({
            id: 'main',
            contactConfig: contactConfigData,
            updatedAt: new Date()
        });
    }
    
    return { success: true };
}, zod$({
   address: z.string().min(1),
   phone: z.string().min(1),
   email: z.string().email(),
   schedule: z.string().min(1),
   mapUrl: z.string().optional()
}));

export default component$(() => {
  const settings = useGetContactSettings();
  const saveAction = useSaveContactSettings();

  return (
    <div class="max-w-4xl mx-auto font-['Public_Sans']">
      <div class="mb-8">
        <div class="flex items-center gap-2 mb-2">
            <a href="/admin/settings" class="text-gray-500 hover:text-primary transition-colors flex items-center text-sm font-medium">
                <span class="material-symbols-outlined text-sm mr-1">arrow_back</span>
                Volver
            </a>
        </div>
        <h1 class="text-3xl font-bold text-gray-900">Configuración: Contacto</h1>
        <p class="text-gray-500 mt-2">Actualiza la información de contacto pública y los horarios de atención.</p>
      </div>

      <Form action={saveAction} class="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-8">
        
        {saveAction.value?.success && (
          <div class="bg-green-50 text-green-700 p-4 rounded-lg flex items-center gap-2">
            <span class="material-symbols-outlined">check_circle</span>
            ¡Configuración guardada exitosamente!
          </div>
        )}
        {saveAction.value?.failed && (
          <div class="bg-red-50 text-red-700 p-4 rounded-lg flex items-center gap-2">
            <span class="material-symbols-outlined">error</span>
            {(saveAction.value as any).error || "Verifica que todos los campos sean correctos (ej. el correo electrónico)."}
          </div>
        )}

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Dirección Física</label>
            <input type="text" name="address" value={settings.value.address} required class="w-full px-4 py-2 rounded-lg border border-outline focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
            <input type="text" name="phone" value={settings.value.phone} required class="w-full px-4 py-2 rounded-lg border border-outline focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
            <input type="email" name="email" value={settings.value.email} required class="w-full px-4 py-2 rounded-lg border border-outline focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Horarios de Atención</label>
            <input type="text" name="schedule" value={settings.value.schedule} required class="w-full px-4 py-2 rounded-lg border border-outline focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
          </div>
        </div>

        <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Enlace de Google Maps (URL completa o código de inserción)</label>
            <input type="text" name="mapUrl" value={settings.value.mapUrl} placeholder="https://maps.google.com/..." class="w-full px-4 py-2 rounded-lg border border-outline focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm" />
            <p class="text-[11px] text-gray-400 mt-2 leading-relaxed">
                <strong>Tip:</strong> Puedes pegar el enlace de "Compartir", o mejor aún, ve a Google Maps {'>'} Compartir {'>'} <strong>Incorporar un mapa</strong> y pega aquí todo el código (iframe). El sistema extraerá automáticamente el enlace necesario.
            </p>
        </div>


        <div class="pt-6 border-t flex justify-end">
          <button 
            type="submit" 
            disabled={saveAction.isRunning}
            class="bg-primary text-white px-8 py-3 rounded-lg font-bold hover:bg-primary/90 transition-all flex items-center gap-2 disabled:opacity-70"
          >
            {saveAction.isRunning ? (
              <>
                <span class="material-symbols-outlined animate-spin">refresh</span>
                Guardando...
              </>
            ) : (
              <>
                <span class="material-symbols-outlined">save</span>
                Guardar Contacto
              </>
            )}
          </button>
        </div>
      </Form>
    </div>
  );
});
