import { component$, useSignal, $ } from '@builder.io/qwik';
import { routeLoader$, Link, routeAction$ } from '@builder.io/qwik-city';
import { getDb } from '../../../database/db';
import { regulations } from '../../../database/schema';
import { eq, desc, like, or, count } from 'drizzle-orm';

export const useGetRegulations = routeLoader$(async (event) => {
    try {
        const db = getDb(event.env);
        const url = new URL(event.url);
        const page = parseInt(url.searchParams.get('page') || '1');
        const search = url.searchParams.get('search') || '';
        const limit = 10;
        const offset = (page - 1) * limit;

        const whereClause = search 
            ? or(
                like(regulations.title, `%${search}%`),
                like(regulations.regulationNumber, `%${search}%`)
            ) 
            : undefined;

        const items = await db.select()
            .from(regulations)
            .where(whereClause)
            .orderBy(desc(regulations.sanctionDate))
            .limit(limit)
            .offset(offset);

        const totalResult = await db.select({ value: count() }).from(regulations).where(whereClause);
        const total = totalResult[0].value;

        // Serialización estricta
        const serializedItems = items.map(reg => ({
            ...reg,
            sanctionDate: reg.sanctionDate instanceof Date ? reg.sanctionDate.getTime() : (reg.sanctionDate ? new Date(reg.sanctionDate).getTime() : 0),
            createdAt: reg.createdAt instanceof Date ? reg.createdAt.getTime() : (reg.createdAt ? new Date(reg.createdAt).getTime() : 0),
            updatedAt: reg.updatedAt instanceof Date ? reg.updatedAt.getTime() : (reg.updatedAt ? new Date(reg.updatedAt).getTime() : 0),
        }));

        return {
            items: JSON.parse(JSON.stringify(serializedItems)),
            total,
            page,
            totalPages: Math.ceil(total / limit),
            search
        };
    } catch (error) {
        console.error("Regulations Loader Fatal Error:", error);
        return { items: [], total: 0, page: 1, totalPages: 1, search: '' };
    }
});

export const useDeleteRegulation = routeAction$(async (data, event) => {
    const db = getDb(event.env);
    await db.delete(regulations).where(eq(regulations.id, data.id as string));
    return { success: true };
});

export default component$(() => {
    const regsData = useGetRegulations();
    const deleteAction = useDeleteRegulation();
    const searchSignal = useSignal(regsData.value.search);

    const handleDelete = $(async (id: string) => {
        if (confirm('¿Estás seguro de eliminar esta normativa?')) {
            await deleteAction.submit({ id });
        }
    });

    const formatDate = (ts: any) => {
        if (!ts) return 'N/A';
        const d = new Date(ts);
        if (isNaN(d.getTime()) || d.getTime() === 0) return 'N/A';
        return d.toLocaleDateString('es-AR');
    };

    return (
        <div class="max-w-6xl mx-auto">
            <div class="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 class="text-3xl font-bold text-gray-900">Normativas y Ordenanzas</h1>
                    <p class="text-gray-500 mt-1">Gestión del boletín oficial comunal.</p>
                </div>
                <Link 
                    href="/admin/normativas/nueva/" 
                    class="bg-primary text-white px-6 py-2.5 rounded-lg font-bold hover:bg-primary/90 transition-all flex items-center gap-2 shadow-sm w-fit"
                >
                    <span class="material-symbols-outlined">add</span>
                    Nueva Normativa
                </Link>
            </div>

            <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div class="p-4 border-b border-gray-100 bg-gray-50/50">
                    <form method="get" class="flex flex-col sm:flex-row gap-4">
                        <div class="relative flex-1">
                            <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
                            <input 
                                type="text" 
                                name="search"
                                value={searchSignal.value}
                                onInput$={(e) => searchSignal.value = (e.target as HTMLInputElement).value}
                                placeholder="Buscar por título o número..." 
                                class="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm font-medium"
                            />
                        </div>
                        <button type="submit" class="bg-gray-800 text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-gray-700 transition-all">
                            Filtrar
                        </button>
                    </form>
                </div>

                <div class="overflow-x-auto">
                    <table class="w-full text-left">
                        <thead class="bg-gray-50 text-xs uppercase tracking-wider text-gray-500 font-semibold border-b border-gray-100">
                            <tr>
                                <th class="px-6 py-4">Número</th>
                                <th class="px-6 py-4">Título</th>
                                <th class="px-6 py-4">Fecha Sanción</th>
                                <th class="px-6 py-4 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-100">
                            {regsData.value.items.length === 0 ? (
                                <tr>
                                    <td colSpan={4} class="px-6 py-12 text-center text-gray-500 italic">
                                        No se encontraron normativas.
                                    </td>
                                </tr>
                            ) : (
                                regsData.value.items.map((reg: any) => (
                                    <tr key={reg.id} class="hover:bg-gray-50 transition-colors">
                                        <td class="px-6 py-4">
                                            <span class="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-md text-xs font-mono font-bold border border-gray-200">
                                                {reg.regulationNumber}
                                            </span>
                                        </td>
                                        <td class="px-6 py-4">
                                            <p class="font-bold text-gray-800 line-clamp-1">{reg.title}</p>
                                        </td>
                                        <td class="px-6 py-4 text-sm text-gray-500">
                                            {formatDate(reg.sanctionDate)}
                                        </td>
                                        <td class="px-6 py-4 text-right">
                                            <div class="flex items-center justify-end gap-1">
                                                <Link 
                                                    href={`/admin/normativas/${reg.id}/`}
                                                    class="p-2 text-gray-400 hover:text-primary transition-colors"
                                                    title="Editar"
                                                >
                                                    <span class="material-symbols-outlined text-xl">edit</span>
                                                </Link>
                                                <button 
                                                    type="button"
                                                    onClick$={() => handleDelete(reg.id)}
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

                {regsData.value.totalPages > 1 && (
                    <div class="p-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
                        <p class="text-sm text-gray-500">
                            Página <span class="font-bold text-gray-700">{regsData.value.page}</span> de {regsData.value.totalPages}
                        </p>
                        <div class="flex items-center gap-2">
                            <Link 
                                href={`?page=${regsData.value.page - 1}${regsData.value.search ? `&search=${regsData.value.search}` : ''}`}
                                class={`px-4 py-1.5 rounded border text-sm font-bold transition-all ${
                                    regsData.value.page > 1 
                                    ? 'bg-white border-gray-300 text-gray-700 hover:border-primary hover:text-primary' 
                                    : 'bg-gray-50 border-gray-200 text-gray-300 pointer-events-none'
                                }`}
                            >
                                Anterior
                            </Link>
                            <Link 
                                href={`?page=${regsData.value.page + 1}${regsData.value.search ? `&search=${regsData.value.search}` : ''}`}
                                class={`px-4 py-1.5 rounded border text-sm font-bold transition-all ${
                                    regsData.value.page < regsData.value.totalPages 
                                    ? 'bg-white border-gray-300 text-gray-700 hover:border-primary hover:text-primary' 
                                    : 'bg-gray-50 border-gray-200 text-gray-300 pointer-events-none'
                                }`}
                            >
                                Siguiente
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
});
