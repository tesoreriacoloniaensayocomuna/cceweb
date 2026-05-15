import { component$, $ } from '@builder.io/qwik';
import { routeLoader$, Link, routeAction$ } from '@builder.io/qwik-city';
import { getDb } from '~/database/db';
import { tourismItems } from '~/database/schema';
import { eq, desc } from 'drizzle-orm';

export const useGetTourismItems = routeLoader$(async (event) => {
    const db = getDb(event.env);
    return await db.select().from(tourismItems).orderBy(desc(tourismItems.createdAt));
});

export const useDeleteTourismItem = routeAction$(async (data, event) => {
    const db = getDb(event.env);
    await db.delete(tourismItems).where(eq(tourismItems.id, data.id as string));
    return { success: true };
});

export default component$(() => {
    const items = useGetTourismItems();
    const deleteAction = useDeleteTourismItem();

    const handleDelete = $(async (id: string) => {
        if (confirm('¿Eliminar este artículo de turismo?')) {
            await deleteAction.submit({ id });
        }
    });

    return (
        <div class="max-w-6xl mx-auto font-['Public_Sans']">
            <div class="flex justify-between items-center mb-8">
                <div>
                    <h1 class="text-3xl font-bold text-gray-900">Portal Turístico</h1>
                    <p class="text-gray-500">Gestiona eventos, fiestas y puntos de interés de la comunidad.</p>
                </div>
                <div class="flex gap-3">
                    <Link href="/admin/turismo/config/" class="bg-white text-gray-700 px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 border border-gray-200 hover:bg-gray-50 transition-all">
                        <span class="material-symbols-outlined">settings</span> Configurar Portada
                    </Link>
                    <Link href="/admin/turismo/nuevo/" class="bg-primary text-white px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all">
                        <span class="material-symbols-outlined">add_location</span> Nuevo Artículo
                    </Link>
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.value.map(item => (
                    <div key={item.id} class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col hover:shadow-md transition-shadow">
                        <div class="aspect-video bg-gray-100 relative group">
                            {item.imageUrls && (item.imageUrls as string[]).length > 0 ? (
                                <img src={(item.imageUrls as string[])[0]} alt={item.title} class="w-full h-full object-cover" />
                            ) : (
                                <div class="w-full h-full flex items-center justify-center text-gray-400">
                                    <span class="material-symbols-outlined text-4xl">image</span>
                                </div>
                            )}
                            <div class="absolute top-3 left-3">
                                <span class={`px-3 py-1 rounded-full text-[10px] font-bold uppercase shadow-sm ${
                                    item.category === 'event' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                                }`}>
                                    {item.category === 'event' ? 'Evento' : 'Lugar'}
                                </span>
                            </div>
                            {!item.published && (
                                <div class="absolute top-3 right-3">
                                    <span class="bg-gray-900/80 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase backdrop-blur-sm">Borrador</span>
                                </div>
                            )}
                        </div>
                        
                        <div class="p-5 flex-1 flex flex-col">
                            <h3 class="font-bold text-gray-900 mb-2 line-clamp-1">{item.title}</h3>
                            <div class="space-y-2 mb-6 flex-1">
                                <div class="flex items-center gap-2 text-xs text-gray-500">
                                    <span class="material-symbols-outlined text-sm">location_on</span>
                                    <span>{item.locationName || 'Sin ubicación'}</span>
                                </div>
                                {item.category === 'event' && item.eventDate && (
                                    <div class="flex items-center gap-2 text-xs text-gray-500">
                                        <span class="material-symbols-outlined text-sm">calendar_month</span>
                                        <span>{new Date(item.eventDate).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                    </div>
                                )}
                                {item.category === 'place' && item.openingHours && (
                                    <div class="flex items-center gap-2 text-xs text-gray-500">
                                        <span class="material-symbols-outlined text-sm">schedule</span>
                                        <span>{item.openingHours}</span>
                                    </div>
                                )}
                            </div>

                            <div class="flex justify-between items-center pt-4 border-t border-gray-50">
                                <Link href={`/admin/turismo/editar/${item.id}`} class="text-primary font-bold text-xs hover:underline flex items-center gap-1">
                                    <span class="material-symbols-outlined text-sm">edit</span> Editar
                                </Link>
                                <button onClick$={() => handleDelete(item.id)} class="text-gray-400 hover:text-red-500 transition-colors">
                                    <span class="material-symbols-outlined text-lg">delete</span>
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                {items.value.length === 0 && (
                    <div class="col-span-full py-20 text-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                        <span class="material-symbols-outlined text-6xl text-gray-300 mb-4">explore</span>
                        <p class="text-gray-500 font-medium">No hay artículos de turismo creados aún.</p>
                        <Link href="/admin/turismo/nuevo/" class="text-primary font-bold mt-2 inline-block hover:underline">Empieza por crear el primero</Link>
                    </div>
                )}
            </div>
        </div>
    );
});
