import { component$, useVisibleTask$ } from '@builder.io/qwik';
import { routeLoader$, routeAction$, zod$, z, Form, useNavigate } from '@builder.io/qwik-city';
import { getDb } from '~/database/db';
import { siteConfig } from '~/database/schema';
import { eq } from 'drizzle-orm';
import { uploadImageToCloudinary } from '~/lib/cloudinary';

export const useGetTourismConfig = routeLoader$(async (event) => {
    const db = getDb(event.env);
    const result = await db.select().from(siteConfig).where(eq(siteConfig.id, 'main')).limit(1);
    
    const defaultConfig = {
        heroImageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuAGp_eIQGMThHTflU270DkxWI5ge5WCl9XvdgTluuNapPd_IeOXAwGaYAV39Uo8dkPY0z0vpq9BNBkdOsqI5i50JnoEI6hW5zH1_FR_lY8oyxqS5dnyZUaYhktLs-3MtAm4Iu1L1V0TtFuWmitzoMwmU8nZNkdjskeafz-EgK6_QawIlYLQI1MBDlmxMemU29__IbrupQGduXTk9y_YBsOBxK23MEGqjewye_FFiTBCTRvs0E5p5AD8CKl6CTucXzMvwCSY7mnwLJo",
        heroTitle: "Descubrí Colonia Ensayo",
        heroSubtitle: "Naturaleza, historia y eventos que hacen de nuestra comunidad un lugar único."
    };

    if (result.length > 0 && result[0].tourismConfig) {
        return {
            ...defaultConfig,
            ...result[0].tourismConfig
        };
    }
    
    return defaultConfig;
});

export const useUpdateTourismConfig = routeAction$(async (data, event) => {
    const db = getDb(event.env);
    
    let heroImageUrl = data.existingHeroImageUrl;
    const heroImageFile = data.heroImage as File;

    if (heroImageFile && heroImageFile.size > 0) {
        heroImageUrl = await uploadImageToCloudinary(heroImageFile, event.env);
    }

    await db.update(siteConfig).set({
        tourismConfig: {
            heroImageUrl,
            heroTitle: data.heroTitle,
            heroSubtitle: data.heroSubtitle
        },
        updatedAt: new Date()
    }).where(eq(siteConfig.id, 'main'));

    return { success: true };
}, zod$({
    heroTitle: z.string().min(3),
    heroSubtitle: z.string().min(5),
    existingHeroImageUrl: z.string(),
    heroImage: z.any().optional()
}));

export default component$(() => {
    const config = useGetTourismConfig();
    const updateAction = useUpdateTourismConfig();
    const nav = useNavigate();

    useVisibleTask$(({ track }) => {
        track(() => updateAction.value);
        if (updateAction.value?.success) {
            nav('/admin/turismo/');
        }
    });

    return (
        <div class="max-w-4xl mx-auto font-['Public_Sans'] pb-20">
            <div class="mb-8">
                <h1 class="text-3xl font-bold text-gray-900">Configuración de Turismo</h1>
                <p class="text-gray-500 mt-2">Personaliza la cabecera de la sección pública de turismo.</p>
            </div>

            <Form action={updateAction} enctype="multipart/form-data" class="space-y-8">
                <div class="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 space-y-6">
                    <div class="space-y-2">
                        <label class="text-sm font-bold text-gray-700">Título de Portada</label>
                        <input type="text" name="heroTitle" value={config.value.heroTitle}
                            class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" />
                    </div>

                    <div class="space-y-2">
                        <label class="text-sm font-bold text-gray-700">Subtítulo de Portada</label>
                        <textarea name="heroSubtitle" rows={3}
                            class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all">{config.value.heroSubtitle}</textarea>
                    </div>

                    <div class="space-y-4">
                        <label class="text-sm font-bold text-gray-700 block">Imagen de Portada</label>
                        <div class="relative aspect-video rounded-3xl overflow-hidden bg-gray-100 border border-gray-200 mb-4 group">
                            <img src={config.value.heroImageUrl} class="w-full h-full object-cover" alt="Previsualización" />
                            <label class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white cursor-pointer">
                                <span class="material-symbols-outlined text-4xl mb-2">add_a_photo</span>
                                <span class="font-bold">Cambiar Imagen</span>
                                <input type="file" name="heroImage" accept="image/*" class="hidden" />
                            </label>
                        </div>
                        <input type="hidden" name="existingHeroImageUrl" value={config.value.heroImageUrl} />
                    </div>
                </div>

                <div class="flex justify-end gap-4">
                    <button type="button" onClick$={() => nav('/admin/turismo/')} class="px-8 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-all">Cancelar</button>
                    <button type="submit" disabled={updateAction.isRunning}
                        class="px-10 py-3 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 disabled:opacity-50 transition-all">
                        {updateAction.isRunning ? 'Guardando...' : 'Guardar Configuración'}
                    </button>
                </div>
            </Form>
        </div>
    );
});
