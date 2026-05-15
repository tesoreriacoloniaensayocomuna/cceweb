import { component$, useSignal, $ } from '@builder.io/qwik';
import { routeAction$, routeLoader$, Form, Link, server$, useLocation } from '@builder.io/qwik-city';
import { getDb } from '../../../database/db';
import { news } from '../../../database/schema';
import { eq, desc, like, and, sql, count } from 'drizzle-orm';

export const useGetNewsList = routeLoader$(async (event) => {
    const db = getDb(event.env);
    const url = new URL(event.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const search = url.searchParams.get('search') || '';
    const limit = 10;
    const offset = (page - 1) * limit;

    const whereClause = search ? like(news.title, `%${search}%`) : undefined;

    const items = await db.select()
        .from(news)
        .where(whereClause)
        .orderBy(desc(news.publishedAt))
        .limit(limit)
        .offset(offset);

    const totalResult = await db.select({ value: count() }).from(news).where(whereClause);
    const total = totalResult[0].value;

    // Sanear datos: additionalImages podría ser null en registros viejos
    const sanitizedItems = items.map(item => ({
        ...item,
        additionalImages: item.additionalImages ?? []
    }));

    return {
        items: sanitizedItems,
        total,
        page,
        totalPages: Math.ceil(total / limit),
        search
    };
});

export const useDeleteNews = routeAction$(async (data, event) => {
    const db = getDb(event.env);
    await db.delete(news).where(eq(news.id, data.id as string));
    return { success: true };
}, {
    id: 'deleteNews'
});

export default component$(() => {
    const newsData = useGetNewsList();
    const deleteAction = useDeleteNews();
    const loc = useLocation();
    const searchSignal = useSignal(newsData.value.search);

    const handleDelete = $(async (id: string) => {
        if (confirm('¿Estás seguro de eliminar esta noticia? Esta acción no se puede deshacer.')) {
            await deleteAction.submit({ id });
        }
    });

    return (
        <div class="max-w-6xl mx-auto">
            <div class="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 class="text-3xl font-bold text-gray-900">Gestión de Noticias</h1>
                    <p class="text-gray-500 mt-1">Administra las comunicaciones y novedades de la comuna.</p>
                </div>
                <Link 
                    href="/admin/noticias/nueva" 
                    class="bg-primary text-white px-6 py-2.5 rounded-lg font-bold hover:bg-primary/90 transition-all flex items-center gap-2 shadow-sm w-fit"
                >
                    <span class="material-symbols-outlined">add</span>
                    Nueva Noticia
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
                                placeholder="Buscar por título..." 
                                class="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
                            />
                        </div>
                        <button type="submit" class="bg-gray-800 text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-gray-700 transition-all">
                            Filtrar
                        </button>
                    </form>
                </div>

                <div class="overflow-x-auto">
                    <table class="w-full text-left">
                        <thead class="bg-gray-50 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                            <tr>
                                <th class="px-6 py-4">Noticia</th>
                                <th class="px-6 py-4">Categoría</th>
                                <th class="px-6 py-4">Estado</th>
                                <th class="px-6 py-4">Fecha Pub.</th>
                                <th class="px-6 py-4 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-100">
                            {newsData.value.items.length === 0 ? (
                                <tr>
                                    <td colSpan={5} class="px-6 py-12 text-center text-gray-500 italic">
                                        No se encontraron noticias.
                                    </td>
                                </tr>
                            ) : (
                                newsData.value.items.map((item) => (
                                    <tr key={item.id} class="hover:bg-gray-50 transition-colors">
                                        <td class="px-6 py-4">
                                            <div class="flex items-center gap-3">
                                                <div class="w-12 h-12 rounded bg-gray-100 flex-shrink-0 overflow-hidden border border-gray-200">
                                                    {item.imageUrl ? (
                                                        <img src={item.imageUrl} class="w-full h-full object-cover" alt="" />
                                                    ) : (
                                                        <div class="w-full h-full flex items-center justify-center text-gray-400">
                                                            <span class="material-symbols-outlined text-sm">image</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div class="max-w-xs sm:max-w-md">
                                                    <p class="font-bold text-gray-800 truncate">{item.title}</p>
                                                    <p class="text-xs text-gray-400 font-mono truncate">{item.slug}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td class="px-6 py-4">
                                            <span class="px-2 py-1 bg-gray-100 text-gray-600 rounded text-[10px] font-bold uppercase tracking-wider">
                                                {item.category}
                                            </span>
                                        </td>
                                        <td class="px-6 py-4">
                                            <span class={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                                                item.status === 'published' 
                                                ? 'bg-green-100 text-green-700' 
                                                : 'bg-amber-100 text-amber-700'
                                            }`}>
                                                {item.status === 'published' ? 'Publicado' : 'Borrador'}
                                            </span>
                                        </td>
                                        <td class="px-6 py-4 text-sm text-gray-500">
                                            {new Date(item.publishedAt).toLocaleDateString('es-AR')}
                                        </td>
                                        <td class="px-6 py-4 text-right">
                                            <div class="flex items-center justify-end gap-2">
                                                <Link 
                                                    href={`/admin/noticias/${item.id}`}
                                                    class="p-2 text-gray-400 hover:text-primary transition-colors"
                                                    title="Editar"
                                                >
                                                    <span class="material-symbols-outlined text-xl">edit</span>
                                                </Link>
                                                <button 
                                                    type="button"
                                                    onClick$={() => handleDelete(item.id)}
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

                {newsData.value.totalPages > 1 && (
                    <div class="p-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
                        <p class="text-sm text-gray-500">
                            Mostrando <span class="font-bold text-gray-700">{newsData.value.items.length}</span> de <span class="font-bold text-gray-700">{newsData.value.total}</span> noticias
                        </p>
                        <div class="flex items-center gap-1">
                            <Link 
                                href={`?page=${newsData.value.page - 1}${newsData.value.search ? `&search=${newsData.value.search}` : ''}`}
                                class={`px-3 py-1 rounded border text-sm font-medium transition-all ${
                                    newsData.value.page > 1 
                                    ? 'bg-white border-gray-300 text-gray-700 hover:border-primary hover:text-primary' 
                                    : 'bg-gray-50 border-gray-200 text-gray-300 pointer-events-none'
                                }`}
                            >
                                Anterior
                            </Link>
                            <span class="px-4 text-sm text-gray-500 font-medium">Página {newsData.value.page} de {newsData.value.totalPages}</span>
                            <Link 
                                href={`?page=${newsData.value.page + 1}${newsData.value.search ? `&search=${newsData.value.search}` : ''}`}
                                class={`px-3 py-1 rounded border text-sm font-medium transition-all ${
                                    newsData.value.page < newsData.value.totalPages 
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
