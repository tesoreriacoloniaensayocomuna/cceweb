import { component$, useSignal, $ } from '@builder.io/qwik';

export default component$(() => {
    const isLoading = useSignal(false);
    const successMsg = useSignal('');
    const errorMsg = useSignal('');
    const fileName = useSignal('');

    const handleSubmit = $(async (e: SubmitEvent) => {
        e.preventDefault();
        isLoading.value = true;
        successMsg.value = '';
        errorMsg.value = '';

        const form = e.target as HTMLFormElement;
        const formData = new FormData(form);

        try {
            const res = await fetch('/api/admin/regulations/create', { method: 'POST', body: formData });
            const data = await res.json();

            if (res.ok && data.success) {
                successMsg.value = '¡Normativa publicada con éxito!';
                form.reset();
                fileName.value = '';
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
                <a href="/admin/normativas" class="text-gray-500 hover:text-primary transition-colors flex items-center text-sm font-medium mb-2">
                    <span class="material-symbols-outlined text-sm mr-1">arrow_back</span> Volver al listado
                </a>
                <h1 class="text-3xl font-bold text-gray-900">Nueva Normativa</h1>
                <p class="text-gray-500">Registra una nueva ordenanza o ley comunal.</p>
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
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div class="md:col-span-2">
                            <label class="block text-sm font-bold text-gray-700 mb-2">Título de la Normativa</label>
                            <input type="text" name="title" required placeholder="Ej: Programa de Gestión de Residuos"
                                class="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-primary outline-none text-lg font-medium" />
                        </div>
                        <div>
                            <label class="block text-sm font-bold text-gray-700 mb-2">Número / ID</label>
                            <input type="text" name="regulationNumber" required placeholder="Ej: ORD 125/2024"
                                class="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-primary outline-none text-lg font-bold bg-gray-50" />
                        </div>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label class="block text-sm font-bold text-gray-700 mb-2">Fecha de Sanción</label>
                            <input type="date" name="sanctionDate" required
                                value={new Date().toISOString().split('T')[0]}
                                class="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-primary outline-none" />
                        </div>
                        <div>
                            <label class="block text-sm font-bold text-gray-700 mb-2">Archivo PDF (Opcional)</label>
                            <div class="relative group">
                                <div class="w-full px-4 py-3 rounded-xl border-2 border-dashed border-gray-300 group-hover:border-primary transition-colors flex items-center gap-3 cursor-pointer overflow-hidden">
                                    <span class="material-symbols-outlined text-gray-400 group-hover:text-primary">picture_as_pdf</span>
                                    <span class="text-sm text-gray-500 truncate">
                                        {fileName.value || 'Seleccionar archivo PDF'}
                                    </span>
                                </div>
                                <input type="file" name="pdf" accept="application/pdf"
                                    class="absolute inset-0 opacity-0 cursor-pointer"
                                    onChange$={(e) => {
                                        const file = (e.target as HTMLInputElement).files?.[0];
                                        if (file) fileName.value = file.name;
                                    }} />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label class="block text-sm font-bold text-gray-700 mb-2">Contenido / Resumen Escrito</label>
                        <textarea name="content" required rows={12} placeholder="Escribe el texto completo o un resumen de la normativa..."
                            class="w-full px-4 py-4 rounded-xl border border-gray-300 focus:border-primary outline-none text-sm leading-relaxed"></textarea>
                    </div>

                    <button type="submit" disabled={isLoading.value}
                        class="w-full bg-primary text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg disabled:opacity-60 transition-all active:scale-95">
                        {isLoading.value
                            ? <><span class="material-symbols-outlined animate-spin text-xl">refresh</span> Publicando...</>
                            : <><span class="material-symbols-outlined text-xl">publish</span> Publicar Normativa</>
                        }
                    </button>
                </div>
            </form>
        </div>
    );
});
