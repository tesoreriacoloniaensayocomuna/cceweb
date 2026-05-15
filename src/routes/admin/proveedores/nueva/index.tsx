import { component$, useSignal, $ } from '@builder.io/qwik';

export default component$(() => {
    const isLoading = useSignal(false);
    const successMsg = useSignal('');
    const errorMsg = useSignal('');

    const handleSubmit = $(async (e: SubmitEvent) => {
        e.preventDefault();
        isLoading.value = true;
        successMsg.value = '';
        errorMsg.value = '';

        const form = e.target as HTMLFormElement;
        const formData = new FormData(form);

        try {
            const res = await fetch('/api/admin/tenders/create', { method: 'POST', body: formData });
            const data = await res.json();

            if (res.ok && data.success) {
                successMsg.value = 'Licitación publicada correctamente.';
                form.reset();
            } else {
                errorMsg.value = data.error || 'Error al guardar.';
            }
        } catch (err: any) {
            errorMsg.value = 'Error de conexión.';
        } finally {
            isLoading.value = false;
        }
    });

    return (
        <div class="max-w-4xl mx-auto font-['Public_Sans'] pb-20">
            <div class="mb-8">
                <a href="/admin/proveedores" class="text-gray-500 hover:text-primary flex items-center text-sm font-medium mb-2">
                    <span class="material-symbols-outlined text-sm mr-1">arrow_back</span> Volver
                </a>
                <h1 class="text-3xl font-bold text-gray-900">Nueva Licitación</h1>
            </div>

            <form onSubmit$={handleSubmit} class="space-y-6">
                {successMsg.value && <div class="bg-green-50 text-green-700 p-4 rounded-xl border border-green-200">{successMsg.value}</div>}
                {errorMsg.value && <div class="bg-red-50 text-red-700 p-4 rounded-xl border border-red-200">{errorMsg.value}</div>}

                <div class="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 space-y-6">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label class="block text-sm font-bold text-gray-700 mb-2">Nro de Licitación</label>
                            <input type="text" name="tenderNumber" required placeholder="Ej: 01/2024"
                                class="w-full px-4 py-3 rounded-xl border border-gray-300 outline-none focus:border-primary" />
                        </div>
                        <div>
                            <label class="block text-sm font-bold text-gray-700 mb-2">Estado</label>
                            <select name="status" class="w-full px-4 py-3 rounded-xl border border-gray-300 outline-none">
                                <option value="open">Abierta</option>
                                <option value="closed">Cerrada</option>
                                <option value="awarded">Adjudicada</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label class="block text-sm font-bold text-gray-700 mb-2">Título / Objeto</label>
                        <input type="text" name="title" required placeholder="Ej: Adquisición de materiales para pavimentación"
                            class="w-full px-4 py-3 rounded-xl border border-gray-300 outline-none focus:border-primary" />
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label class="block text-sm font-bold text-gray-700 mb-2">Fecha de Apertura</label>
                            <input type="date" name="openingDate"
                                class="w-full px-4 py-3 rounded-xl border border-gray-300 outline-none focus:border-primary" />
                        </div>
                        <div>
                            <label class="block text-sm font-bold text-gray-700 mb-2">Pliego (PDF)</label>
                            <input type="file" name="pdf" accept="application/pdf" required
                                class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer" />
                        </div>
                    </div>

                    <div>
                        <label class="block text-sm font-bold text-gray-700 mb-2">Descripción Adicional</label>
                        <textarea name="description" rows={4}
                            class="w-full px-4 py-3 rounded-xl border border-gray-300 outline-none focus:border-primary text-sm"></textarea>
                    </div>

                    <button type="submit" disabled={isLoading.value}
                        class="w-full bg-primary text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg disabled:opacity-60 transition-all">
                        {isLoading.value ? 'Publicando...' : 'Publicar Licitación'}
                    </button>
                </div>
            </form>
        </div>
    );
});
