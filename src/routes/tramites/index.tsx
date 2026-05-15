import { component$ } from '@builder.io/qwik';
import { routeLoader$, Link, type DocumentHead } from '@builder.io/qwik-city';
import { Header } from '../../components/header/header';
import { Footer } from '../../components/footer/footer';
import { getDb } from '../../database/db';
import { procedures } from '../../database/schema';
import { desc } from 'drizzle-orm';

export const useGetProcedures = routeLoader$(async (event) => {
    const db = getDb(event.env);
    return await db.select().from(procedures).orderBy(desc(procedures.createdAt));
});

export default component$(() => {
    const proceduresData = useGetProcedures();

    return (
        <>
            <Header />
            <main class="flex-grow pt-24 pb-20 px-margin max-w-7xl mx-auto w-full min-h-[60vh]">
                <div class="mb-12">
                    <h1 class="text-h1 text-primary mb-4">Guía de Trámites</h1>
                    <p class="text-body-lg text-on-surface-variant max-w-2xl">
                        Encontrá toda la información necesaria para realizar tus trámites municipales: requisitos, documentación y formularios de descarga.
                    </p>
                </div>

                {proceduresData.value.length === 0 ? (
                    <div class="bg-surface-container-lowest p-12 rounded-3xl border border-outline-variant text-center">
                        <span class="material-symbols-outlined text-6xl text-outline mb-4">description</span>
                        <h3 class="text-h3 text-on-surface mb-2">No hay trámites registrados</h3>
                        <p class="text-on-surface-variant">Próximamente se publicará la guía completa de trámites.</p>
                    </div>
                ) : (
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {proceduresData.value.map(proc => (
                            <Link 
                                key={proc.id} 
                                href={`/tramites/${proc.slug}/`}
                                class="bg-white p-6 rounded-[1.5rem] border border-outline-variant shadow-sm hover:shadow-lg hover:border-primary/30 transition-all group flex items-start gap-6"
                            >
                                <div class="w-14 h-14 rounded-xl bg-secondary/5 flex items-center justify-center group-hover:bg-secondary group-hover:text-white transition-all shrink-0">
                                    <span class="material-symbols-outlined text-3xl">description</span>
                                </div>
                                <div class="flex-1">
                                    <h3 class="text-xl font-black text-on-surface mb-2 group-hover:text-secondary transition-colors">{proc.title}</h3>
                                    <p class="text-on-surface-variant line-clamp-2 text-sm leading-relaxed mb-4">
                                        {proc.description}
                                    </p>
                                    <div class="flex items-center gap-2 text-secondary font-black uppercase tracking-widest text-[10px]">
                                        Ver requisitos
                                        <span class="material-symbols-outlined text-sm transition-transform group-hover:translate-x-1">arrow_forward</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </main>
            <Footer />
        </>
    );
});

export const head: DocumentHead = { title: "Trámites - Colonia Ensayo" };
