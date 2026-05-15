import { component$ } from '@builder.io/qwik';
import { routeLoader$, Link, type DocumentHead, routeAction$, zod$, z } from '@builder.io/qwik-city';
import { getDb } from '../../../database/db';
import { procedures } from '../../../database/schema';
import { desc, eq } from 'drizzle-orm';

export const useGetProcedures = routeLoader$(async (event) => {
    const db = getDb(event.env);
    return await db.select().from(procedures).orderBy(desc(procedures.createdAt));
});

export const useDeleteProcedure = routeAction$(async (data, event) => {
    const db = getDb(event.env);
    await db.delete(procedures).where(eq(procedures.id, data.id));
    return { success: true };
}, zod$({
    id: z.string()
}));

export default component$(() => {
    const proceduresData = useGetProcedures();
    const deleteAction = useDeleteProcedure();

    return (
        <div class="flex flex-col gap-8">
            <div class="flex items-center justify-between">
                <div>
                    <h2 class="text-h2 text-primary font-black uppercase tracking-tight">Guía de Trámites</h2>
                    <p class="text-on-surface-variant">Administra los trámites municipales, requisitos y formularios de descarga.</p>
                </div>
                <Link 
                    href="/admin/tramites/nuevo/" 
                    class="bg-primary text-on-primary px-xl py-md rounded-2xl font-black flex items-center gap-2 hover:opacity-90 transition-all shadow-lg shadow-primary/20"
                >
                    <span class="material-symbols-outlined">add</span>
                    Nuevo Trámite
                </Link>
            </div>

            <div class="bg-white rounded-3xl border border-outline-variant shadow-sm overflow-hidden">
                <div class="overflow-x-auto">
                    <table class="w-full text-left border-collapse">
                        <thead>
                            <tr class="bg-surface-container-low border-b border-outline-variant">
                                <th class="px-6 py-4 text-label-sm font-black uppercase tracking-widest text-outline">Trámite</th>
                                <th class="px-6 py-4 text-label-sm font-black uppercase tracking-widest text-outline">Descripción</th>
                                <th class="px-6 py-4 text-label-sm font-black uppercase tracking-widest text-outline text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-outline-variant">
                            {proceduresData.value.length === 0 ? (
                                <tr>
                                    <td colSpan={3} class="px-6 py-12 text-center text-outline italic">
                                        No hay trámites registrados aún.
                                    </td>
                                </tr>
                            ) : (
                                proceduresData.value.map((proc) => (
                                    <tr key={proc.id} class="hover:bg-surface-container-lowest transition-colors group">
                                        <td class="px-6 py-4">
                                            <div class="flex items-center gap-3">
                                                <div class="w-10 h-10 rounded-full bg-secondary/5 flex items-center justify-center border border-outline-variant">
                                                    <span class="material-symbols-outlined text-secondary/30 text-xl">description</span>
                                                </div>
                                                <span class="font-bold text-on-surface">{proc.title}</span>
                                            </div>
                                        </td>
                                        <td class="px-6 py-4">
                                            <p class="text-on-surface-variant line-clamp-1 max-w-md">{proc.description}</p>
                                        </td>
                                        <td class="px-6 py-4 text-right">
                                            <div class="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Link 
                                                    href={`/admin/tramites/editar/${proc.id}`} 
                                                    class="p-2 text-primary hover:bg-primary/10 rounded-xl transition-all"
                                                    title="Editar"
                                                >
                                                    <span class="material-symbols-outlined">edit</span>
                                                </Link>
                                                <button 
                                                    onClick$={() => {
                                                        if(confirm('¿Estás seguro de eliminar este trámite?')) {
                                                            deleteAction.submit({ id: proc.id });
                                                        }
                                                    }}
                                                    class="p-2 text-error hover:bg-error/10 rounded-xl transition-all"
                                                    title="Eliminar"
                                                >
                                                    <span class="material-symbols-outlined">delete</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
});

export const head: DocumentHead = {
    title: 'Trámites - Panel Admin',
};
