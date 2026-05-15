import { component$, useSignal, $ } from '@builder.io/qwik';
import { routeLoader$ } from '@builder.io/qwik-city';
import { getDb } from '../../../../database/db';
import { news } from '../../../../database/schema';
import { eq } from 'drizzle-orm';

export const useGetNewsItem = routeLoader$(async (event) => {
    const db = getDb(event.env);
    const result = await db.select().from(news).where(eq(news.id, event.params.id));
    if (result.length === 0) throw event.error(404, 'Noticia no encontrada');
    const item = result[0];
    return { ...item, additionalImages: item.additionalImages ?? [] };
});

export default component$(() => {
    const newsItem = useGetNewsItem();

    const titleSignal    = useSignal(newsItem.value.title);
    const slugSignal     = useSignal(newsItem.value.slug);
    const contentSignal  = useSignal(newsItem.value.content);
    const categorySignal = useSignal(newsItem.value.category);
    const statusSignal   = useSignal(newsItem.value.status);
    const dateSignal     = useSignal(new Date(newsItem.value.publishedAt).toISOString().slice(0, 16));

    const imagePreview   = useSignal<string>(newsItem.value.imageUrl || '');
    const currentGallery = useSignal<string[]>(newsItem.value.additionalImages);
    const newPreviews    = useSignal<string[]>([]);

    const isLoading  = useSignal(false);
    const successMsg = useSignal('');
    const errorMsg   = useSignal('');

    const handleSubmit = $(async (e: SubmitEvent) => {
        e.preventDefault();
        isLoading.value  = true;
        successMsg.value = '';
        errorMsg.value   = '';

        const form     = e.target as HTMLFormElement;
        const formData = new FormData(form);

        // Sobreescribimos currentGalleryJson con el estado actual de la señal
        formData.set('currentGalleryJson', JSON.stringify(currentGallery.value));

        try {
            const res  = await fetch(`/api/admin/noticias/update/${newsItem.value.id}`, { method: 'POST', body: formData });
            const data = await res.json();

            if (res.ok && data.success) {
                successMsg.value = '¡Cambios guardados con éxito!';
                // Actualizar señales con los datos reales guardados
                if (data.additionalImages) currentGallery.value = data.additionalImages;
                if (data.imageUrl) imagePreview.value = data.imageUrl;
                newPreviews.value = [];
            } else {
                errorMsg.value = data.error || 'Error desconocido.';
            }
        } catch (err: any) {
            errorMsg.value = `Error de red: ${err.message}`;
        } finally {
            isLoading.value = false;
        }
    });

    return (
        <div class="max-w-4xl mx-auto font-['Public_Sans'] pb-20">
            <div class="mb-8">
                <a href="/admin/noticias" class="text-gray-500 hover:text-primary transition-colors flex items-center text-sm font-medium mb-2">
                    <span class="material-symbols-outlined text-sm mr-1">arrow_back</span> Volver al listado
                </a>
                <h1 class="text-3xl font-bold text-gray-900">Editar Noticia</h1>
            </div>

            <form onSubmit$={handleSubmit} enctype="multipart/form-data" class="space-y-6">
                {successMsg.value && (
                    <div class="bg-green-50 text-green-700 p-4 rounded-lg flex items-center gap-2 border border-green-200 shadow-sm">
                        <span class="material-symbols-outlined">check_circle</span>
                        <strong>{successMsg.value}</strong>
                    </div>
                )}
                {errorMsg.value && (
                    <div class="bg-red-50 text-red-700 p-4 rounded-lg flex items-center gap-2 border border-red-200 shadow-sm">
                        <span class="material-symbols-outlined">error</span>
                        {errorMsg.value}
                    </div>
                )}

                {/* Campo oculto con la galería actual serializada */}
                <input type="hidden" name="currentGalleryJson" value={JSON.stringify(currentGallery.value)} />
                <input type="hidden" name="existingImageUrl"   value={newsItem.value.imageUrl || ''} />

                <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div class="lg:col-span-2 space-y-6">
                        <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-4">
                            <div>
                                <label class="block text-sm font-bold text-gray-700 mb-1">Título</label>
                                <input type="text" name="title" required value={titleSignal.value}
                                    onInput$={(e) => titleSignal.value = (e.target as HTMLInputElement).value}
                                    class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-primary outline-none font-bold text-lg" />
                            </div>
                            <div>
                                <label class="block text-xs font-bold text-gray-400 mb-1">Enlace (Slug)</label>
                                <input type="text" name="slug" required value={slugSignal.value}
                                    onInput$={(e) => slugSignal.value = (e.target as HTMLInputElement).value}
                                    class="w-full px-3 py-1.5 rounded-lg border border-gray-200 bg-gray-50 text-xs font-mono" />
                            </div>
                            <div>
                                <label class="block text-sm font-bold text-gray-700 mb-1">Contenido</label>
                                <textarea name="content" required rows={10} value={contentSignal.value}
                                    onInput$={(e) => contentSignal.value = (e.target as HTMLTextAreaElement).value}
                                    class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-primary outline-none text-sm leading-relaxed"></textarea>
                            </div>

                            {/* Galería */}
                            <div>
                                <label class="block text-sm font-bold text-gray-700 mb-2">Galería de Imágenes</label>
                                <div class="grid grid-cols-4 gap-3">
                                    {/* Fotos ya en Cloudinary */}
                                    {currentGallery.value.map((src) => (
                                        <div key={src} class="aspect-square rounded-lg border overflow-hidden relative group">
                                            <img src={src} class="w-full h-full object-cover" alt="" />
                                            <button type="button"
                                                onClick$={() => currentGallery.value = currentGallery.value.filter(u => u !== src)}
                                                class="absolute top-1 right-1 bg-red-500 text-white p-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                                <span class="material-symbols-outlined text-sm">close</span>
                                            </button>
                                        </div>
                                    ))}
                                    {/* Previews nuevas */}
                                    {newPreviews.value.map((src, i) => (
                                        <div key={i} class="aspect-square rounded-lg border-2 border-primary/40 overflow-hidden relative group">
                                            <img src={src} class="w-full h-full object-cover opacity-80" alt="" />
                                            <div class="absolute bottom-0 inset-x-0 bg-primary/70 text-white text-[9px] text-center py-0.5">Por subir</div>
                                        </div>
                                    ))}
                                    {/* Botón agregar */}
                                    <label class="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 hover:border-primary transition-colors gap-1">
                                        <span class="material-symbols-outlined text-gray-400">add_photo_alternate</span>
                                        <span class="text-[10px] text-gray-400">Agregar fotos</span>
                                        <input type="file" name="gallery" multiple accept="image/*" class="hidden"
                                            onChange$={(e) => {
                                                const files = (e.target as HTMLInputElement).files;
                                                if (!files) return;
                                                newPreviews.value = [...newPreviews.value, ...Array.from(files).map(f => URL.createObjectURL(f))];
                                            }} />
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="space-y-5">
                        <div class="bg-white p-5 rounded-xl shadow-sm border border-gray-200 space-y-4">
                            <h2 class="text-xs font-bold uppercase tracking-wider text-gray-400 border-b pb-2">Ajustes</h2>
                            <div>
                                <label class="block text-xs font-bold text-gray-500 mb-1 uppercase">Estado</label>
                                <select name="status" value={statusSignal.value}
                                    onChange$={(e) => statusSignal.value = (e.target as HTMLSelectElement).value as any}
                                    class="w-full p-2 border rounded-lg bg-white outline-none text-sm">
                                    <option value="published">Publicado</option>
                                    <option value="draft">Borrador</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-xs font-bold text-gray-500 mb-1 uppercase">Categoría</label>
                                <select name="category" value={categorySignal.value}
                                    onChange$={(e) => categorySignal.value = (e.target as HTMLSelectElement).value}
                                    class="w-full p-2 border rounded-lg bg-white outline-none text-sm">
                                    <option value="Institucional">Institucional</option>
                                    <option value="Obras">Obras Públicas</option>
                                    <option value="Cultura">Cultura y Deporte</option>
                                    <option value="Salud">Salud</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-xs font-bold text-gray-500 mb-1 uppercase">Fecha de Pub.</label>
                                <input type="datetime-local" name="publishedAt" required value={dateSignal.value}
                                    onChange$={(e) => dateSignal.value = (e.target as HTMLInputElement).value}
                                    class="w-full p-2 border rounded-lg text-sm" />
                            </div>
                        </div>

                        <div class="bg-white p-5 rounded-xl shadow-sm border border-gray-200 space-y-3">
                            <h2 class="text-xs font-bold uppercase tracking-wider text-gray-400 border-b pb-2">Imagen de Portada</h2>
                            <div class="aspect-video rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center relative overflow-hidden bg-gray-50 group cursor-pointer">
                                {imagePreview.value
                                    ? <img src={imagePreview.value} class="w-full h-full object-cover" alt="" />
                                    : <div class="flex flex-col items-center gap-1 text-gray-400">
                                        <span class="material-symbols-outlined text-3xl">image</span>
                                        <span class="text-xs">Sin portada</span>
                                      </div>
                                }
                                <div class="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span class="text-white text-xs font-bold bg-black/50 px-3 py-1 rounded-full">Cambiar portada</span>
                                </div>
                                <input type="file" name="image" accept="image/*"
                                    class="absolute inset-0 opacity-0 cursor-pointer"
                                    onChange$={(e) => {
                                        const f = (e.target as HTMLInputElement).files?.[0];
                                        if (!f) return;
                                        const r = new FileReader();
                                        r.onload = (ev) => imagePreview.value = ev.target?.result as string;
                                        r.readAsDataURL(f);
                                    }} />
                            </div>
                        </div>

                        <button type="submit" disabled={isLoading.value}
                            class="w-full bg-primary text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg disabled:opacity-60 transition-all active:scale-95">
                            {isLoading.value
                                ? <><span class="material-symbols-outlined animate-spin text-xl">refresh</span> Guardando...</>
                                : <><span class="material-symbols-outlined text-xl">save</span> Guardar Cambios</>
                            }
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
});
