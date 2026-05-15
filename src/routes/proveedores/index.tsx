import { component$ } from '@builder.io/qwik';
import { routeLoader$ } from '@builder.io/qwik-city';
import { getDb } from '../../database/db';
import { tenders, siteConfig } from '../../database/schema';
import { eq, desc } from 'drizzle-orm';
import { Header } from '../../components/header/header';
import { Footer } from '../../components/footer/footer';

export const useGetPublicTenders = routeLoader$(async (event) => {
    const db = getDb(event.env);
    const list = await db.select().from(tenders).orderBy(desc(tenders.createdAt));
    const config = await db.select().from(siteConfig).where(eq(siteConfig.id, 'main'));
    return {
        list,
        registryUrl: config[0]?.providerRegistryUrl || null,
        providerEmail: config[0]?.providerEmail || "suministros.coloniaensayocomuna@gmail.com"
    };
});

export default component$(() => {
    const data = useGetPublicTenders();

    return (
        <div class="flex flex-col min-h-screen font-['Public_Sans']">
            <Header />
            <main class="flex-grow pt-32 pb-20 bg-surface-container-lowest">
                <div class="max-w-6xl mx-auto px-margin">
                    
                    <div class="mb-16 text-center">
                        <span class="text-primary font-bold uppercase tracking-widest text-xs mb-3 block">Transparencia y Gestión</span>
                        <h1 class="text-5xl font-black text-gray-900 mb-6">Proveedores</h1>
                        <p class="text-body-lg text-gray-600 max-w-2xl mx-auto">
                            Accedé a la información necesaria para trabajar con la Comuna de Colonia Ensayo. 
                            Consultá licitaciones vigentes y descargá el registro oficial.
                        </p>
                    </div>

                    <div class="grid grid-cols-1 lg:grid-cols-12 gap-12">
                        
                        {/* Registro de Proveedores */}
                        <div class="lg:col-span-5">
                            <div class="bg-primary rounded-3xl p-8 text-white shadow-xl shadow-primary/20 sticky top-32">
                                <span class="material-symbols-outlined text-5xl mb-6 text-white">assignment_ind</span>
                                <h2 class="text-3xl font-black mb-4 leading-tight">Registro de Proveedores</h2>
                                <p class="text-white text-sm mb-8 leading-relaxed font-medium">
                                    Para formar parte de nuestra base de datos de proveedores y participar en futuros llamados, 
                                    es requisito obligatorio completar y presentar el siguiente registro.
                                </p>
                                
                                {data.value.registryUrl ? (
                                    <a 
                                        href={data.value.registryUrl} 
                                        target="_blank"
                                        class="bg-white text-primary w-full py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-gray-100 transition-all shadow-lg active:scale-95 mb-6"
                                    >
                                        <span class="material-symbols-outlined font-bold">download</span>
                                        Descargar Registro (PDF)
                                    </a>
                                ) : (
                                    <div class="bg-black/20 p-4 rounded-xl text-xs italic text-center mb-6">
                                        El registro no está disponible para descarga en este momento.
                                    </div>
                                )}

                                <div class="space-y-4 pt-6 border-t border-white/20">
                                    <p class="text-[10px] font-black uppercase tracking-widest opacity-70">Formas de presentación:</p>
                                    <div class="flex items-start gap-3 text-sm">
                                        <span class="material-symbols-outlined text-xl">location_on</span>
                                        <div>
                                            <p class="font-bold">Presencial en sede comunal</p>
                                            <p class="text-white/80 text-xs mt-1">Lunes a Viernes 7:00 a 13:00 hs</p>
                                        </div>
                                    </div>
                                    <div class="flex items-start gap-3 text-sm">
                                        <span class="material-symbols-outlined text-xl">mail</span>
                                        <div>
                                            <p class="font-bold">Por Correo Electrónico</p>
                                            <a href={`mailto:${data.value.providerEmail}`} class="text-white hover:underline text-xs mt-1 break-all">
                                                {data.value.providerEmail}
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Licitaciones Públicas */}
                        <div class="lg:col-span-7">
                            <h3 class="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-2">
                                <span class="material-symbols-outlined text-primary">gavel</span>
                                Licitaciones Públicas
                            </h3>

                            {data.value.list.length === 0 ? (
                                <div class="bg-white p-12 rounded-3xl border border-dashed border-gray-200 text-center text-gray-400">
                                    <span class="material-symbols-outlined text-4xl mb-2">inventory_2</span>
                                    <p>No hay llamados a licitación vigentes en este momento.</p>
                                </div>
                            ) : (
                                <div class="space-y-6">
                                    {data.value.list.map(t => (
                                        <div key={t.id} class="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
                                            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                                                <div>
                                                    <span class="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/5 px-2 py-0.5 rounded">
                                                        Licitación {t.tenderNumber}
                                                    </span>
                                                    <h4 class="text-lg font-bold text-gray-900 mt-2 group-hover:text-primary transition-colors">
                                                        {t.title}
                                                    </h4>
                                                </div>
                                                <div class={`self-start px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                                                    t.status === 'open' ? 'bg-green-100 text-green-700' : 
                                                    t.status === 'closed' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                                                }`}>
                                                    {t.status === 'open' ? 'Vigente' : t.status === 'closed' ? 'Cerrada' : 'Adjudicada'}
                                                </div>
                                            </div>
                                            
                                            {t.description && (
                                                <p class="text-sm text-gray-500 mb-6 line-clamp-2 leading-relaxed">
                                                    {t.description}
                                                </p>
                                            )}

                                            <div class="flex flex-col sm:flex-row items-center justify-between pt-6 border-t border-gray-50 gap-4">
                                                <div class="flex items-center gap-6 text-xs text-gray-400">
                                                    <div class="flex items-center gap-1.5">
                                                        <span class="material-symbols-outlined text-sm">calendar_today</span>
                                                        Apertura: {t.openingDate ? new Date(t.openingDate).toLocaleDateString('es-AR') : 'A confirmar'}
                                                    </div>
                                                </div>
                                                {t.pdfUrl && (
                                                    <a 
                                                        href={t.pdfUrl} 
                                                        target="_blank"
                                                        class="text-sm font-bold text-primary flex items-center gap-2 hover:gap-3 transition-all"
                                                    >
                                                        Descargar Pliego <span class="material-symbols-outlined text-sm">arrow_forward</span>
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    ))}
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
