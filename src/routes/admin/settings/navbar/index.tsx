import { component$, useSignal, $, useVisibleTask$ } from '@builder.io/qwik';
import { routeAction$, routeLoader$, Form, z, zod$ } from '@builder.io/qwik-city';
import { getDb } from '../../../../database/db';
import { siteConfig } from '../../../../database/schema';
import { eq } from 'drizzle-orm';
import { uploadImageToCloudinary } from '../../../../lib/cloudinary';

export const useGetSettings = routeLoader$(async (event) => {
    const db = getDb(event.env);
    const result = await db.select().from(siteConfig).where(eq(siteConfig.id, 'main'));
    
    const defaultLinks = [
        { label: 'Noticias', path: '/noticias/', visible: true },
        { label: 'Gobierno', path: '/gobierno/', visible: true },
        { label: 'Servicios', path: '/servicios/', visible: true },
        { label: 'Trámites', path: '/tramites/', visible: true },
        { label: 'Turismo', path: '/turismo/', visible: true },
        { label: 'Normativas', path: '/normativas/', visible: true },
        { label: 'Reclamos', path: '/reclamos/', visible: true },
        { label: 'Identidad', path: '/identidad/', visible: true },
        { label: 'Proveedores', path: '/proveedores/', visible: true },
    ];

    if (result.length > 0) {
      const savedLinks = result[0].navbarLinks || [];
      // Fusionar: mantener los guardados y agregar los nuevos que no existan
      const finalLinks = [...savedLinks];
      defaultLinks.forEach(def => {
          if (!finalLinks.find(l => l.path === def.path)) {
              finalLinks.push(def);
          }
      });

      return {
        ...result[0],
        portalButtonUrl: result[0].portalButtonUrl || "https://coloniaensayo.gob.ar/portal",
        navbarLinks: finalLinks
      };
    }
    
    return {
        logoUrl: '',
        showPortalButton: true,
        portalButtonUrl: "https://coloniaensayo.gob.ar/portal",
        providerRegistryUrl: '',
        navbarLinks: defaultLinks
    };
});

export const useSaveSettings = routeAction$(async (data, event) => {
    const db = getDb(event.env);
    const logoFile = data.logo as File | undefined;
    let logoUrl = data.existingLogoUrl;
    const showPortalButton = data.showPortalButton === 'on';
    const portalButtonUrl = data.portalButtonUrl;
    
    let navbarLinks = [];
    try {
        if (data.navbarLinks) navbarLinks = JSON.parse(data.navbarLinks);
    } catch(e) {}
    
    if (logoFile && logoFile.size > 0 && logoFile.name) {
        try {
            logoUrl = await uploadImageToCloudinary(logoFile, event.env);
        } catch (error: any) {
            return event.fail(400, { error: `Error subiendo logo: ${error.message}` });
        }
    }

    
    const existing = await db.select().from(siteConfig).where(eq(siteConfig.id, 'main'));
    if (existing.length > 0) {
        await db.update(siteConfig).set({
            logoUrl,
            showPortalButton,
            portalButtonUrl,
            navbarLinks,
            updatedAt: new Date()
        }).where(eq(siteConfig.id, 'main'));
    } else {
        await db.insert(siteConfig).values({
            id: 'main',
            logoUrl,
            showPortalButton,
            portalButtonUrl,
            navbarLinks,
            updatedAt: new Date()
        });
    }
    
    return { success: true, logoUrl };
}, zod$({
   logo: z.any().optional(),
   existingLogoUrl: z.string().optional(),
   showPortalButton: z.string().optional(),
   portalButtonUrl: z.string().url('Debe ser una URL válida'),
   navbarLinks: z.string()
}));

export default component$(() => {
  const settings = useGetSettings();
  const saveAction = useSaveSettings();
  
  const linksSignal = useSignal(settings.value.navbarLinks);
  const imagePreview = useSignal<string>(settings.value.logoUrl || '');

  const moveUp = $((index: number) => {
    if (index === 0) return;
    const newLinks = [...linksSignal.value];
    const temp = newLinks[index - 1];
    newLinks[index - 1] = newLinks[index];
    newLinks[index] = temp;
    linksSignal.value = newLinks;
  });

  const moveDown = $((index: number) => {
    if (index === linksSignal.value.length - 1) return;
    const newLinks = [...linksSignal.value];
    const temp = newLinks[index + 1];
    newLinks[index + 1] = newLinks[index];
    newLinks[index] = temp;
    linksSignal.value = newLinks;
  });

  const toggleVisibility = $((index: number) => {
    const newLinks = [...linksSignal.value];
    newLinks[index] = { ...newLinks[index], visible: newLinks[index].visible === false ? true : false };
    linksSignal.value = newLinks;
  });

  return (
    <div class="max-w-4xl mx-auto font-['Public_Sans']">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Configuración del Sitio</h1>
        <p class="text-gray-500 mt-2">Personaliza la apariencia y estructura pública del portal.</p>
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

        <div class="space-y-4">
          <h2 class="text-xl font-semibold text-gray-800 border-b pb-2">Logo de la Comuna</h2>
          <div class="flex items-start gap-6">
            <div class="w-32 h-32 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50">
              {imagePreview.value ? (
                <img src={imagePreview.value} alt="Preview" class="w-full h-full object-contain p-2" />
              ) : (
                <span class="material-symbols-outlined text-4xl text-gray-400">image</span>
              )}
            </div>
            <div class="flex-1">
              <label class="block text-sm font-medium text-gray-700 mb-2">Subir nuevo logo</label>
              <input 
                type="file" 
                name="logo" 
                accept="image/*"
                class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 transition-all cursor-pointer"
                onChange$={(e) => {
                  const file = (e.target as HTMLInputElement).files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (e) => imagePreview.value = e.target?.result as string;
                    reader.readAsDataURL(file);
                  }
                }}
              />
              <p class="text-xs text-gray-500 mt-2">Recomendado: Archivo PNG transparente. Tamaño máximo 2MB.</p>
              <input type="hidden" name="existingLogoUrl" value={settings.value.logoUrl || ''} />
            </div>
          </div>
        </div>

        <div class="space-y-4 pt-4">
          <h2 class="text-xl font-semibold text-gray-800 border-b pb-2">Menú de Navegación (Navbar)</h2>
          <p class="text-sm text-gray-500 mb-4">Ordena las secciones como deseas que aparezcan en la barra superior pública.</p>
          
          <div class="space-y-2 bg-gray-50 p-4 rounded-lg border border-gray-200">
            {linksSignal.value.map((link: any, index: number) => (
              <div key={link.path} class={`flex items-center justify-between bg-white p-3 rounded-md shadow-sm border border-gray-100 transition-opacity ${link.visible === false ? 'opacity-50' : ''}`}>
                <div class="flex items-center gap-3">
                  <span class="material-symbols-outlined text-gray-400 cursor-grab">drag_indicator</span>
                  <span class={`font-medium ${link.visible === false ? 'text-gray-400 line-through' : 'text-gray-700'}`}>{link.label}</span>
                  <span class="text-xs text-gray-400 font-mono hidden sm:inline">{link.path}</span>
                </div>
                <div class="flex items-center gap-2">
                  <button type="button" onClick$={() => toggleVisibility(index)} class={`p-1 transition-colors ${link.visible === false ? 'text-gray-400 hover:text-green-600' : 'text-primary hover:text-gray-500'}`} title={link.visible === false ? 'Mostrar sección' : 'Ocultar sección'}>
                    <span class="material-symbols-outlined">{link.visible === false ? 'visibility_off' : 'visibility'}</span>
                  </button>
                  <div class="w-px h-6 bg-gray-200 mx-1"></div>
                  <button type="button" onClick$={() => moveUp(index)} disabled={index === 0} class="p-1 text-gray-500 hover:text-primary disabled:opacity-30 disabled:hover:text-gray-500 transition-colors">
                    <span class="material-symbols-outlined">arrow_upward</span>
                  </button>
                  <button type="button" onClick$={() => moveDown(index)} disabled={index === linksSignal.value.length - 1} class="p-1 text-gray-500 hover:text-primary disabled:opacity-30 disabled:hover:text-gray-500 transition-colors">
                    <span class="material-symbols-outlined">arrow_downward</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
          <input type="hidden" name="navbarLinks" value={JSON.stringify(linksSignal.value)} />
        </div>


        <div class="space-y-4 pt-4 border-t border-gray-100">
          <h2 class="text-xl font-semibold text-gray-800 pb-2">Botón Principal</h2>
          <div class="space-y-4 bg-gray-50 p-6 rounded-lg border border-gray-200">
            <label class="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" name="showPortalButton" class="w-5 h-5 rounded text-primary focus:ring-primary" checked={settings.value.showPortalButton} />
              <div>
                <span class="block font-medium text-gray-800">Mostrar botón "Portal Ciudadano"</span>
                <span class="block text-sm text-gray-500">Habilita o deshabilita el botón de acción principal en la barra de navegación superior.</span>
              </div>
            </label>
            
            <div class="pt-4 space-y-2 border-t border-gray-200">
              <label class="text-sm font-bold text-gray-700">Enlace del Portal (URL)</label>
              <input 
                type="url" 
                name="portalButtonUrl" 
                value={settings.value.portalButtonUrl}
                required
                placeholder="https://coloniaensayo.gob.ar/portal"
                class="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all bg-white" 
              />
              <p class="text-xs text-gray-500 italic">Este es el enlace al que llevará el botón de "Portal Ciudadano".</p>
            </div>
          </div>
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
                Guardar Configuración
              </>
            )}
          </button>
        </div>
      </Form>
    </div>
  );
});
