import { component$, useSignal, $, useVisibleTask$ } from '@builder.io/qwik';
import { routeAction$, routeLoader$, Form, z, zod$ } from '@builder.io/qwik-city';
import { getDb } from '../../../../database/db';
import { siteConfig } from '../../../../database/schema';
import { eq } from 'drizzle-orm';
import { uploadImageToCloudinary } from '../../../../lib/cloudinary';

export const useGetHeroSettings = routeLoader$(async (event) => {
    const db = getDb(event.env);
    const result = await db.select().from(siteConfig).where(eq(siteConfig.id, 'main'));
    if (result.length > 0 && result[0].heroConfig) {
      return result[0].heroConfig;
    }
    return {
      title: "Bienvenidos a <br/>Colonia Ensayo",
      subtitle: "Construyendo una comunidad transparente, moderna y conectada. Accedé a servicios, noticias y trámites de forma ágil.",
      imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuAGp_eIQGMThHTflU270DkxWI5ge5WCl9XvdgTluuNapPd_IeOXAwGaYAV39Uo8dkPY0z0vpq9BNBkdOsqI5i50JnoEI6hW5zH1_FR_lY8oyxqS5dnyZUaYhktLs-3MtAm4Iu1L1V0TtFuWmitzoMwmU8nZNkdjskeafz-EgK6_QawIlYLQI1MBDlmxMemU29__IbrupQGduXTk9y_YBsOBxK23MEGqjewye_FFiTBCTRvs0E5p5AD8CKl6CTucXzMvwCSY7mnwLJo",
      buttons: [
        { label: "Conocé más", url: "#", style: "primary", visible: true },
        { label: "Trámites Online", url: "#", style: "outline", visible: true }
      ]
    };
});

export const useSaveHeroSettings = routeAction$(async (data, event) => {
    const db = getDb(event.env);
    const imageFile = data.image as File | undefined;
    let imageUrl = data.existingImageUrl as string;
    
    let buttons = [];
    try {
        if (data.buttons) buttons = JSON.parse(data.buttons as string);
    } catch(e) {}
    
    if (imageFile && imageFile.size > 0 && imageFile.name) {
        try {
            imageUrl = await uploadImageToCloudinary(imageFile, event.env);
        } catch (error: any) {
            return event.fail(400, { error: `Error subiendo imagen: ${error.message}` });
        }
    }
    
    const heroConfigData = {
        title: data.title as string,
        subtitle: data.subtitle as string,
        imageUrl,
        buttons
    };

    const existing = await db.select().from(siteConfig).where(eq(siteConfig.id, 'main'));
    if (existing.length > 0) {
        await db.update(siteConfig).set({
            heroConfig: heroConfigData,
            updatedAt: new Date()
        }).where(eq(siteConfig.id, 'main'));
    } else {
        await db.insert(siteConfig).values({
            id: 'main',
            heroConfig: heroConfigData,
            updatedAt: new Date()
        });
    }
    
    return { success: true, imageUrl };
}, zod$({
   title: z.string().min(1),
   subtitle: z.string(),
   image: z.any().optional(),
   existingImageUrl: z.string().optional(),
   buttons: z.string()
}));

export default component$(() => {
  const settings = useGetHeroSettings();
  const saveAction = useSaveHeroSettings();
  
  const buttonsSignal = useSignal(settings.value.buttons);
  const imagePreview = useSignal<string>(settings.value.imageUrl || '');

  const updateButton = $((index: number, field: string, value: any) => {
    const newButtons = [...buttonsSignal.value];
    newButtons[index] = { ...newButtons[index], [field]: value };
    buttonsSignal.value = newButtons;
  });

  return (
    <div class="max-w-4xl mx-auto font-['Public_Sans']">
      <div class="mb-8">
        <div class="flex items-center gap-2 mb-2">
            <a href="/admin/settings" class="text-gray-500 hover:text-primary transition-colors flex items-center text-sm font-medium">
                <span class="material-symbols-outlined text-sm mr-1">arrow_back</span>
                Volver
            </a>
        </div>
        <h1 class="text-3xl font-bold text-gray-900">Configuración: Hero</h1>
        <p class="text-gray-500 mt-2">Personaliza la gran imagen de bienvenida y sus textos.</p>
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

        <div class="space-y-4 border-b pb-6">
          <h2 class="text-xl font-semibold text-gray-800">Imagen de Fondo</h2>
          <div class="flex flex-col sm:flex-row items-start gap-6">
            <div class="w-full sm:w-64 h-36 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50 relative group">
              {imagePreview.value ? (
                <img src={imagePreview.value} alt="Preview" class="w-full h-full object-cover" />
              ) : (
                <span class="material-symbols-outlined text-4xl text-gray-400">image</span>
              )}
              <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                 <span class="text-white font-medium drop-shadow-md">Cambiar</span>
              </div>
            </div>
            <div class="flex-1 w-full">
              <label class="block text-sm font-medium text-gray-700 mb-2">Subir nueva imagen</label>
              <input 
                type="file" 
                name="image" 
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
              <p class="text-xs text-gray-500 mt-2">Recomendado: Imagen horizontal (ej. 1920x1080px). Se oscurecerá automáticamente para leer mejor el texto.</p>
              <input type="hidden" name="existingImageUrl" value={settings.value.imageUrl || ''} />
            </div>
          </div>
        </div>

        <div class="space-y-6 border-b pb-6">
          <h2 class="text-xl font-semibold text-gray-800">Textos Principales</h2>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Título Principal (Soporta HTML básico como &lt;br/&gt;)</label>
            <input type="text" name="title" value={settings.value.title} required class="w-full px-4 py-2 rounded-lg border border-outline focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-mono text-sm" />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Subtítulo (Párrafo)</label>
            <textarea name="subtitle" rows={3} class="w-full px-4 py-2 rounded-lg border border-outline focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all">{settings.value.subtitle}</textarea>
          </div>
        </div>

        <div class="space-y-4 pt-2">
          <h2 class="text-xl font-semibold text-gray-800 pb-2">Botones de Acción</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            {buttonsSignal.value.map((btn, index) => (
              <div key={index} class={`p-4 rounded-lg border transition-all ${btn.visible ? 'border-gray-200 bg-gray-50' : 'border-dashed border-gray-300 bg-gray-50/50 opacity-60'}`}>
                <div class="flex items-center justify-between mb-4 border-b border-gray-200 pb-2">
                    <span class="font-bold text-gray-700">Botón {index + 1}</span>
                    <button type="button" onClick$={() => updateButton(index, 'visible', !btn.visible)} class="text-gray-500 hover:text-primary" title={btn.visible ? 'Ocultar' : 'Mostrar'}>
                        <span class="material-symbols-outlined">{btn.visible ? 'visibility' : 'visibility_off'}</span>
                    </button>
                </div>
                
                <div class="space-y-3">
                    <div>
                        <label class="block text-xs font-medium text-gray-600 mb-1">Texto del botón</label>
                        <input type="text" value={btn.label} onInput$={(e) => updateButton(index, 'label', (e.target as HTMLInputElement).value)} class="w-full px-3 py-1.5 rounded-md border border-gray-300 text-sm focus:border-primary outline-none" />
                    </div>
                    <div>
                        <label class="block text-xs font-medium text-gray-600 mb-1">Enlace (URL)</label>
                        <input type="text" value={btn.url} onInput$={(e) => updateButton(index, 'url', (e.target as HTMLInputElement).value)} class="w-full px-3 py-1.5 rounded-md border border-gray-300 text-sm focus:border-primary outline-none" />
                    </div>
                </div>
              </div>
            ))}
          </div>
          <input type="hidden" name="buttons" value={JSON.stringify(buttonsSignal.value)} />
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
                Guardar Hero
              </>
            )}
          </button>
        </div>
      </Form>
    </div>
  );
});
