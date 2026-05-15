import { component$ } from '@builder.io/qwik';
import { routeLoader$, Link, useLocation } from '@builder.io/qwik-city';
import { getDb } from '../../database/db';
import { regulations } from '../../database/schema';
import { desc, sql } from 'drizzle-orm';
import { Header } from '../../components/header/header';
import { Footer } from '../../components/footer/footer';

export const useGetPublicRegulations = routeLoader$(async (event) => {
    const db = getDb(event.env);
    const url = new URL(event.url);
    const yearParam = url.searchParams.get('year');
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = 10;
    const offset = (page - 1) * limit;

    // Fetch all published regulations for the year filter list (un-paginated)
    const allItems = await db.select().from(regulations).orderBy(desc(regulations.sanctionDate));
    
    // Extract unique years in memory to avoid SQLite dialect issues in Edge
    const years = [...new Set(allItems.map(reg => {
        const date = new Date(reg.sanctionDate);
        return isNaN(date.getTime()) ? null : date.getFullYear().toString();
    }))].filter((y): y is string => y !== null).sort((a, b) => b.localeCompare(a));

    // Filter by year if parameter exists
    const filteredAllItems = yearParam 
        ? allItems.filter(item => new Date(item.sanctionDate).getFullYear().toString() === yearParam)
        : allItems;

    // Apply pagination
    const paginatedItems = filteredAllItems.slice(offset, offset + limit);
    const total = filteredAllItems.length;

    return {
        items: paginatedItems,
        years,
        selectedYear: yearParam,
        page,
        totalPages: Math.ceil(total / limit),
        total
    };
});



export default component$(( ) => {
    const regsData = useGetPublicRegulations();
    const loc = useLocation();

    const fixCloudinaryUrl = (url: string) => {
        // fl_attachment only works on image/video transformations. 
        // Applying it to /raw/upload/ will cause a 404/Error in Cloudinary.
        if (url.includes('cloudinary.com') && url.includes('/image/upload/') && !url.includes('fl_attachment')) {
            return url.replace('/upload/', '/upload/fl_attachment/');
        }
        return url;
    };


    return (
        <div class="flex flex-col min-h-screen font-['Public_Sans'] bg-surface-container-lowest">
            <Header />
            <main class="flex-grow pt-32 pb-20">
                <div class="max-w-7xl mx-auto px-margin">
                    <div class="mb-12 text-center">
                        <span class="text-secondary font-bold uppercase tracking-widest text-xs mb-2 block">Transparencia</span>
                        <h1 class="text-h1 text-on-background mb-4">Boletín Oficial</h1>
                        <p class="text-body-lg text-on-surface-variant max-w-2xl mx-auto">
                            Consulta las ordenanzas, decretos y normativas vigentes en la Comuna de Colonia Ensayo.
                        </p>
                    </div>

                    <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        <aside class="lg:col-span-1 space-y-6">
                            <div class="bg-white p-6 rounded-2xl border border-outline-variant shadow-sm">
                                <h3 class="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wider">Filtrar por año</h3>
                                <div class="flex flex-col gap-2">
                                    <Link 
                                        href="/normativas/"
                                        class={`w-full text-left px-4 py-2.5 rounded-xl text-sm transition-all ${
                                            !regsData.value.selectedYear 
                                            ? 'bg-primary text-white font-bold shadow-md' 
                                            : 'text-gray-600 hover:bg-gray-100'
                                        }`}
                                    >
                                        Todas las fechas
                                    </Link>
                                    {regsData.value.years.map(year => (
                                        <Link 
                                            key={year}
                                            href={`?year=${year}`}
                                            class={`w-full text-left px-4 py-2.5 rounded-xl text-sm transition-all ${
                                                regsData.value.selectedYear === year 
                                                ? 'bg-primary text-white font-bold shadow-md' 
                                                : 'text-gray-600 hover:bg-gray-100'
                                            }`}
                                        >
                                            Año {year}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </aside>

                        <div class="lg:col-span-3 space-y-4">
                            {regsData.value.items.length === 0 ? (
                                <div class="py-20 text-center bg-white rounded-2xl border border-dashed border-gray-300">
                                    <span class="material-symbols-outlined text-5xl text-gray-200 mb-2">gavel</span>
                                    <p class="text-gray-500 italic">No se encontraron normativas para el criterio seleccionado.</p>
                                </div>
                            ) : (
                                regsData.value.items.map((reg) => (
                                    <div key={reg.id} class="bg-white p-6 rounded-2xl border border-outline-variant shadow-sm hover:shadow-md transition-shadow">
                                        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                            <div class="flex-grow">
                                                <div class="flex items-center gap-2 mb-2">
                                                    <span class="bg-primary-container text-on-primary-container px-2 py-0.5 rounded text-[10px] font-bold font-mono">
                                                        {reg.regulationNumber}
                                                    </span>
                                                    <span class="text-xs text-on-surface-variant">
                                                        Sancionada el {new Date(reg.sanctionDate).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })}
                                                    </span>
                                                </div>
                                                <h2 class="text-xl font-bold text-gray-900 mb-2 leading-tight">{reg.title}</h2>
                                                <p class="text-sm text-on-surface-variant line-clamp-2 leading-relaxed">
                                                    {reg.content}
                                                </p>
                                            </div>
                                            <div class="flex items-center gap-2 shrink-0">
                                                {reg.pdfUrl && (
                                                    <a 
                                                        href={fixCloudinaryUrl(reg.pdfUrl)} 
                                                        class="bg-error/10 text-error px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-error/20 transition-colors"
                                                    >
                                                        <span class="material-symbols-outlined text-sm">picture_as_pdf</span>
                                                        DESCARGAR PDF
                                                    </a>
                                                )}

                                                <Link 
                                                    href={`/normativas/${reg.id}/`}
                                                    class="bg-surface-container px-4 py-2 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-200 transition-colors"
                                                >
                                                    VER TEXTO
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}

                            {regsData.value.totalPages > 1 && (
                                <div class="mt-12 flex items-center justify-center gap-2">
                                    <Link 
                                        href={`?page=${regsData.value.page - 1}${regsData.value.selectedYear ? `&year=${regsData.value.selectedYear}` : ''}`}
                                        class={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${
                                            regsData.value.page > 1 
                                            ? 'bg-white border-outline hover:border-primary hover:text-primary shadow-sm' 
                                            : 'bg-gray-50 border-gray-200 text-gray-300 pointer-events-none'
                                        }`}
                                    >
                                        <span class="material-symbols-outlined">chevron_left</span>
                                    </Link>
                                    
                                    <div class="flex items-center gap-1">
                                        {Array.from({ length: regsData.value.totalPages }).map((_, i) => (
                                            <Link 
                                                key={i}
                                                href={`?page=${i + 1}${regsData.value.selectedYear ? `&year=${regsData.value.selectedYear}` : ''}`}
                                                class={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-all ${
                                                    regsData.value.page === i + 1
                                                    ? 'bg-primary text-white shadow-md'
                                                    : 'bg-white border border-outline hover:border-primary hover:text-primary shadow-sm'
                                                }`}
                                            >
                                                {i + 1}
                                            </Link>
                                        ))}
                                    </div>

                                    <Link 
                                        href={`?page=${regsData.value.page + 1}${regsData.value.selectedYear ? `&year=${regsData.value.selectedYear}` : ''}`}
                                        class={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${
                                            regsData.value.page < regsData.value.totalPages 
                                            ? 'bg-white border-outline hover:border-primary hover:text-primary shadow-sm' 
                                            : 'bg-gray-50 border-gray-200 text-gray-300 pointer-events-none'
                                        }`}
                                    >
                                        <span class="material-symbols-outlined">chevron_right</span>
                                    </Link>
                                </div>
                            )}
                        </div>

                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
});

