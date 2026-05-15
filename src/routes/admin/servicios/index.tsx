import { component$ } from '@builder.io/qwik';
import { routeLoader$, Link, type DocumentHead, routeAction$, zod$, z } from '@builder.io/qwik-city';
import { getDb } from '../../../database/db';
import { services } from '../../../database/schema';
import { desc, eq } from 'drizzle-orm';

export const useGetServices = routeLoader$(async (event) => {
    const db = getDb(event.env);
    return await db.select().from(services).orderBy(desc(services.createdAt));
});

export const useDeleteService = routeAction$(async (data, event) => {
    const db = getDb(event.env);
    await db.delete(services).where(eq(services.id, data.id));
    return { success: true };
}, zod$({
    id: z.string()
}));

export default component$(() => {
    const servicesData = useGetServices();
    const deleteAction = useDeleteService();

    return (
        <div class="flex flex-col gap-8">
            <div class="flex items-center justify-between">
                <div>
                    <h2 class="text-h2 text-primary font-black uppercase tracking-tight">Servicios Municipales</h2>
                    <p class="text-on-surface-variant">Administra los servicios brindados por la comuna y sus cuadros tarifarios.</p>
                </div>
                <Link 
                    href="/admin/servicios/nuevo/" 
                    class="bg-primary text-on-primary px-xl py-md rounded-2xl font-black flex items-center gap-2 hover:opacity-90 transition-all shadow-lg shadow-primary/20"
                >
                    <span class="material-symbols-outlined">add</span>
                    Nuevo Servicio
                </Link>
            </div>

            <div class="bg-white rounded-3xl border border-outline-variant shadow-sm overflow-hidden">
                <div class="overflow-x-auto">
                    <table class="w-full text-left border-collapse">
                        <thead>
                            <tr class="bg-surface-container-low border-b border-outline-variant">
                                <th class="px-6 py-4 text-label-sm font-black uppercase tracking-widest text-outline">Servicio</th>
                                <th class="px-6 py-4 text-label-sm font-black uppercase tracking-widest text-outline">Descripción Corta</th>
                                <th class="px-6 py-4 text-label-sm font-black uppercase tracking-widest text-outline text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-outline-variant">
                            {servicesData.value.length === 0 ? (
                                <tr>
                                    <td colSpan={3} class="px-6 py-12 text-center text-outline italic">
                                        No hay servicios registrados aún.
                                    </td>
                                </tr>
                            ) : (
                                servicesData.value.map((service) => (
                                    <tr key={service.id} class="hover:bg-surface-container-lowest transition-colors group">
                                        <td class="px-6 py-4">
                                            <div class="flex items-center gap-3">
                                                <div class="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center border border-outline-variant overflow-hidden shrink-0">
                                                    {service.iconUrl?.includes('/') ? (
                                                        <img src={service.iconUrl} alt={service.title} class="w-full h-full object-cover" />
                                                    ) : (
                                                        <span class="material-symbols-outlined text-primary/30 text-xl">{service.iconUrl || 'dry_cleaning'}</span>
                                                    )}
                                                </div>
                                                <span class="font-bold text-on-surface">{service.title}</span>
                                            </div>
                                        </td>
                                        <td class="px-6 py-4">
                                            <p class="text-on-surface-variant line-clamp-1 max-w-md">{service.description}</p>
                                        </td>
                                        <td class="px-6 py-4 text-right">
                                            <div class="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Link 
                                                    href={`/admin/servicios/editar/${service.id}`} 
                                                    class="p-2 text-primary hover:bg-primary/10 rounded-xl transition-all"
                                                    title="Editar"
                                                >
                                                    <span class="material-symbols-outlined">edit</span>
                                                </Link>
                                                <button 
                                                    onClick$={() => {
                                                        if(confirm('¿Estás seguro de eliminar este servicio?')) {
                                                            deleteAction.submit({ id: service.id });
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
    title: 'Servicios - Panel Admin',
};
