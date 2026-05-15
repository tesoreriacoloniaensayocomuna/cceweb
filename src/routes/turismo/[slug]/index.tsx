import { component$, useSignal, $ } from '@builder.io/qwik';
import { routeLoader$ } from '@builder.io/qwik-city';
import { getDb } from '~/database/db';
import { tourismItems } from '~/database/schema';
import { eq } from 'drizzle-orm';
import { Header } from '~/components/header/header';
import { Footer } from '~/components/footer/footer';

export const useGetTourismDetail = routeLoader$(async (event) => {
    const db = getDb(event.env);
    const result = await db.select().from(tourismItems).where(eq(tourismItems.slug, event.params.slug)).limit(1);
    
    if (result.length === 0) {
        throw event.error(404, 'Artículo no encontrado');
    }
    
    return result[0];
});

export default component$(() => {
    const item = useGetTourismDetail();
    const selectedImage = useSignal<string | null>(null);

    const images = (item.value.imageUrls as string[]) || [];

    const openLightbox = $((url: string) => {
        selectedImage.value = url;
    });

    return (
        <div class="flex flex-col min-h-screen font-['Public_Sans']">
            <Header />
            <main class="flex-grow pt-16">
                {/* Header / Hero */}
                <header class="relative h-[60vh] min-h-[400px] overflow-hidden">
                {item.value.videoUrl ? (
                    <div class="absolute inset-0 w-full h-full">
                        {/* Simplificación: Si es YouTube, intentamos mostrar embed, si no la imagen */}
                        <iframe 
                            src={item.value.videoUrl.replace('watch?v=', 'embed/')} 
                            class="w-full h-full pointer-events-none brightness-50"
                            style={{ border: 0 }}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        ></iframe>
                    </div>
                ) : (
                    <img 
                        src={images[0] || 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&q=80'} 
                        alt={item.value.title} 
                        class="absolute inset-0 w-full h-full object-cover brightness-50"
                    />
                )}
                
                <div class="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent"></div>
                
                <div class="absolute bottom-0 left-0 right-0 max-w-7xl mx-auto px-4 pb-12">
                    <div class="flex items-center gap-3 mb-4">
                        <span class={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-lg ${
                            item.value.category === 'event' ? 'bg-amber-500 text-white' : 'bg-primary text-white'
                        }`}>
                            {item.value.category === 'event' ? 'Evento' : 'Lugar'}
                        </span>
                    </div>
                    <h1 class="text-4xl md:text-7xl font-black text-gray-900 leading-tight mb-4">{item.value.title}</h1>
                    <p class="text-lg text-gray-600 font-medium flex items-center gap-2">
                        <span class="material-symbols-outlined text-primary">location_on</span>
                        {item.value.locationName || 'Colonia Ensayo, Entre Ríos'}
                    </p>
                </div>
            </header>

            <div class="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-3 gap-12 mt-12">
                {/* Content */}
                <div class="lg:col-span-2 space-y-12">
                    <div class="prose prose-lg max-w-none text-gray-700 leading-relaxed">
                        {item.value.content.split('\n').map((para, i) => (
                            <p key={i}>{para}</p>
                        ))}
                    </div>

                    {/* Galería */}
                    {images.length > 1 && (
                        <div class="space-y-6">
                            <h2 class="text-3xl font-black text-gray-900 flex items-center gap-3">
                                <span class="material-symbols-outlined text-primary text-4xl">photo_library</span>
                                Galería de fotos
                            </h2>
                            <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {images.map((url, i) => (
                                    <div key={i} onClick$={() => openLightbox(url)} class="aspect-square rounded-3xl overflow-hidden cursor-pointer group relative">
                                        <img src={url} class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                        <div class="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <span class="material-symbols-outlined text-white text-3xl">zoom_in</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar Info */}
                <aside class="space-y-8">
                    {/* Ficha Técnica */}
                    <div class="bg-gray-50 rounded-3xl p-8 border border-gray-100 space-y-8 shadow-sm">
                        <h3 class="text-xl font-black text-gray-900 uppercase tracking-widest border-b border-gray-200 pb-4">Información Clave</h3>
                        
                        {item.value.category === 'event' && item.value.eventDate && (
                            <div class="space-y-2">
                                <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Cuándo</p>
                                <p class="text-lg font-bold text-gray-800 flex items-center gap-2">
                                    <span class="material-symbols-outlined text-amber-500">calendar_month</span>
                                    {new Date(item.value.eventDate).toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                                </p>
                            </div>
                        )}

                        {item.value.category === 'place' && item.value.openingHours && (
                            <div class="space-y-2">
                                <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Horarios</p>
                                <p class="text-lg font-bold text-gray-800 flex items-center gap-2">
                                    <span class="material-symbols-outlined text-primary">schedule</span>
                                    {item.value.openingHours}
                                </p>
                            </div>
                        )}

                        {item.value.entryFee && (
                            <div class="space-y-2">
                                <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Entrada</p>
                                <p class="text-lg font-bold text-gray-800 flex items-center gap-2">
                                    <span class="material-symbols-outlined text-green-500">payments</span>
                                    {item.value.entryFee}
                                </p>
                            </div>
                        )}

                        {item.value.highlights && (
                            <div class="space-y-2">
                                <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                    {item.value.category === 'event' ? 'Artistas / Cronograma' : 'Servicios / Atractivos'}
                                </p>
                                <div class="bg-white p-4 rounded-2xl border border-gray-100 text-sm font-medium text-gray-700 leading-relaxed italic">
                                    {item.value.highlights}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Mapa */}
                    {item.value.mapUrl && (
                        <div class="space-y-4">
                            <h3 class="text-xl font-black text-gray-900 flex items-center gap-2">
                                <span class="material-symbols-outlined text-primary">map</span>
                                Cómo llegar
                            </h3>
                            <div class="rounded-3xl overflow-hidden border border-gray-200 aspect-square shadow-sm">
                                <iframe 
                                    src={item.value.mapUrl} 
                                    class="w-full h-full"
                                    style={{ border: 0 }}
                                    allowFullscreen
                                    loading="lazy"
                                ></iframe>
                            </div>
                        </div>
                    )}
                </aside>
            </div>

            {/* Lightbox */}
            {selectedImage.value && (
                <div 
                    class="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4"
                    onClick$={() => selectedImage.value = null}
                >
                    <button class="absolute top-8 right-8 text-white p-4">
                        <span class="material-symbols-outlined text-4xl">close</span>
                    </button>
                    <img 
                        src={selectedImage.value} 
                        alt="Zoom" 
                        class="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl transition-transform duration-500" 
                        onClick$={(e) => e.stopPropagation()}
                    />
                </div>
            )}
            </main>
            <Footer />
        </div>
    );
});
