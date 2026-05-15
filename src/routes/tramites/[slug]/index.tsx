import { component$ } from '@builder.io/qwik';
import { routeLoader$, Link, type DocumentHead } from '@builder.io/qwik-city';
import { Header } from '../../../components/header/header';
import { Footer } from '../../../components/footer/footer';
import { getDb } from '../../../database/db';
import { procedures, services } from '../../../database/schema';
import { eq } from 'drizzle-orm';

export const useGetProcedure = routeLoader$(async (event) => {
    const db = getDb(event.env);
    const result = await db.select().from(procedures).where(eq(procedures.slug, event.params.slug)).limit(1);
    if (result.length === 0) throw event.error(404, 'Trámite no encontrado');
    
    let service = null;
    if (result[0].serviceId) {
        const sResult = await db.select().from(services).where(eq(services.id, result[0].serviceId)).limit(1);
        if (sResult.length > 0) service = sResult[0];
    }

    return { procedure: result[0], service };
});

export default component$(() => {
    const data = useGetProcedure();
    const proc = data.value.procedure;
    const service = data.value.service;

    return (
        <>
            <Header />
            <main class="flex-grow pt-24 pb-20 px-margin max-w-4xl mx-auto w-full min-h-[60vh]">
                <Link href="/tramites/" class="inline-flex items-center gap-2 text-secondary font-black uppercase tracking-widest text-sm mb-8 hover:opacity-70 transition-all">
                    <span class="material-symbols-outlined">arrow_back</span>
                    Volver a Trámites
                </Link>

                <div class="mb-12">
                    <div class="flex items-center gap-2 text-secondary font-black uppercase tracking-widest text-xs mb-4">
                        <span class="material-symbols-outlined text-sm">info</span>
                        Guía de Trámites
                    </div>
                    <h1 class="text-h1 text-primary mb-6">{proc.title}</h1>
                    <p class="text-xl text-on-surface leading-relaxed font-medium">
                        {proc.description}
                    </p>
                </div>

                <div class="grid grid-cols-1 gap-8">
                    {/* Requisitos y Pasos */}
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div class="md:col-span-2 space-y-8">
                            <section class="bg-white p-8 rounded-[2rem] border border-outline-variant shadow-sm">
                                <h2 class="text-xl font-black text-on-surface mb-6 flex items-center gap-3">
                                    <span class="material-symbols-outlined text-secondary">checklist</span>
                                    ¿Cómo se realiza?
                                </h2>
                                <div class="prose prose-secondary max-w-none text-on-surface-variant whitespace-pre-wrap leading-relaxed">
                                    {proc.howToPerform}
                                </div>
                            </section>

                            {proc.documentation && (
                                <section class="bg-white p-8 rounded-[2rem] border border-outline-variant shadow-sm">
                                    <h2 class="text-xl font-black text-on-surface mb-6 flex items-center gap-3">
                                        <span class="material-symbols-outlined text-secondary">folder_shared</span>
                                        Documentación a presentar
                                    </h2>
                                    <div class="prose prose-secondary max-w-none text-on-surface-variant whitespace-pre-wrap leading-relaxed">
                                        {proc.documentation}
                                    </div>
                                </section>
                            )}
                        </div>

                        <div class="space-y-8">
                            {/* Materiales */}
                            {proc.materials && (
                                <section class="bg-surface-container-low p-6 rounded-[2rem] border border-outline-variant">
                                    <h2 class="text-lg font-black text-on-surface mb-4 flex items-center gap-2">
                                        <span class="material-symbols-outlined text-secondary">handyman</span>
                                        Materiales
                                    </h2>
                                    <div class="text-sm text-on-surface-variant whitespace-pre-wrap leading-relaxed">
                                        {proc.materials}
                                    </div>
                                </section>
                            )}

                            {/* Descarga */}
                            {proc.attachmentUrl && (
                                <a 
                                    href={proc.attachmentUrl} 
                                    target="_blank"
                                    class="flex flex-col items-center justify-center p-8 bg-primary text-on-primary rounded-[2rem] shadow-lg shadow-primary/20 hover:opacity-90 transition-all text-center gap-4"
                                >
                                    <span class="material-symbols-outlined text-5xl">picture_as_pdf</span>
                                    <div>
                                        <p class="font-black uppercase tracking-widest text-xs">Descargar Formulario</p>
                                        <p class="text-[10px] opacity-70">Archivo PDF para completar</p>
                                    </div>
                                </a>
                            )}

                            {/* Servicio Relacionado */}
                            {service && (
                                <section class="bg-secondary/5 p-6 rounded-[2rem] border border-secondary/10">
                                    <h2 class="text-lg font-black text-secondary mb-4 flex items-center gap-2">
                                        <span class="material-symbols-outlined">link</span>
                                        Servicio Relacionado
                                    </h2>
                                    <p class="text-sm text-on-surface-variant mb-4">{service.title}</p>
                                    <Link 
                                        href={`/servicios/${service.slug}/`}
                                        class="text-xs font-black text-secondary uppercase tracking-widest hover:underline"
                                    >
                                        Ver información del servicio
                                    </Link>
                                </section>
                            )}
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
});

export const head: DocumentHead = ({ resolveValue }) => {
    const data = resolveValue(useGetProcedure);
    return {
        title: `${data.procedure.title} - Colonia Ensayo`,
        meta: [
            { name: 'description', content: data.procedure.description }
        ]
    };
};
