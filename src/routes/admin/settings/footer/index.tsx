import { component$, useSignal, $ } from '@builder.io/qwik';
import { routeAction$, routeLoader$, Form, z, zod$ } from '@builder.io/qwik-city';
import { getDb } from '../../../../database/db';
import { siteConfig } from '../../../../database/schema';
import { eq } from 'drizzle-orm';

export const useGetFooterSettings = routeLoader$(async (event) => {
    const db = getDb(event.env);
    const result = await db.select().from(siteConfig).where(eq(siteConfig.id, 'main'));
    if (result.length > 0 && result[0].footerConfig) {
      return result[0].footerConfig;
    }
    return {
      description: "© 2024 Comuna de Colonia Ensayo. Hacia una gestión transparente y moderna.",
      socialLinks: [
        { platform: "Facebook", url: "#", visible: false },
        { platform: "Instagram", url: "#", visible: false },
      ],
      quickLinks: [
        { label: "Gobierno", url: "/gobierno/", visible: true },
        { label: "Noticias", url: "/noticias/", visible: true },
        { label: "Servicios", url: "/servicios/", visible: true },
        { label: "Contacto", url: "/contacto/", visible: true }
      ]
    };
});

export const useSaveFooterSettings = routeAction$(async (data, event) => {
    const db = getDb(event.env);
    
    let socialLinks = [];
    let quickLinks = [];
    try {
        if (data.socialLinks) socialLinks = JSON.parse(data.socialLinks as string);
        if (data.quickLinks) quickLinks = JSON.parse(data.quickLinks as string);
    } catch(e) {}
    
    const footerConfigData = {
        description: data.description as string,
        socialLinks,
        quickLinks
    };

    const existing = await db.select().from(siteConfig).where(eq(siteConfig.id, 'main'));
    if (existing.length > 0) {
        await db.update(siteConfig).set({
            footerConfig: footerConfigData,
            updatedAt: new Date()
        }).where(eq(siteConfig.id, 'main'));
    } else {
        await db.insert(siteConfig).values({
            id: 'main',
            footerConfig: footerConfigData,
            updatedAt: new Date()
        });
    }
    
    return { success: true };
}, zod$({
   description: z.string().min(1),
   socialLinks: z.string(),
   quickLinks: z.string()
}));

export default component$(() => {
  const settings = useGetFooterSettings();
  const saveAction = useSaveFooterSettings();
  
  const socialSignal = useSignal(settings.value.socialLinks || []);
  const quickSignal = useSignal(settings.value.quickLinks || []);

  const updateSocial = $((index: number, field: string, value: any) => {
    const newLinks = [...socialSignal.value];
    newLinks[index] = { ...newLinks[index], [field]: value };
    socialSignal.value = newLinks;
  });

  const updateQuick = $((index: number, field: string, value: any) => {
    const newLinks = [...quickSignal.value];
    newLinks[index] = { ...newLinks[index], [field]: value };
    quickSignal.value = newLinks;
  });

  const addSocial = $(() => {
    socialSignal.value = [...socialSignal.value, { platform: "Nueva Red", url: "#", visible: true }];
  });

  const addQuick = $(() => {
    quickSignal.value = [...quickSignal.value, { label: "Nuevo Enlace", url: "#", visible: true }];
  });

  const removeSocial = $((index: number) => {
    socialSignal.value = socialSignal.value.filter((_, i) => i !== index);
  });

  const removeQuick = $((index: number) => {
    quickSignal.value = quickSignal.value.filter((_, i) => i !== index);
  });

  return (
    <div class="max-w-4xl mx-auto font-['Public_Sans'] pb-12">
      <div class="mb-8">
        <div class="flex items-center gap-2 mb-2">
            <a href="/admin/settings" class="text-gray-500 hover:text-primary transition-colors flex items-center text-sm font-medium">
                <span class="material-symbols-outlined text-sm mr-1">arrow_back</span>
                Volver
            </a>
        </div>
        <h1 class="text-3xl font-bold text-gray-900">Configuración: Pie de Página</h1>
        <p class="text-gray-500 mt-2">Personaliza la descripción institucional y los enlaces rápidos.</p>
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
            {(saveAction.value as any).error || "Ocurrió un error al guardar."}
          </div>
        )}

        <div class="border-b pb-6">
            <label class="block text-sm font-medium text-gray-700 mb-1">Descripción de la Comuna / Texto Legal Inferior</label>
            <textarea name="description" rows={3} value={settings.value.description} required class="w-full px-4 py-2 rounded-lg border border-outline focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"></textarea>
        </div>

        <div class="space-y-4 border-b pb-6">
          <div class="flex items-center justify-between">
              <h2 class="text-xl font-semibold text-gray-800">Redes Sociales</h2>
              <button type="button" onClick$={addSocial} class="text-sm bg-primary/10 text-primary px-3 py-1 rounded-md hover:bg-primary/20 transition-colors flex items-center gap-1">
                  <span class="material-symbols-outlined text-sm">add</span> Añadir Red
              </button>
          </div>
          
          {socialSignal.value.length === 0 && <p class="text-sm text-gray-500 italic">No hay redes sociales configuradas.</p>}
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            {socialSignal.value.map((link, index) => (
              <div key={index} class={`p-4 rounded-lg border transition-all ${link.visible ? 'border-gray-200 bg-gray-50' : 'border-dashed border-gray-300 bg-gray-50/50 opacity-60'}`}>
                <div class="flex items-center justify-between mb-3">
                    <span class="font-medium text-gray-700 text-sm">Red Social {index + 1}</span>
                    <div class="flex items-center gap-1">
                        <button type="button" onClick$={() => updateSocial(index, 'visible', !link.visible)} class="p-1 text-gray-500 hover:text-primary transition-colors" title={link.visible ? 'Ocultar' : 'Mostrar'}>
                            <span class="material-symbols-outlined text-sm">{link.visible ? 'visibility' : 'visibility_off'}</span>
                        </button>
                        <button type="button" onClick$={() => removeSocial(index)} class="p-1 text-red-400 hover:text-red-600 transition-colors" title="Eliminar">
                            <span class="material-symbols-outlined text-sm">delete</span>
                        </button>
                    </div>
                </div>
                <div class="space-y-2">
                    <input type="text" value={link.platform} placeholder="Plataforma (ej. Instagram)" onInput$={(e) => updateSocial(index, 'platform', (e.target as HTMLInputElement).value)} class="w-full px-3 py-1.5 rounded-md border border-gray-300 text-sm focus:border-primary outline-none" />
                    <input type="text" value={link.url} placeholder="Enlace URL completo" onInput$={(e) => updateSocial(index, 'url', (e.target as HTMLInputElement).value)} class="w-full px-3 py-1.5 rounded-md border border-gray-300 text-sm focus:border-primary outline-none" />
                </div>
              </div>
            ))}
          </div>
          <input type="hidden" name="socialLinks" value={JSON.stringify(socialSignal.value)} />
        </div>

        <div class="space-y-4">
          <div class="flex items-center justify-between">
              <h2 class="text-xl font-semibold text-gray-800">Enlaces Rápidos</h2>
              <button type="button" onClick$={addQuick} class="text-sm bg-primary/10 text-primary px-3 py-1 rounded-md hover:bg-primary/20 transition-colors flex items-center gap-1">
                  <span class="material-symbols-outlined text-sm">add</span> Añadir Enlace
              </button>
          </div>
          
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {quickSignal.value.map((link, index) => (
              <div key={index} class={`p-3 rounded-lg border transition-all ${link.visible ? 'border-gray-200 bg-white' : 'border-dashed border-gray-300 bg-gray-50/50 opacity-60'}`}>
                <div class="flex items-center justify-between mb-2">
                    <div class="flex items-center gap-1">
                        <button type="button" onClick$={() => updateQuick(index, 'visible', !link.visible)} class="p-1 text-gray-500 hover:text-primary transition-colors" title={link.visible ? 'Ocultar' : 'Mostrar'}>
                            <span class="material-symbols-outlined text-sm">{link.visible ? 'visibility' : 'visibility_off'}</span>
                        </button>
                        <button type="button" onClick$={() => removeQuick(index)} class="p-1 text-red-400 hover:text-red-600 transition-colors" title="Eliminar">
                            <span class="material-symbols-outlined text-sm">delete</span>
                        </button>
                    </div>
                </div>
                <div class="space-y-2">
                    <input type="text" value={link.label} placeholder="Nombre" onInput$={(e) => updateQuick(index, 'label', (e.target as HTMLInputElement).value)} class="w-full px-2 py-1 rounded border border-gray-300 text-xs focus:border-primary outline-none" />
                    <input type="text" value={link.url} placeholder="Ruta o URL" onInput$={(e) => updateQuick(index, 'url', (e.target as HTMLInputElement).value)} class="w-full px-2 py-1 rounded border border-gray-300 text-xs focus:border-primary outline-none" />
                </div>
              </div>
            ))}
          </div>
          <input type="hidden" name="quickLinks" value={JSON.stringify(quickSignal.value)} />
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
                Guardar Pie de Página
              </>
            )}
          </button>
        </div>
      </Form>
    </div>
  );
});
