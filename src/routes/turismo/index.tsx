import { component$ } from '@builder.io/qwik';
import { routeLoader$, Link } from '@builder.io/qwik-city';
import { getDb } from '~/database/db';
import { tourismItems, siteConfig } from '~/database/schema';
import { eq, desc } from 'drizzle-orm';
import { Header } from '~/components/header/header';
import { Footer } from '~/components/footer/footer';

export const useGetTourismArticles = routeLoader$(async (event) => {
    const db = getDb(event.env);
    const articles = await db.select().from(tourismItems).where(eq(tourismItems.published, true)).orderBy(desc(tourismItems.createdAt));
    
    const configResult = await db.select().from(siteConfig).where(eq(siteConfig.id, 'main')).limit(1);
    
    const defaultConfig = {
        heroImageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuAGp_eIQGMThHTflU270DkxWI5ge5WCl9XvdgTluuNapPd_IeOXAwGaYAV39Uo8dkPY0z0vpq9BNBkdOsqI5i50JnoEI6hW5zH1_FR_lY8oyxqS5dnyZUaYhktLs-3MtAm4Iu1L1V0TtFuWmitzoMwmU8nZNkdjskeafz-EgK6_QawIlYLQI1MBDlmxMemU29__IbrupQGduXTk9y_YBsOBxK23MEGqjewye_FFiTBCTRvs0E5p5AD8CKl6CTucXzMvwCSY7mnwLJo",
        heroTitle: "Descubrí Colonia Ensayo",
        heroSubtitle: "Naturaleza, historia y eventos que hacen de nuestra comunidad un lugar único."
    };

    let config = defaultConfig;
    if (configResult.length > 0 && configResult[0].tourismConfig) {
        config = { ...defaultConfig, ...configResult[0].tourismConfig };
    }

    return { articles, config };
});

export default component$(() => {
    const data = useGetTourismArticles();
    const { articles, config } = data.value;

    return (
        <div class="flex flex-col min-h-screen font-['Public_Sans']">
            <Header />
            <main class="flex-grow pt-16">
                {/* Hero Section */}
                <section class="relative h-[400px] flex items-center justify-center overflow-hidden">
                    <img 
                        src={config.heroImageUrl} 
                        alt={config.heroTitle} 
                        class="absolute inset-0 w-full h-full object-cover brightness-50"
                    />
                    <div class="relative z-10 text-center px-4">
                        <h1 class="text-4xl md:text-6xl font-black text-white mb-4 tracking-tight uppercase">{config.heroTitle}</h1>
                        <p class="text-xl text-white/90 max-w-2xl mx-auto font-medium">{config.heroSubtitle}</p>
                    </div>
                </section>

                <div class="max-w-7xl mx-auto px-4 py-20">
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {articles.map((article) => (
                        <Link 
                            key={article.id} 
                            href={`/turismo/${article.slug}/`}
                            class="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-100 flex flex-col"
                        >
                            <div class="aspect-[4/3] overflow-hidden relative">
                                {article.imageUrls && (article.imageUrls as string[]).length > 0 ? (
                                    <img 
                                        src={(article.imageUrls as string[])[0]} 
                                        alt={article.title} 
                                        class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                                    />
                                ) : (
                                    <div class="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
                                        <span class="material-symbols-outlined text-5xl">photo_camera</span>
                                    </div>
                                )}
                                <div class="absolute top-4 left-4">
                                    <span class={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider backdrop-blur-md shadow-lg ${
                                        article.category === 'event' ? 'bg-amber-500/90 text-white' : 'bg-primary/90 text-white'
                                    }`}>
                                        {article.category === 'event' ? 'Evento' : 'Lugar'}
                                    </span>
                                </div>
                                {article.category === 'event' && article.eventDate && (
                                    <div class="absolute bottom-4 left-4 right-4 bg-white/10 backdrop-blur-md border border-white/20 p-3 rounded-2xl">
                                        <div class="flex items-center gap-2 text-white">
                                            <span class="material-symbols-outlined text-sm">calendar_today</span>
                                            <span class="text-xs font-bold uppercase tracking-widest">
                                                {new Date(article.eventDate).toLocaleDateString('es-AR', { day: 'numeric', month: 'long' })}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                            
                            <div class="p-8 flex-1 flex flex-col">
                                <h3 class="text-2xl font-black text-gray-900 mb-4 group-hover:text-primary transition-colors leading-tight">{article.title}</h3>
                                <div class="space-y-3 mb-8 flex-1">
                                    <div class="flex items-start gap-3 text-sm text-gray-500">
                                        <span class="material-symbols-outlined text-primary text-base mt-0.5">location_on</span>
                                        <span class="font-medium line-clamp-2">{article.locationName || 'Colonia Ensayo, Entre Ríos'}</span>
                                    </div>
                                    {article.category === 'place' && article.openingHours && (
                                        <div class="flex items-center gap-3 text-sm text-gray-500">
                                            <span class="material-symbols-outlined text-primary text-base">schedule</span>
                                            <span class="font-medium">{article.openingHours}</span>
                                        </div>
                                    )}
                                </div>

                                <div class="flex items-center justify-between mt-auto">
                                    <span class="text-primary font-black text-xs uppercase tracking-widest flex items-center gap-2 group-hover:gap-4 transition-all">
                                        Ver detalles <span class="material-symbols-outlined text-sm">arrow_forward</span>
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {articles.length === 0 && (
                    <div class="text-center py-40">
                        <span class="material-symbols-outlined text-7xl text-gray-200 mb-4 italic">map</span>
                        <h2 class="text-2xl font-black text-gray-300">Próximamente más aventuras</h2>
                        <p class="text-gray-400 mt-2">Estamos preparando los mejores recorridos para vos.</p>
                    </div>
                )}
            </div>
            </main>
            <Footer />
        </div>
    );
});
