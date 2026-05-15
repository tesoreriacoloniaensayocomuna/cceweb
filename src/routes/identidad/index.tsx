import { component$ } from '@builder.io/qwik';
import { routeLoader$ } from '@builder.io/qwik-city';
import { getDb } from '../../database/db';
import { identityMilestones } from '../../database/schema';
import { eq, asc } from 'drizzle-orm';
import { Header } from '../../components/header/header';
import { Footer } from '../../components/footer/footer';

export const useGetPublicMilestones = routeLoader$(async (event) => {
    const db = getDb(event.env);
    const items = await db.select()
        .from(identityMilestones)
        .where(eq(identityMilestones.published, true))
        .orderBy(asc(identityMilestones.sortOrder));
    return items;
});

export default component$(() => {
    const milestones = useGetPublicMilestones();

    return (
        <div class="flex flex-col min-h-screen font-['Public_Sans']">
            <Header />
            <main class="flex-grow pt-32 pb-20 bg-white">
                
                {/* Banner de "En Desarrollo" */}
                <div class="max-w-4xl mx-auto px-margin mb-12">
                    <div class="bg-amber-50 border-2 border-dashed border-amber-200 rounded-2xl p-6 flex flex-col md:flex-row items-center gap-4 text-amber-800">
                        <div class="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center shrink-0">
                            <span class="material-symbols-outlined text-amber-600">construction</span>
                        </div>
                        <div class="text-center md:text-left">
                            <h3 class="font-bold text-lg">Sección en construcción</h3>
                            <p class="text-sm opacity-90">Estamos reconstruyendo la historia de nuestra comunidad. Si tienes fotos antiguas o relatos que quieras compartir, por favor contáctanos.</p>
                        </div>
                    </div>
                </div>

                <div class="max-w-5xl mx-auto px-margin">
                    <div class="text-center mb-16">
                        <span class="text-primary font-bold uppercase tracking-[0.2em] text-xs mb-3 block">Nuestras Raíces</span>
                        <h1 class="text-5xl md:text-6xl font-black text-gray-900 mb-6 tracking-tight">Identidad</h1>
                        <p class="text-body-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
                            Colonia Ensayo es más que un lugar en el mapa; es el resultado de décadas de esfuerzo, sueños y comunidad. Conocé los momentos que marcaron nuestro camino.
                        </p>
                    </div>

                    {milestones.value.length === 0 ? (
                        <div class="py-20 text-center border-t border-gray-100">
                            <p class="text-gray-400 italic">Próximamente estaremos publicando los hitos históricos aquí.</p>
                        </div>
                    ) : (
                        <div class="relative py-10">
                            {/* Línea central (Time line) */}
                            <div class="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-gray-100 -translate-x-1/2 hidden md:block"></div>
                            
                            <div class="space-y-16">
                                {milestones.value.map((m, i) => (
                                    <div key={m.id} class={`flex flex-col md:flex-row items-center gap-8 md:gap-0 ${i % 2 === 0 ? '' : 'md:flex-row-reverse'}`}>
                                        
                                        {/* Contenido */}
                                        <div class="w-full md:w-[45%]">
                                            <div class={`bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative ${i % 2 === 0 ? 'md:text-right' : 'md:text-left'}`}>
                                                <div class={`inline-block px-4 py-1 rounded-full bg-primary/10 text-primary font-black text-sm mb-4`}>
                                                    {m.year}
                                                </div>
                                                <h2 class="text-2xl font-bold text-gray-900 mb-4">{m.title}</h2>
                                                <div class="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
                                                    {m.content}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Punto central */}
                                        <div class="hidden md:flex w-[10%] items-center justify-center z-10">
                                            <div class="w-4 h-4 rounded-full bg-primary border-4 border-white shadow-sm outline outline-1 outline-gray-200"></div>
                                        </div>

                                        {/* Imagen */}
                                        <div class="w-full md:w-[45%]">
                                            {m.imageUrl ? (
                                                <div class="aspect-video rounded-3xl overflow-hidden shadow-lg border border-gray-100 group">
                                                    <img src={m.imageUrl} class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={m.title} />
                                                </div>
                                            ) : (
                                                <div class="aspect-video rounded-3xl bg-gray-50 border border-dashed border-gray-200 flex items-center justify-center text-gray-300">
                                                    <span class="material-symbols-outlined text-4xl">image</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
});
