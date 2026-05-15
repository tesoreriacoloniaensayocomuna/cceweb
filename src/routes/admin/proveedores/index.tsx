import { component$, $ } from '@builder.io/qwik';
import { routeLoader$, Link, routeAction$, Form } from '@builder.io/qwik-city';
import { getDb } from '~/database/db';
import { tenders, siteConfig } from '~/database/schema';
import { eq, desc } from 'drizzle-orm';
import { uploadImageToCloudinary } from '~/lib/cloudinary';
import { z, zod$ } from '@builder.io/qwik-city';

export const useGetTendersData = routeLoader$(async (event) => {
    const db = getDb(event.env);
    const list = await db.select().from(tenders).orderBy(desc(tenders.createdAt));
    const config = await db.select().from(siteConfig).where(eq(siteConfig.id, 'main'));
    return {
        tenders: list,
        registryUrl: config[0]?.providerRegistryUrl || null,
        providerEmail: config[0]?.providerEmail || "suministros.coloniaensayocomuna@gmail.com"
    };
});

export const useUpdateProviderEmail = routeAction$(async (data, event) => {
    const db = getDb(event.env);
    const email = data.email;

    const existing = await db.select().from(siteConfig).where(eq(siteConfig.id, 'main'));
    if (existing.length > 0) {
        await db.update(siteConfig).set({ 
            providerEmail: email,
            updatedAt: new Date()
        }).where(eq(siteConfig.id, 'main'));
    } else {
        await db.insert(siteConfig).values({
            id: 'main',
            providerEmail: email,
            updatedAt: new Date()
        });
    }
    return { success: true };
}, zod$({
    email: z.string().email('Email inválido')
}));

export const useUploadRegistry = routeAction$(async (data, event) => {
    const db = getDb(event.env);
    const file = data.pdf as File;
    
    if (!file || file.size === 0) return { error: 'No se seleccionó ningún archivo.' };

    try {
        const pdfUrl = await uploadImageToCloudinary(file, event.env);
        
        const existing = await db.select().from(siteConfig).where(eq(siteConfig.id, 'main'));
        if (existing.length > 0) {
            await db.update(siteConfig).set({ 
                providerRegistryUrl: pdfUrl,
                updatedAt: new Date()
            }).where(eq(siteConfig.id, 'main'));
        } else {
            await db.insert(siteConfig).values({
                id: 'main',
                providerRegistryUrl: pdfUrl,
                updatedAt: new Date()
            });
        }
        return { success: true };
    } catch (e: any) {
        return { error: e.message };
    }
}, zod$({
    pdf: z.any()
}));

export const useDeleteTender = routeAction$(async (data, event) => {
    const db = getDb(event.env);
    await db.delete(tenders).where(eq(tenders.id, data.id as string));
    return { success: true };
});

export default component$(() => {
    const data = useGetTendersData();
    const deleteAction = useDeleteTender();
    const uploadAction = useUploadRegistry();
    const emailAction = useUpdateProviderEmail();

    const handleDelete = $(async (id: string) => {
        if (confirm('¿Eliminar esta licitación?')) {
            await deleteAction.submit({ id });
        }
    });

    return (
        <div class="max-w-6xl mx-auto font-['Public_Sans'] space-y-12">
            
            {/* Gestión de Registro de Proveedores */}
            <div class="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
                <div class="p-8 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h2 class="text-2xl font-bold text-gray-900">Registro de Proveedores</h2>
                        <p class="text-gray-500 text-sm mt-1">Este es el PDF que los proveedores descargan para inscribirse.</p>
                    </div>
                    {data.value.registryUrl && (
                        <a href={data.value.registryUrl} target="_blank" class="flex items-center gap-2 text-primary font-bold hover:underline bg-primary/5 px-4 py-2 rounded-xl">
                            <span class="material-symbols-outlined">description</span>
                            Ver PDF actual
                        </a>
                    )}
                </div>
                <div class="p-8 bg-gray-50/50">
                    <Form action={uploadAction} enctype="multipart/form-data" class="flex flex-col md:flex-row items-end gap-4">
                        <div class="flex-1 w-full">
                            <label class="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Subir nuevo PDF de Registro</label>
                            <input type="file" name="pdf" accept="application/pdf" required
                                class="block w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-6 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-primary file:text-white hover:file:bg-primary/90 cursor-pointer transition-all" />
                        </div>
                        <button type="submit" disabled={uploadAction.isRunning}
                            class="bg-gray-900 text-white px-8 py-2.5 rounded-xl font-bold hover:bg-gray-800 disabled:opacity-50 transition-all flex items-center gap-2 h-[42px]">
                            {uploadAction.isRunning ? 'Subiendo...' : 'Actualizar Archivo'}
                        </button>
                    </Form>
                    {uploadAction.value?.success && <p class="text-green-600 text-sm font-bold mt-4 flex items-center gap-1"><span class="material-symbols-outlined text-sm">check_circle</span> Archivo actualizado correctamente.</p>}
                    {uploadAction.value?.error && <p class="text-red-600 text-sm font-bold mt-4">Error: {uploadAction.value.error}</p>}
                </div>
            </div>

            {/* Configuración de Correo de Recepción */}
            <div class="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
                <div class="p-8 border-b border-gray-100">
                    <h2 class="text-2xl font-bold text-gray-900">Correo de Recepción</h2>
                    <p class="text-gray-500 text-sm mt-1">Este es el correo que se muestra públicamente para que los proveedores envíen su documentación.</p>
                </div>
                <div class="p-8 bg-gray-50/50">
                    <Form action={emailAction} class="flex flex-col md:flex-row items-end gap-4">
                        <div class="flex-1 w-full">
                            <label class="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Correo para Suministros</label>
                            <input 
                                type="email" 
                                name="email" 
                                value={data.value.providerEmail} 
                                required
                                class="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all bg-white" 
                            />
                        </div>
                        <button type="submit" disabled={emailAction.isRunning}
                            class="bg-primary text-white px-8 py-2.5 rounded-xl font-bold hover:bg-primary/90 disabled:opacity-50 transition-all flex items-center gap-2 h-[42px]">
                            {emailAction.isRunning ? 'Guardando...' : 'Guardar Correo'}
                        </button>
                    </Form>
                    {emailAction.value?.success && <p class="text-green-600 text-sm font-bold mt-4 flex items-center gap-1"><span class="material-symbols-outlined text-sm">check_circle</span> Correo actualizado correctamente.</p>}
                </div>
            </div>

            <div class="space-y-8">
                <div class="flex justify-between items-center">
                    <div>
                        <h1 class="text-3xl font-bold text-gray-900">Licitaciones Públicas</h1>
                        <p class="text-gray-500">Gestiona los pliegos y llamados a licitación.</p>
                    </div>
                    <Link href="/admin/proveedores/nueva/" class="bg-primary text-white px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 shadow-lg shadow-primary/20">
                        <span class="material-symbols-outlined">add</span> Nueva Licitación
                    </Link>
                </div>

                <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <table class="w-full text-left">
                        <thead class="bg-gray-50 text-xs uppercase text-gray-500 font-semibold">
                            <tr>
                                <th class="px-6 py-4">Nro / Título</th>
                                <th class="px-6 py-4">Apertura</th>
                                <th class="px-6 py-4">Estado</th>
                                <th class="px-6 py-4 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-100 text-sm">
                            {data.value.tenders.map(t => (
                                <tr key={t.id} class="hover:bg-gray-50">
                                    <td class="px-6 py-4">
                                        <p class="font-bold text-gray-900">{t.tenderNumber}</p>
                                        <p class="text-gray-500 text-xs">{t.title}</p>
                                    </td>
                                    <td class="px-6 py-4 text-gray-600">
                                        {t.openingDate ? new Date(t.openingDate).toLocaleDateString() : 'N/A'}
                                    </td>
                                    <td class="px-6 py-4">
                                        <span class={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                                            t.status === 'open' ? 'bg-green-100 text-green-700' : 
                                            t.status === 'closed' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                                        }`}>
                                            {t.status === 'open' ? 'Abierta' : t.status === 'closed' ? 'Cerrada' : 'Adjudicada'}
                                        </span>
                                    </td>
                                    <td class="px-6 py-4 text-right">
                                        <div class="flex justify-end gap-2">
                                            {t.pdfUrl && (
                                                <a href={t.pdfUrl} target="_blank" class="p-2 text-primary hover:bg-primary/5 rounded" title="Ver PDF">
                                                    <span class="material-symbols-outlined">description</span>
                                                </a>
                                            )}
                                            <button onClick$={() => handleDelete(t.id)} class="p-2 text-gray-400 hover:text-red-500 rounded">
                                                <span class="material-symbols-outlined">delete</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {data.value.tenders.length === 0 && (
                                <tr>
                                    <td colSpan={4} class="px-6 py-12 text-center text-gray-400 italic">No hay licitaciones cargadas.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
});
