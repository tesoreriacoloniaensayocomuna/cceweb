import { component$ } from '@builder.io/qwik';
import { routeLoader$, Link, type DocumentHead } from '@builder.io/qwik-city';
import { Header } from '../../components/header/header';
import { Footer } from '../../components/footer/footer';
import { getDb } from '../../database/db';
import { services } from '../../database/schema';
import { desc } from 'drizzle-orm';

export const useGetServices = routeLoader$(async (event) => {
    const db = getDb(event.env);
    return await db.select().from(services).orderBy(desc(services.createdAt));
});

export default component$(() => {
    const servicesData = useGetServices();

    return (
        <>
            <Header />
            <main class="flex-grow pt-24 pb-20 px-margin max-w-7xl mx-auto w-full min-h-[60vh]">
                <div class="mb-12">
                    <h1 class="text-h1 text-primary mb-4">Servicios Comunales</h1>
                    <p class="text-body-lg text-on-surface-variant max-w-2xl">
                        Información detallada sobre los servicios brindados por la Comuna de Colonia Ensayo, incluyendo cuadros tarifarios y cómo solicitarlos.
                    </p>
                </div>

                {servicesData.value.length === 0 ? (
                    <div class="bg-surface-container-lowest p-12 rounded-3xl border border-outline-variant text-center">
                        <span class="material-symbols-outlined text-6xl text-outline mb-4">dry_cleaning</span>
                        <h3 class="text-h3 text-on-surface mb-2">No hay servicios disponibles</h3>
                        <p class="text-on-surface-variant">Vuelve a consultar más tarde para ver la información actualizada.</p>
                    </div>
                ) : (
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {servicesData.value.map(service => (
                            <Link 
                                key={service.id} 
                                href={`/servicios/${service.slug}/`}
                                class="bg-white p-8 rounded-[2rem] border border-outline-variant shadow-sm hover:shadow-xl hover:border-primary/30 transition-all group flex flex-col h-full"
                            >
                                <div class="w-14 h-14 rounded-2xl bg-primary/5 flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-all overflow-hidden shrink-0">
                                    {service.iconUrl?.includes('/') ? (
                                        <img src={service.iconUrl} alt={service.title} class="w-full h-full object-cover" />
                                    ) : (
                                        <span class="material-symbols-outlined text-3xl">{service.iconUrl || 'dry_cleaning'}</span>
                                    )}
                                </div>
                                <h3 class="text-2xl font-black text-on-surface mb-4 group-hover:text-primary transition-colors">{service.title}</h3>
                                <p class="text-on-surface-variant mb-8 line-clamp-3 leading-relaxed flex-grow">
                                    {service.description}
                                </p>
                                <div class="flex items-center gap-2 text-primary font-black uppercase tracking-widest text-sm">
                                    Ver detalles
                                    <span class="material-symbols-outlined transition-transform group-hover:translate-x-2">arrow_forward</span>
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

export const head: DocumentHead = { title: "Servicios - Colonia Ensayo" };
