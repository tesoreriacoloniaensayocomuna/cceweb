import { component$, useSignal, $, useVisibleTask$ } from '@builder.io/qwik';
import { routeAction$, useNavigate, zod$, z, Form, routeLoader$ } from '@builder.io/qwik-city';
import { getDb } from '~/database/db';
import { tourismItems } from '~/database/schema';
import { eq } from 'drizzle-orm';
import { uploadImageToCloudinary } from '~/lib/cloudinary';

export const useGetTourismItem = routeLoader$(async (event) => {
    const db = getDb(event.env);
    const result = await db.select().from(tourismItems).where(eq(tourismItems.id, event.params.id)).limit(1);
    if (result.length === 0) throw event.error(404, 'No encontrado');
    return result[0];
});

export const useUpdateTourismItem = routeAction$(async (data, event) => {
    const db = getDb(event.env);
    
    let imageUrls: string[] = JSON.parse(data.existingImages || '[]');
    const newImages = (Array.isArray(data.newImages) ? data.newImages : [data.newImages]).filter(Boolean) as File[];

    for (const image of newImages) {
        if (image && image.size > 0 && image.name) {
            try {
                const url = await uploadImageToCloudinary(image, event.env);
                imageUrls.push(url);
            } catch (e) {
                console.error('Error subiendo imagen:', e);
            }
        }
    }

    // Extraer URL del mapa si el usuario pegó el iframe completo
    let mapUrl = data.mapUrl || '';
    if (mapUrl.includes('<iframe')) {
        const match = mapUrl.match(/src="([^"]+)"/);
        if (match) mapUrl = match[1];
    }

    await db.update(tourismItems).set({
        title: data.title,
        content: data.content,
        category: data.category as 'event' | 'place',
        eventDate: data.eventDate ? new Date(data.eventDate) : null,
        locationName: data.locationName,
        mapUrl: mapUrl,
        entryFee: data.entryFee,
        openingHours: data.openingHours,
        highlights: data.highlights,
        imageUrls: imageUrls,
        videoUrl: data.videoUrl,
        published: data.published === 'on',
        updatedAt: new Date(),
    }).where(eq(tourismItems.id, event.params.id));

    return { success: true };
}, zod$({
    title: z.string().min(3, 'El título es muy corto'),
    content: z.string().min(10, 'La descripción es muy corta'),
    category: z.string(),
    eventDate: z.string().nullish(),
    locationName: z.string().nullish(),
    mapUrl: z.string().nullish(),
    entryFee: z.string().nullish(),
    openingHours: z.string().nullish(),
    highlights: z.string().nullish(),
    videoUrl: z.string().nullish(),
    published: z.string().nullish(),
    existingImages: z.string().nullish(),
    newImages: z.any().nullish()
}));

export default component$(() => {
    const item = useGetTourismItem();
    const updateAction = useUpdateTourismItem();
    const nav = useNavigate();
    const category = useSignal(item.value.category);
    const currentImages = useSignal<string[]>((item.value.imageUrls as string[]) || []);

    const removeImage = $((index: number) => {
        currentImages.value = currentImages.value.filter((_, i) => i !== index);
    });

    useVisibleTask$(({ track }) => {
        track(() => updateAction.value);
        if (updateAction.value?.success) {
            nav('/admin/turismo/');
        }
    });

    return (
        <div class="max-w-4xl mx-auto font-['Public_Sans'] pb-20">
            <div class="mb-8">
                <h1 class="text-3xl font-bold text-gray-900">Editar Artículo Turístico</h1>
                <p class="text-gray-500 mt-2 text-sm italic">{item.value.title}</p>
            </div>

            <Form action={updateAction} enctype="multipart/form-data" class="space-y-8">
                <div class="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 space-y-6">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div class="space-y-2">
                            <label class="text-sm font-bold text-gray-700">Título</label>
                            <input type="text" name="title" required value={item.value.title}
                                class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" />
                        </div>
                        <div class="space-y-2">
                            <label class="text-sm font-bold text-gray-700">Categoría</label>
                            <select name="category" bind:value={category}
                                class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all bg-white">
                                <option value="place">Punto de Interés / Lugar</option>
                                <option value="event">Evento / Fiesta</option>
                            </select>
                        </div>
                    </div>

                    <div class="space-y-2">
                        <label class="text-sm font-bold text-gray-700">Descripción / Contenido</label>
                        <textarea name="content" required rows={8} value={item.value.content}
                            class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none"></textarea>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div class="space-y-2">
                            <label class="text-sm font-bold text-gray-700">Ubicación (Nombre del lugar)</label>
                            <input type="text" name="locationName" value={item.value.locationName || ''}
                                class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" />
                        </div>
                        <div class="space-y-2">
                            <label class="text-sm font-bold text-gray-700">Enlace Mapa (Google Maps Embed URL)</label>
                            <input type="text" name="mapUrl" value={item.value.mapUrl || ''}
                                class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" />
                        </div>
                    </div>

                    {category.value === 'event' ? (
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-amber-50 rounded-2xl border border-amber-100">
                            <div class="space-y-2">
                                <label class="text-sm font-bold text-amber-900">Fecha del Evento</label>
                                <input type="datetime-local" name="eventDate" 
                                    value={item.value.eventDate ? new Date(item.value.eventDate).toISOString().slice(0, 16) : ''}
                                    class="w-full px-4 py-2.5 rounded-xl border border-amber-200 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all" />
                            </div>
                            <div class="space-y-2">
                                <label class="text-sm font-bold text-amber-900">Entrada</label>
                                <input type="text" name="entryFee" value={item.value.entryFee || ''}
                                    class="w-full px-4 py-2.5 rounded-xl border border-amber-200 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all" />
                            </div>
                            <div class="col-span-full space-y-2">
                                <label class="text-sm font-bold text-amber-900">Artistas / Destacados</label>
                                <textarea name="highlights" rows={3} value={item.value.highlights || ''}
                                    class="w-full px-4 py-2.5 rounded-xl border border-amber-200 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all"></textarea>
                            </div>
                        </div>
                    ) : (
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-blue-50 rounded-2xl border border-blue-100">
                            <div class="space-y-2">
                                <label class="text-sm font-bold text-blue-900">Días y Horarios</label>
                                <input type="text" name="openingHours" value={item.value.openingHours || ''}
                                    class="w-full px-4 py-2.5 rounded-xl border border-blue-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" />
                            </div>
                            <div class="space-y-2">
                                <label class="text-sm font-bold text-blue-900">Servicios / Atractivos</label>
                                <input type="text" name="highlights" value={item.value.highlights || ''}
                                    class="w-full px-4 py-2.5 rounded-xl border border-blue-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" />
                            </div>
                        </div>
                    )}

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div class="space-y-2">
                            <label class="text-sm font-bold text-gray-700">Video de Propaganda (YouTube URL)</label>
                            <input type="text" name="videoUrl" value={item.value.videoUrl || ''}
                                class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" />
                        </div>
                        <div class="flex items-center h-full pt-6">
                            <label class="flex items-center gap-3 cursor-pointer group">
                                <div class="relative">
                                    <input type="checkbox" name="published" class="sr-only peer" checked={item.value.published} />
                                    <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                </div>
                                <span class="text-sm font-bold text-gray-700 group-hover:text-primary transition-colors">Publicado</span>
                            </label>
                        </div>
                    </div>
                </div>

                <div class="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 space-y-6">
                    <h2 class="text-xl font-bold text-gray-900">Galería de Imágenes</h2>
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {currentImages.value.map((src, i) => (
                            <div key={i} class="aspect-square rounded-xl overflow-hidden bg-gray-100 border border-gray-200 relative group">
                                <img src={src} class="w-full h-full object-cover" />
                                <button type="button" onClick$={() => removeImage(i)} class="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span class="material-symbols-outlined text-sm">close</span>
                                </button>
                            </div>
                        ))}
                        <label class="aspect-square rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-gray-50 hover:border-primary transition-all group">
                            <span class="material-symbols-outlined text-3xl text-gray-300 group-hover:text-primary">add_photo_alternate</span>
                            <input type="file" name="newImages" multiple accept="image/*" class="hidden" />
                        </label>
                    </div>
                    <input type="hidden" name="existingImages" value={JSON.stringify(currentImages.value)} />
                </div>

                <div class="flex justify-end gap-4">
                    <button type="button" onClick$={() => nav('/admin/turismo/')} class="px-8 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-all">Cancelar</button>
                    <button type="submit" disabled={updateAction.isRunning}
                        class="px-10 py-3 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 disabled:opacity-50 transition-all">
                        {updateAction.isRunning ? 'Guardando...' : 'Actualizar Artículo'}
                    </button>
                </div>
            </Form>
        </div>
    );
});
