import { component$ } from '@builder.io/qwik';
import { routeLoader$, Link, type DocumentHead } from '@builder.io/qwik-city';
import { Header } from '../../../components/header/header';
import { Footer } from '../../../components/footer/footer';
import { getDb } from '../../../database/db';
import { services } from '../../../database/schema';
import { eq } from 'drizzle-orm';

export const useGetService = routeLoader$(async (event) => {
    const db = getDb(event.env);
    const result = await db.select().from(services).where(eq(services.slug, event.params.slug)).limit(1);
    if (result.length === 0) throw event.error(404, 'Servicio no encontrado');
    return result[0];
});

export default component$(() => {
    const service = useGetService();

    return (
        <>
            <Header />
            <main class="flex-grow pt-24 pb-20 px-margin max-w-4xl mx-auto w-full min-h-[60vh]">
                <Link href="/servicios/" class="inline-flex items-center gap-2 text-primary font-black uppercase tracking-widest text-sm mb-8 hover:opacity-70 transition-all">
                    <span class="material-symbols-outlined">arrow_back</span>
                    Volver a Servicios
                </Link>

                <div class="mb-12 flex flex-col md:flex-row md:items-center gap-6">
                    <div class="w-20 h-20 rounded-[2rem] bg-primary/5 flex items-center justify-center border border-outline-variant shrink-0 overflow-hidden">
                        {service.value.iconUrl?.includes('/') ? (
                            <img src={service.value.iconUrl} alt={service.value.title} class="w-full h-full object-cover" />
                        ) : (
                            <span class="material-symbols-outlined text-4xl text-primary/30">{service.value.iconUrl || 'dry_cleaning'}</span>
                        )}
                    </div>
                    <div>
                        <h1 class="text-h1 text-primary mb-2">{service.value.title}</h1>
                        <div class="h-1 w-20 bg-primary/20 rounded-full"></div>
                    </div>
                </div>
                <div class="mb-12">
                    <p class="text-xl text-on-surface leading-relaxed mb-8 font-medium">
                        {service.value.description}
                    </p>
                </div>

                <div class="grid grid-cols-1 gap-12">
                    {/* Información Detallada */}
                    <section class="bg-surface-container-lowest p-8 md:p-12 rounded-[2.5rem] border border-outline-variant">
                        <h2 class="text-h3 text-on-surface mb-6 flex items-center gap-3">
                            <span class="material-symbols-outlined text-primary">info</span>
                            Información sobre el Servicio
                        </h2>
                        <div class="prose prose-primary max-w-none text-on-surface-variant whitespace-pre-wrap leading-relaxed">
                            {service.value.content}
                        </div>
                    </section>

                    {/* Cuadro Tarifario */}
                    {service.value.tariffTable && (
                        <section class="bg-primary/5 p-8 md:p-12 rounded-[2.5rem] border border-primary/10">
                            <h2 class="text-h3 text-primary mb-6 flex items-center gap-3">
                                <span class="material-symbols-outlined">payments</span>
                                Cuadro Tarifario
                            </h2>
                            <div class="bg-white p-6 rounded-2xl border border-primary/10 shadow-sm overflow-x-auto font-mono text-sm whitespace-pre-wrap">
                                {service.value.tariffTable}
                            </div>
                            <p class="text-xs text-primary/60 mt-4 italic">
                                * Los valores pueden estar sujetos a cambios según ordenanzas vigentes.
                            </p>
                        </section>
                    )}

                    {/* Cómo Solicitar */}
                    {service.value.requestInstructions && (
                        <section class="bg-secondary/5 p-8 md:p-12 rounded-[2.5rem] border border-secondary/10">
                            <h2 class="text-h3 text-secondary mb-6 flex items-center gap-3">
                                <span class="material-symbols-outlined">help_center</span>
                                ¿Cómo solicitarlo?
                            </h2>
                            <div class="prose prose-secondary max-w-none text-on-surface-variant whitespace-pre-wrap leading-relaxed">
                                {service.value.requestInstructions}
                            </div>
                        </section>
                    )}
                </div>
            </main>
            <Footer />
        </>
    );
});

export const head: DocumentHead = ({ resolveValue }) => {
    const service = resolveValue(useGetService);
    return {
        title: `${service.title} - Colonia Ensayo`,
        meta: [
            { name: 'description', content: service.description }
        ]
    };
};
