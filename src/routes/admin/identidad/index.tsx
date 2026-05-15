import { component$, useSignal, $ } from '@builder.io/qwik';
import { routeLoader$, Link, routeAction$ } from '@builder.io/qwik-city';
import { getDb } from '~/database/db';
import { identityMilestones } from '~/database/schema';
import { eq, desc, asc } from 'drizzle-orm';

export const useGetMilestones = routeLoader$(async (event) => {
    const db = getDb(event.env);
    const items = await db.select().from(identityMilestones).orderBy(asc(identityMilestones.sortOrder), desc(identityMilestones.year));
    return items;
});

export const useDeleteMilestone = routeAction$(async (data, event) => {
    const db = getDb(event.env);
    await db.delete(identityMilestones).where(eq(identityMilestones.id, data.id as string));
    return { success: true };
});

export default component$(() => {
    const milestones = useGetMilestones();
    const deleteAction = useDeleteMilestone();

    const handleDelete = $(async (id: string) => {
        if (confirm('¿Estás seguro de eliminar este hito histórico?')) {
            await deleteAction.submit({ id });
        }
    });

    return (
        <div class="max-w-6xl mx-auto font-['Public_Sans']">
            <div class="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 class="text-3xl font-bold text-gray-900">Identidad y Raíces</h1>
                    <p class="text-gray-500 mt-1">Gestiona los hitos históricos y momentos clave del pueblo.</p>
                </div>
                <Link 
                    href="/admin/identidad/nueva/" 
                    class="bg-primary text-white px-6 py-2.5 rounded-lg font-bold hover:bg-primary/90 transition-all flex items-center gap-2 shadow-sm w-fit"
                >
                    <span class="material-symbols-outlined">add</span>
                    Nuevo Hito
                </Link>
            </div>

            <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div class="overflow-x-auto">
                    <table class="w-full text-left">
                        <thead class="bg-gray-50 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                            <tr>
                                <th class="px-6 py-4">Año/Fecha</th>
                                <th class="px-6 py-4">Título</th>
                                <th class="px-6 py-4">Imagen</th>
                                <th class="px-6 py-4">Estado</th>
                                <th class="px-6 py-4 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-100">
                            {milestones.value.length === 0 ? (
                                <tr>
                                    <td colSpan={5} class="px-6 py-12 text-center text-gray-500 italic">
                                        No hay hitos históricos cargados.
                                    </td>
                                </tr>
                            ) : (
                                milestones.value.map((m) => (
                                    <tr key={m.id} class="hover:bg-gray-50 transition-colors">
                                        <td class="px-6 py-4">
                                            <span class="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-bold">
                                                {m.year}
                                            </span>
                                        </td>
                                        <td class="px-6 py-4">
                                            <p class="font-bold text-gray-800">{m.title}</p>
                                        </td>
                                        <td class="px-6 py-4">
                                            {m.imageUrl ? (
                                                <img src={m.imageUrl} class="w-12 h-12 rounded object-cover border" alt="" />
                                            ) : (
                                                <span class="text-gray-300 text-xs italic">Sin imagen</span>
                                            )}
                                        </td>
                                        <td class="px-6 py-4">
                                            {m.published ? (
                                                <span class="text-green-600 flex items-center gap-1 text-xs font-bold">
                                                    <span class="material-symbols-outlined text-xs">check_circle</span> Publicado
                                                </span>
                                            ) : (
                                                <span class="text-gray-400 flex items-center gap-1 text-xs font-bold">
                                                    <span class="material-symbols-outlined text-xs">visibility_off</span> Oculto
                                                </span>
                                            )}
                                        </td>
                                        <td class="px-6 py-4 text-right">
                                            <div class="flex items-center justify-end gap-2">
                                                <Link 
                                                    href={`/admin/identidad/${m.id}/`}
                                                    class="p-2 text-gray-400 hover:text-primary transition-colors"
                                                    title="Editar"
                                                >
                                                    <span class="material-symbols-outlined text-xl">edit</span>
                                                </Link>
                                                <button 
                                                    type="button"
                                                    onClick$={() => handleDelete(m.id)}
                                                    class="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                                    title="Eliminar"
                                                >
                                                    <span class="material-symbols-outlined text-xl">delete</span>
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
