import { component$, $ } from '@builder.io/qwik';
import { routeLoader$, Link } from '@builder.io/qwik-city';
import { getDb } from '../../../database/db';
import { regulations } from '../../../database/schema';
import { eq } from 'drizzle-orm';
import { Header } from '../../../components/header/header';
import { Footer } from '../../../components/footer/footer';

export const useGetPublicRegulation = routeLoader$(async (event) => {
    const db = getDb(event.env);
    const id = event.params.id;
    const result = await db.select().from(regulations).where(eq(regulations.id, id));
    
    if (result.length === 0) {
        throw event.error(404, 'Normativa no encontrada');
    }
    return result[0];
});

export default component$(() => {
    const reg = useGetPublicRegulation();
    
    const fixCloudinaryUrl = (url: string) => {
        // fl_attachment only works on image/video transformations. 
        // Applying it to /raw/upload/ will cause a 404/Error in Cloudinary.
        if (url.includes('cloudinary.com') && url.includes('/image/upload/') && !url.includes('fl_attachment')) {
            return url.replace('/upload/', '/upload/fl_attachment/');
        }
        return url;
    };


    const dateStr = new Date(reg.value.sanctionDate).toLocaleDateString('es-AR', { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
    });

    return (
        <div class="flex flex-col min-h-screen font-['Public_Sans'] bg-white">
            <Header />
            <main class="flex-grow pt-32 pb-20">
                <article class="max-w-4xl mx-auto px-margin">
                    <div class="mb-8">
                        <Link href="/normativas/" class="text-primary font-bold text-sm flex items-center gap-1 hover:underline mb-6">
                            <span class="material-symbols-outlined text-sm">arrow_back</span>
                            Volver al Boletín Oficial
                        </Link>
                        
                        <div class="flex items-center gap-3 mb-4">
                            <span class="bg-primary-container text-on-primary-container px-3 py-1 rounded-full text-[10px] font-bold font-mono tracking-widest">
                                {reg.value.regulationNumber}
                            </span>
                            <span class="text-gray-400 text-xs uppercase tracking-widest font-medium">
                                Sancionada el {dateStr}
                            </span>
                        </div>
                        
                        <h1 class="text-h1 text-on-background leading-tight mb-6">
                            {reg.value.title}
                        </h1>
                    </div>

                    <div class="grid grid-cols-1 lg:grid-cols-12 gap-12">
                        <div class="lg:col-span-8">
                            <div 
                                class="prose prose-lg max-w-none text-gray-800 leading-relaxed space-y-6"
                                dangerouslySetInnerHTML={reg.value.content.replace(/\n/g, '<br/>')}
                            ></div>
                        </div>
                        
                        <aside class="lg:col-span-4 space-y-6">
                            {reg.value.pdfUrl && (
                                <div class="bg-surface-container p-6 rounded-2xl border border-outline-variant shadow-sm">
                                    <h3 class="font-bold text-gray-900 mb-4 uppercase tracking-widest text-xs border-b pb-2 flex items-center gap-2">
                                        <span class="material-symbols-outlined text-sm">picture_as_pdf</span>
                                        Documento Oficial
                                    </h3>
                                    <p class="text-xs text-on-surface-variant mb-6 leading-relaxed">
                                        Puedes descargar la versión original firmada de esta normativa en formato PDF.
                                    </p>
                                    <a 
                                        href={fixCloudinaryUrl(reg.value.pdfUrl)} 
                                        class="w-full bg-error text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-error/90 transition-all shadow-md"
                                    >

                                        <span class="material-symbols-outlined">download</span>
                                        Descargar PDF
                                    </a>
                                </div>
                            )}

                            <div class="p-6 bg-surface-container rounded-2xl border border-outline-variant">
                                <h3 class="font-bold text-gray-900 mb-4 uppercase tracking-widest text-xs border-b pb-2">Compartir</h3>
                                <div class="flex gap-4">
                                    <button 
                                        onClick$={$(async () => {
                                            if (navigator.share) {
                                                try {
                                                    await navigator.share({
                                                        title: reg.value.title,
                                                        text: `Normativa ${reg.value.regulationNumber}`,
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
                                    <button class="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-primary hover:text-white hover:border-primary transition-all" onClick$={$(() => window.print())} title="Imprimir">
                                        <span class="material-symbols-outlined text-lg">print</span>
                                    </button>
                                </div>
                            </div>
                        </aside>
                    </div>
                </article>
            </main>
            <Footer />
        </div>
    );
});
