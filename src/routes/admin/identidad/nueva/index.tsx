import { component$, useSignal, $ } from '@builder.io/qwik';

export default component$(() => {
    const isLoading = useSignal(false);
    const successMsg = useSignal('');
    const errorMsg = useSignal('');
    const imagePreview = useSignal<string>('');

    const handleSubmit = $(async (e: SubmitEvent) => {
        e.preventDefault();
        isLoading.value = true;
        successMsg.value = '';
        errorMsg.value = '';

        const form = e.target as HTMLFormElement;
        const formData = new FormData(form);

        try {
            const res = await fetch('/api/admin/identity/create', { method: 'POST', body: formData });
            const data = await res.json();

            if (res.ok && data.success) {
                successMsg.value = '¡Hito histórico publicado con éxito!';
                form.reset();
                imagePreview.value = '';
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
                <a href="/admin/identidad" class="text-gray-500 hover:text-primary transition-colors flex items-center text-sm font-medium mb-2">
                    <span class="material-symbols-outlined text-sm mr-1">arrow_back</span> Volver al listado
                </a>
                <h1 class="text-3xl font-bold text-gray-900">Nuevo Hito Histórico</h1>
                <p class="text-gray-500">Agregá un momento relevante para la historia del pueblo.</p>
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

                <div class="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 space-y-6">
                    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div class="md:col-span-1">
                            <label class="block text-sm font-bold text-gray-700 mb-2">Año o Fecha</label>
                            <input type="text" name="year" required placeholder="Ej: 1924"
                                class="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-primary outline-none font-bold text-center bg-gray-50" />
                        </div>
                        <div class="md:col-span-3">
                            <label class="block text-sm font-bold text-gray-700 mb-2">Título del Hito</label>
                            <input type="text" name="title" required placeholder="Ej: Fundación de la primera escuela"
                                class="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-primary outline-none font-medium" />
                        </div>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label class="block text-sm font-bold text-gray-700 mb-2">Imagen Ilustrativa</label>
                            <div class="aspect-video rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center relative overflow-hidden bg-gray-50 group cursor-pointer hover:border-primary transition-colors">
                                {imagePreview.value
                                    ? <img src={imagePreview.value} class="w-full h-full object-cover" alt="" />
                                    : <div class="flex flex-col items-center gap-1 text-gray-400 group-hover:text-primary">
                                        <span class="material-symbols-outlined text-3xl">add_photo_alternate</span>
                                        <span class="text-xs">Subir foto antigua</span>
                                      </div>
                                }
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
                        <div class="space-y-4">
                            <div>
                                <label class="block text-sm font-bold text-gray-700 mb-2">Orden de Aparición</label>
                                <input type="number" name="sortOrder" defaultValue="0"
                                    class="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-primary outline-none" />
                                <p class="text-[11px] text-gray-400 mt-1">Los números más bajos aparecen primero en la línea de tiempo.</p>
                            </div>
                            <div>
                                <label class="block text-sm font-bold text-gray-700 mb-2">Estado</label>
                                <select name="published" class="w-full px-4 py-3 rounded-xl border border-gray-300 outline-none">
                                    <option value="true">Publicado</option>
                                    <option value="false">Borrador (Oculto)</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label class="block text-sm font-bold text-gray-700 mb-2">Relato / Descripción</label>
                        <textarea name="content" required rows={10} placeholder="Contá la historia detrás de este momento..."
                            class="w-full px-4 py-4 rounded-xl border border-gray-300 focus:border-primary outline-none text-sm leading-relaxed"></textarea>
                    </div>

                    <button type="submit" disabled={isLoading.value}
                        class="w-full bg-primary text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg disabled:opacity-60 transition-all active:scale-95">
                        {isLoading.value
                            ? <><span class="material-symbols-outlined animate-spin text-xl">refresh</span> Guardando...</>
                            : <><span class="material-symbols-outlined text-xl">save</span> Guardar Hito</>
                        }
                    </button>
                </div>
            </form>
        </div>
    );
});
