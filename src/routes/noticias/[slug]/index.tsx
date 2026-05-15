import { component$, useSignal, $, useVisibleTask$ } from '@builder.io/qwik';
import { routeLoader$, Link } from '@builder.io/qwik-city';
import { getDb } from '../../../database/db';
import { news } from '../../../database/schema';
import { eq, and } from 'drizzle-orm';
import { Header } from '../../../components/header/header';
import { Footer } from '../../../components/footer/footer';

export const useGetNewsBySlug = routeLoader$(async (event) => {
    const db = getDb(event.env);
    const result = await db.select()
        .from(news)
        .where(and(
            eq(news.slug, event.params.slug),
            eq(news.status, 'published')
        ));
    
    if (result.length === 0) {
        throw event.error(404, 'Noticia no encontrada');
    }
    const item = result[0];
    return {
        ...item,
        additionalImages: item.additionalImages ?? []
    };
});

export default component$(() => {
    const item = useGetNewsBySlug();
    const selectedImageIndex = useSignal<number>(-1);
    
    // Combinar portada y adicionales para la navegación del lightbox
    const allImages = [
        ...(item.value.imageUrl ? [item.value.imageUrl] : []),
        ...item.value.additionalImages
    ];

    const dateStr = new Date(item.value.publishedAt).toLocaleDateString('es-AR', { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
    });

    const nextImage = $(() => {
        if (selectedImageIndex.value < allImages.length - 1) {
            selectedImageIndex.value++;
        } else {
            selectedImageIndex.value = 0;
        }
    });

    const prevImage = $(() => {
        if (selectedImageIndex.value > 0) {
            selectedImageIndex.value--;
        } else {
            selectedImageIndex.value = allImages.length - 1;
        }
    });

    const closeLightbox = $(() => {
        selectedImageIndex.value = -1;
    });

    useVisibleTask$(({ cleanup }) => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (selectedImageIndex.value === -1) return;
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowRight') nextImage();
            if (e.key === 'ArrowLeft') prevImage();
        };
        window.addEventListener('keydown', handleKeyDown);
        cleanup(() => window.removeEventListener('keydown', handleKeyDown));
    });

    return (
        <div class="flex flex-col min-h-screen font-['Public_Sans']">
            <Header />
            <main class="flex-grow pt-24 pb-20 bg-white">
                <article class="max-w-4xl mx-auto px-margin">
                    <div class="mb-8">
                        <Link href="/noticias/" class="text-primary font-bold text-sm flex items-center gap-1 hover:underline mb-6">
                            <span class="material-symbols-outlined text-sm">arrow_back</span>
                            Volver a Noticias
                        </Link>
                        
                        <div class="flex items-center gap-3 mb-4">
                            <span class="bg-secondary text-on-secondary px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
                                {item.value.category}
                            </span>
                            <span class="text-gray-400 text-xs uppercase tracking-widest font-medium">
                                {dateStr}
                            </span>
                        </div>
                        
                        <h1 class="text-h1 text-on-background leading-tight mb-6">
                            {item.value.title}
                        </h1>
                    </div>

                    {item.value.imageUrl && (
                        <div 
                            class="aspect-video w-full rounded-2xl overflow-hidden mb-12 shadow-xl border border-gray-100 cursor-pointer group relative"
                            onClick$={() => selectedImageIndex.value = 0}
                        >
                            <img src={item.value.imageUrl} class="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500" alt={item.value.title} />
                            <div class="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <div class="bg-white/90 p-3 rounded-full shadow-lg">
                                    <span class="material-symbols-outlined text-primary">zoom_in</span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div class="flex flex-col lg:flex-row gap-12">
                        <div class="lg:w-3/4">
                            <div 
                                class="prose prose-lg max-w-none text-gray-800 leading-relaxed space-y-6"
                                dangerouslySetInnerHTML={item.value.content.replace(/\n/g, '<br/>')}
                            ></div>
                        </div>
                        
                        <aside class="lg:w-1/4 space-y-8">
                            {item.value.additionalImages && item.value.additionalImages.length > 0 && (
                                <div class="space-y-4">
                                    <h3 class="font-bold text-gray-900 uppercase tracking-widest text-xs border-b pb-2">Galería de fotos</h3>
                                    <div class="grid grid-cols-2 gap-3">
                                        {item.value.additionalImages.map((src, i) => (
                                            <div 
                                                key={i} 
                                                class="aspect-square rounded-lg overflow-hidden border border-gray-100 shadow-sm cursor-pointer hover:opacity-90 transition-opacity group relative"
                                                onClick$={() => selectedImageIndex.value = i + (item.value.imageUrl ? 1 : 0)}
                                            >
                                                <img src={src} class="w-full h-full object-cover" alt={`Galería ${i + 1}`} />
                                                <div class="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                                                    <span class="material-symbols-outlined text-sm">fullscreen</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div class="p-6 bg-surface-container rounded-2xl border border-outline-variant">
                                <h3 class="font-bold text-gray-900 mb-4 uppercase tracking-widest text-xs">Compartir</h3>
                                <div class="flex gap-4">
                                    <button 
                                        onClick$={$(async () => {
                                            if (navigator.share) {
                                                try {
                                                    await navigator.share({
                                                        title: item.value.title,
                                                        text: item.value.excerpt || '',
                                                        url: window.location.href,
                                                    });
                                                } catch (err) {
                                                    console.error('Error sharing:', err);
                                                }
                                            } else {
                                                await navigator.clipboard.writeText(window.location.href);
                                                alert('Enlace copiado al portapapeles');
                                            }
                                        })}
                                        class="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-primary hover:text-white hover:border-primary transition-all"
                                        title="Compartir"
                                    >
                                        <span class="material-symbols-outlined text-lg">share</span>
                                    </button>
                                    <button 
                                        onClick$={$(() => window.print())}
                                        class="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-primary hover:text-white hover:border-primary transition-all"
                                        title="Imprimir"
                                    >
                                        <span class="material-symbols-outlined text-lg">print</span>
                                    </button>
                                </div>
                            </div>
                        </aside>
                    </div>
                </article>
            </main>

            {/* Lightbox Modal */}
            {selectedImageIndex.value >= 0 && (
                <div class="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm transition-all animate-in fade-in duration-300">
                    {/* Overlay Click Area to Close */}
                    <div class="absolute inset-0" onClick$={closeLightbox}></div>

                    {/* Image Container */}
                    <div class="relative w-full max-w-5xl max-h-[90vh] px-4 flex items-center justify-center group/lightbox">
                        <img 
                            src={allImages[selectedImageIndex.value]} 
                            class="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl select-none"
                            alt="Vista ampliada"
                        />

                        {/* Navigation Buttons */}
                        {allImages.length > 1 && (
                            <>
                                <button 
                                    onClick$={(e) => { e.stopPropagation(); prevImage(); }}
                                    class="absolute left-6 lg:-left-16 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all backdrop-blur-md group-hover/lightbox:translate-x-2 lg:group-hover/lightbox:translate-x-0"
                                >
                                    <span class="material-symbols-outlined text-3xl">chevron_left</span>
                                </button>
                                <button 
                                    onClick$={(e) => { e.stopPropagation(); nextImage(); }}
                                    class="absolute right-6 lg:-right-16 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all backdrop-blur-md group-hover/lightbox:-translate-x-2 lg:group-hover/lightbox:-translate-x-0"
                                >
                                    <span class="material-symbols-outlined text-3xl">chevron_right</span>
                                </button>
                            </>
                        )}

                        {/* Info & Close */}
                        <div class="absolute -top-12 left-0 right-0 flex items-center justify-between text-white px-2">
                            <span class="text-xs font-bold uppercase tracking-widest bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm">
                                Foto {selectedImageIndex.value + 1} de {allImages.length}
                            </span>
                            <button 
                                onClick$={closeLightbox}
                                class="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-red-500 transition-colors backdrop-blur-sm"
                            >
                                <span class="material-symbols-outlined">close</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
});
