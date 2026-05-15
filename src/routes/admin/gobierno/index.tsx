import { component$ } from '@builder.io/qwik';
import { routeLoader$, Link, type DocumentHead, routeAction$, zod$, z } from '@builder.io/qwik-city';
import { getDb } from '../../../database/db';
import { authorities } from '../../../database/schema';
import { desc, eq, asc } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

export const useGetAuthorities = routeLoader$(async (event) => {
    const db = getDb(event.env);
    return await db.select().from(authorities).orderBy(asc(authorities.sortOrder));
});

export const useDeleteAuthority = routeAction$(async (data, event) => {
    const db = getDb(event.env);
    await db.delete(authorities).where(eq(authorities.id, data.id));
    return { success: true };
}, zod$({
    id: z.string()
}));

export default component$(() => {
    const authoritiesData = useGetAuthorities();
    const deleteAction = useDeleteAuthority();

    return (
        <div class="flex flex-col gap-8">
            <div class="flex items-center justify-between">
                <div>
                    <h2 class="text-h2 text-primary font-black uppercase tracking-tight">Equipo de Gobierno</h2>
                    <p class="text-on-surface-variant">Administra la nómina de funcionarios y autoridades municipales.</p>
                </div>
                <Link 
                    href="/admin/gobierno/nuevo/" 
                    class="bg-primary text-on-primary px-xl py-md rounded-2xl font-black flex items-center gap-2 hover:opacity-90 transition-all shadow-lg shadow-primary/20"
                >
                    <span class="material-symbols-outlined">add</span>
                    Nueva Autoridad
                </Link>
            </div>

            <div class="bg-white rounded-3xl border border-outline-variant shadow-sm overflow-hidden">
                <div class="overflow-x-auto">
                    <table class="w-full text-left border-collapse">
                        <thead>
                            <tr class="bg-surface-container-low border-b border-outline-variant">
                                <th class="px-6 py-4 text-label-sm font-black uppercase tracking-widest text-outline">Orden</th>
                                <th class="px-6 py-4 text-label-sm font-black uppercase tracking-widest text-outline">Nombre</th>
                                <th class="px-6 py-4 text-label-sm font-black uppercase tracking-widest text-outline">Cargo / Función</th>
                                <th class="px-6 py-4 text-label-sm font-black uppercase tracking-widest text-outline">Categoría</th>
                                <th class="px-6 py-4 text-label-sm font-black uppercase tracking-widest text-outline text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-outline-variant">
                            {authoritiesData.value.length === 0 ? (
                                <tr>
                                    <td colSpan={5} class="px-6 py-12 text-center text-outline italic">
                                        No hay autoridades registradas aún.
                                    </td>
                                </tr>
                            ) : (
                                authoritiesData.value.map((auth) => (
                                    <tr key={auth.id} class="hover:bg-surface-container-lowest transition-colors group">
                                        <td class="px-6 py-4">
                                            <span class="font-mono text-outline">{auth.sortOrder}</span>
                                        </td>
                                        <td class="px-6 py-4">
                                            <div class="flex items-center gap-3">
                                                {auth.photoUrl ? (
                                                    <img src={auth.photoUrl} alt={auth.name} class="w-10 h-10 rounded-full object-cover border border-outline-variant" />
                                                ) : (
                                                    <div class="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center border border-outline-variant">
                                                        <span class="material-symbols-outlined text-primary/30 text-xl">person</span>
                                                    </div>
                                                )}
                                                <span class="font-bold text-on-surface">{auth.name}</span>
                                            </div>
                                        </td>
                                        <td class="px-6 py-4">
                                            <span class="text-on-surface-variant font-medium">{auth.role}</span>
                                        </td>
                                        <td class="px-6 py-4">
                                            <span class="px-3 py-1 bg-secondary/10 text-secondary text-[10px] font-black uppercase tracking-wider rounded-full">
                                                {auth.category}
                                            </span>
                                        </td>
                                        <td class="px-6 py-4 text-right">
                                            <div class="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Link 
                                                    href={`/admin/gobierno/editar/${auth.id}`} 
                                                    class="p-2 text-primary hover:bg-primary/10 rounded-xl transition-all"
                                                    title="Editar"
                                                >
                                                    <span class="material-symbols-outlined">edit</span>
                                                </Link>
                                                <button 
                                                    onClick$={() => {
                                                        if(confirm('¿Estás seguro de eliminar esta autoridad?')) {
                                                            deleteAction.submit({ id: auth.id });
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
    title: 'Gobierno - Panel Admin',
};
