import { component$ } from '@builder.io/qwik';
import { routeLoader$, Link, useLocation } from '@builder.io/qwik-city';
import { getDb } from '../../database/db';
import { news } from '../../database/schema';
import { eq, desc, count, and } from 'drizzle-orm';
import { Header } from '../../components/header/header';
import { Footer } from '../../components/footer/footer';

export const useGetPublicNews = routeLoader$(async (event) => {
    const db = getDb(event.env);
    const url = new URL(event.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = 12;
    const offset = (page - 1) * limit;

    const whereClause = eq(news.status, 'published');

    const items = await db.select()
        .from(news)
        .where(whereClause)
        .orderBy(desc(news.publishedAt))
        .limit(limit)
        .offset(offset);

    const totalResult = await db.select({ value: count() }).from(news).where(whereClause);
    const total = totalResult[0].value;

    return {
        items,
        total,
        page,
        totalPages: Math.ceil(total / limit)
    };
});

export default component$(() => {
    const newsData = useGetPublicNews();

    return (
        <div class="flex flex-col min-h-screen font-['Public_Sans']">
            <Header />
            <main class="flex-grow pt-24 pb-20 bg-surface-container-lowest">
                <div class="max-w-7xl mx-auto px-margin">
                    <div class="mb-12 text-center">
                        <span class="text-secondary font-bold uppercase tracking-widest text-xs mb-2 block">Comunidad</span>
                        <h1 class="text-h1 text-on-background mb-4">Noticias y Comunicaciones</h1>
                        <p class="text-body-lg text-on-surface-variant max-w-2xl mx-auto">
                            Mantenete informado sobre las últimas novedades, obras y eventos de Colonia Ensayo.
                        </p>
                    </div>

                    {newsData.value.items.length === 0 ? (
                        <div class="py-20 text-center">
                            <span class="material-symbols-outlined text-6xl text-gray-200 mb-4">newspaper</span>
                            <p class="text-gray-500 italic text-lg">No se encontraron noticias publicadas aún.</p>
                        </div>
                    ) : (
                        <>
                            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                                {newsData.value.items.map((item) => (
                                    <Link 
                                        key={item.id} 
                                        href={`/noticias/${item.slug}`}
                                        class="bg-white rounded-2xl overflow-hidden border border-outline-variant hover:shadow-xl transition-all group flex flex-col h-full"
                                    >
                                        <div class="h-48 overflow-hidden relative">
                                            {item.imageUrl ? (
                                                <img src={item.imageUrl} class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={item.title} />
                                            ) : (
                                                <div class="w-full h-full bg-gray-100 flex items-center justify-center text-gray-300">
                                                    <span class="material-symbols-outlined text-4xl">image</span>
                                                </div>
                                            )}
                                            <div class="absolute top-4 left-4">
                                                <span class="bg-secondary/90 backdrop-blur-sm text-on-secondary px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                                                    {item.category}
                                                </span>
                                            </div>
                                        </div>
                                        <div class="p-6 flex flex-col flex-grow">
                                            <span class="text-on-surface-variant text-[11px] mb-2 block uppercase tracking-widest font-medium">
                                                {new Date(item.publishedAt).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })}
                                            </span>
                                            <h2 class="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary transition-colors leading-tight">
                                                {item.title}
                                            </h2>
                                            <p class="text-sm text-on-surface-variant line-clamp-3 mb-4">
                                                {item.excerpt || item.content.substring(0, 100) + '...'}
                                            </p>
                                            <div class="mt-auto flex items-center gap-2 text-primary font-bold text-xs group-hover:gap-3 transition-all">
                                                Leer más <span class="material-symbols-outlined text-sm">arrow_forward</span>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>

                            {newsData.value.totalPages > 1 && (
                                <div class="mt-16 flex justify-center gap-2">
                                    <Link 
                                        href={`?page=${newsData.value.page - 1}`}
                                        class={`w-10 h-10 flex items-center justify-center rounded-full border transition-all ${
                                            newsData.value.page > 1 
                                            ? 'bg-white border-gray-200 text-gray-600 hover:border-primary hover:text-primary' 
                                            : 'bg-gray-50 border-gray-100 text-gray-300 pointer-events-none'
                                        }`}
                                    >
                                        <span class="material-symbols-outlined">chevron_left</span>
                                    </Link>
                                    
                                    {Array.from({ length: newsData.value.totalPages }).map((_, i) => (
                                        <Link 
                                            key={i}
                                            href={`?page=${i + 1}`}
                                            class={`w-10 h-10 flex items-center justify-center rounded-full border text-sm font-bold transition-all ${
                                                newsData.value.page === i + 1 
                                                ? 'bg-primary border-primary text-white shadow-md' 
                                                : 'bg-white border-gray-200 text-gray-600 hover:border-primary hover:text-primary'
                                            }`}
                                        >
                                            {i + 1}
                                        </Link>
                                    ))}

                                    <Link 
                                        href={`?page=${newsData.value.page + 1}`}
                                        class={`w-10 h-10 flex items-center justify-center rounded-full border transition-all ${
                                            newsData.value.page < newsData.value.totalPages 
                                            ? 'bg-white border-gray-200 text-gray-600 hover:border-primary hover:text-primary' 
                                            : 'bg-gray-50 border-gray-100 text-gray-300 pointer-events-none'
                                        }`}
                                    >
                                        <span class="material-symbols-outlined">chevron_right</span>
                                    </Link>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
});
